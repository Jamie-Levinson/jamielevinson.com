'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { ContributionDay } from '@/lib/contributions';
import { createChartGame, HEAD, ROWS, type ChartGame, type GameInput, type GameLevel, type Point } from './chartGame';
import { createBoardy, createBug, type ChartInvite, type Invite, type InviteHost } from './chartInvite';
import { Underline } from './sketch';
import styles from './ContributionField.module.css';

type View = 'calendar' | 'weekday' | 'busiest' | 'play';
type Slot = [col: number, row: number];

const VIEWS: { id: View; label: string }[] = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'weekday', label: 'Weekday' },
  { id: 'busiest', label: 'Busiest' },
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

// Geometry, in CSS pixels.
const TOP = 26; // room above the grid for the hover readout
const LABELS = 20; // room under the grid for month labels
const CELL = 0.8; // cell size as a share of the column pitch
const BLOCK = 0.94; // the same, while cells are terrain in the game
const NARROW = 560; // below this width the row stops shrinking: it keeps SWIPE_PITCH and scrolls sideways
const SWIPE_PITCH = 15; // column pitch while it scrolls (matches the height reserved in the stylesheet)
const PLAY_PITCH = 22; // column pitch for the game on a narrow screen: big enough to see, with a camera on the player

// Motion.
const LAMP_RADIUS = 5.6; // in pitches
const RIPPLE_SPEED = 950; // px per second
const RIPPLE_WIDTH = 46;
const RIPPLE_LIFE = 1.7; // seconds
const GAME_SETTLE = 650; // ms for the cells to fall into terrain before the game starts

const BEST_KEY = 'chart-game-best';
const NUDGED_KEY = 'chart-game-nudged'; // the one-time invitation has been shown
const START_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'Enter', 'a', 'd', 'w']);
const GAME_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'w', 's', 'x', 'j', 'k', 'Enter', 'r', 'Escape']);

const PALETTE = {
  light: {
    ink: '10,10,10',
    paper: '#ffffff',
    rest: [0.045, 0.09, 0.15, 0.22, 0.33],
    lit: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  },
  dark: {
    ink: '237,237,237',
    paper: '#0a0a0a',
    rest: [0.05, 0.1, 0.16, 0.24, 0.36],
    lit: ['#1b2129', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
};

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

const utc = (date: string) => Date.parse(`${date}T00:00:00Z`);

/** Where each day sits in each arrangement, as [column, row] in a 7-row grid, plus the game level. */
function arrange(days: ContributionDay[]) {
  const first = utc(days[0][0]);
  const offset = new Date(first).getUTCDay();
  const calendar: Slot[] = days.map(([date]) => {
    const index = Math.round((utc(date) - first) / DAY_MS) + offset;
    return [Math.floor(index / 7), index % 7];
  });
  const cols = calendar[calendar.length - 1][0] + 1;

  const byCount = (a: number, b: number) => days[b][1] - days[a][1] || a - b;
  const order = days.map((_, i) => i);

  // Each weekday keeps its row; its days pack to the left, busiest first.
  const weekday: Slot[] = new Array(days.length);
  for (let row = 0; row < ROWS; row++) {
    order
      .filter((i) => calendar[i][1] === row)
      .sort(byCount)
      .forEach((i, rank) => (weekday[i] = [rank, row]));
  }

  // Every day ranked by count, filling column by column.
  const busiest: Slot[] = new Array(days.length);
  [...order].sort(byCount).forEach((i, rank) => (busiest[i] = [Math.floor(rank / ROWS), rank % ROWS]));

  // The game level: active days fall to the bottom of their week and become terrain.
  const play: Slot[] = calendar.map((slot) => [slot[0], slot[1]]);
  const tiles = new Int16Array(cols * ROWS).fill(-1);
  for (let col = 0; col < cols; col++) {
    const active = order.filter((i) => calendar[i][0] === col && days[i][1] > 0);
    active.forEach((i, rank) => {
      const row = ROWS - active.length + rank;
      play[i] = [col, row];
      tiles[row * cols + col] = i;
    });
  }

  // One wave per month, sized by that month's contributions: more code, more bugs.
  const totals: { month: number; total: number }[] = [];
  let key = '';
  for (const [date, count] of days) {
    if (date.slice(0, 7) !== key) {
      key = date.slice(0, 7);
      totals.push({ month: Number(date.slice(5, 7)) - 1, total: 0 });
    }
    totals[totals.length - 1].total += count;
  }
  const waves = totals.map(({ month, total }) => ({
    label: MONTHS[month],
    bugs: Math.max(4, Math.min(16, Math.round(total / 26))),
  }));

  // A month is labelled at the first column whose top cell falls in it.
  const months: { col: number; label: string }[] = [];
  let previous = -1;
  for (let col = 0; col < cols; col++) {
    const i = calendar.findIndex((slot) => slot[0] === col);
    const month = new Date(utc(days[i][0])).getUTCMonth();
    if (month !== previous) {
      const crowded = months.length > 0 && col - months[months.length - 1].col < 3;
      if (crowded) months.pop();
      months.push({ col, label: MONTHS[month] });
      previous = month;
    }
  }

  return { slots: { calendar, weekday, busiest, play }, cols, months, tiles, waves };
}

/** A line about each arrangement, with a shorter form for narrow screens. */
function describe(days: ContributionDay[], total: number): Record<View, { long: string; short: string }> {
  const perWeekday = new Array(7).fill(0);
  const first = utc(days[0][0]);
  const offset = new Date(first).getUTCDay();
  let active = 0;
  let peak = 0;
  days.forEach(([date, count]) => {
    perWeekday[(Math.round((utc(date) - first) / DAY_MS) + offset) % 7] += count;
    if (count > 0) active++;
    if (count > peak) peak = count;
  });
  const most = WEEKDAYS[perWeekday.indexOf(Math.max(...perWeekday))];
  const least = WEEKDAYS[perWeekday.indexOf(Math.min(...perWeekday))];
  const count = total.toLocaleString('en');
  const controls = 'Arrows or WASD to move, X or click to shoot, Esc to leave';
  return {
    calendar: { long: `${count} contributions in the last year`, short: `${count} in the last year` },
    weekday: { long: `Most on ${most}s, least on ${least}s`, short: `Most on ${most}s` },
    busiest: {
      long: `${active} of ${days.length} days active, ${peak} on the busiest`,
      short: `${active} of ${days.length} days active`,
    },
    play: { long: controls, short: 'Slide to move, tap Jump' },
  };
}

const readoutDate = new Intl.DateTimeFormat('en', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(score: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private browsing: the score just does not persist.
  }
}

type PadKey = 'left' | 'right' | 'jump';

interface Engine {
  setView(view: View): void;
  /** A touch control went down or up. */
  hold(key: PadKey, down: boolean): void;
}

interface Props {
  days: ContributionDay[];
  total: number;
  /** One way of inviting people to the game (lab). Without it there is only the Play label. */
  invite?: Invite;
  /** Show the one-time invitation every time, for trying it out. */
  replay?: boolean;
}

/**
 * The year of contributions as one row of cells. It rests in grey; a lamp that follows the pointer
 * (from above the chart or below it) shows the real colours, a click sends a ripple through it, and the same cells can rearrange
 * themselves by weekday or by size, or fall into terrain for a small platform shooter.
 *
 * On a phone the row keeps a readable cell size and scrolls sideways, opening on today. There is
 * no pointer to carry the lamp, so swiping does: the lamp crosses the screen as the year scrolls
 * by, and a tap brings it to the finger. The game there is larger than the screen: a camera follows
 * the player, two touch controls move and jump, and a finger on the field shoots where it touches.
 */
export default function ContributionField({ days, total, invite, replay = false }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const leavePlay = useRef(() => {});
  const enterPlay = useRef(() => {});
  const [view, setView] = useState<View>('calendar');
  const [touchPlay, setTouchPlay] = useState(false); // played with touch controls
  const [note, setNote] = useState<string | null>(null); // an invitation's line, in place of the caption

  const model = useMemo(() => arrange(days), [days]);
  const captions = useMemo(() => describe(days, total), [days, total]);

  useEffect(() => {
    leavePlay.current = () => setView('calendar');
    enterPlay.current = () => setView('play');
    const coarse = window.matchMedia('(pointer: coarse)');
    const sync = () => setTouchPlay(coarse.matches);
    sync();
    coarse.addEventListener('change', sync);
    return () => coarse.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const stageElement = stageRef.current;
    const canvasElement = canvasRef.current;
    const context = canvasElement?.getContext('2d');
    if (!stageElement || !canvasElement || !context) return;
    // Typed bindings, so the narrowing survives into the hoisted functions below.
    const stage: HTMLDivElement = stageElement;
    const field = stage.parentElement ?? stage; // the box the stylesheet's container queries measure
    const canvas: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = context;

    const { slots, cols, months, tiles, waves } = model;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    const cells = days.map(([date, count, level]) => ({
      date,
      count,
      level,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      wake: 0,
      light: 0, // how much of its real colour a cell shows
      swell: 0, // how much it grows under the lamp or a ripple
      lift: 0, // extra growth for the hovered cell
      show: 1, // fades out cells that are not part of the game's terrain, or have been destroyed
      eaten: 0, // 1 when a wandering bug has just eaten it; it grows back as this falls to 0
    }));

    let current: View = 'calendar';
    let palette = PALETTE.light;
    let font = 'monospace';
    let pitch = 0;
    let size = 0;
    let narrow = false; // the row scrolls sideways inside the stage
    let bleed = 0; // canvas overhang past the text column on each side (the stage's negative margin)
    let fromEnd = 0; // how far the scrolling row is from showing today, in px
    let width = 0;
    let height = 0;
    let sky = 0; // extra canvas above the grid while the game runs, in px

    let frame = 0;
    let running = false;
    let last = 0;
    const born = performance.now();

    const lamp = { x: 0, y: 0, power: 0 };
    let lampPlaced = false;
    let client: Point | null = null; // last mouse position, in viewport coordinates
    let pointer: Point | null = null; // the same, in field coordinates, while the chart is on screen
    let touch: (Point & { until: number }) | null = null;
    let hover = -1;
    let ripples: (Point & { at: number })[] = [];
    let labelAlpha = 1;
    let ambient = 0; // the rearranged views show every cell in colour
    const readout = { date: '', amount: '', x: 0, alpha: 0 };

    // The game.
    let game: ChartGame | null = null;
    let hp: Uint8Array | null = null;
    let gameFrom = 0; // when the cells have settled and the game may start
    let terrain = 0; // 0..1 blend from chart cells to terrain blocks
    const keys = new Set<string>();
    const pad: Record<PadKey, boolean> = { left: false, right: false, jump: false };
    let jumpPressed = false;
    let confirmPressed = false;
    let mouseDown = false;
    let firePointer = -1; // the pointer that is shooting: one finger aims while others work the controls
    let camera = 0; // the stage's sideways scroll while a narrow game follows the player
    let startAt: Point | undefined; // where the player begins, when an invitation hands the game its place

    // An invitation to the game on the resting chart (see chartInvite.ts).
    let visible = true; // the chart is on screen
    let over = false; // the pointer is on the chart itself
    let inviteTimer = 0;
    let actor: ChartInvite | null = null;

    const place = ([col, row]: Slot) => ({ x: bleed + col * pitch + size / 2, y: TOP + row * pitch + size / 2 });

    // The game's world is in cells; tile (0, 0) is the top-left cell of the chart, centred on it.
    const worldX = (u: number) => bleed + (u - (1 - CELL) / 2) * pitch;
    const worldY = (v: number) => TOP + (v - (1 - CELL) / 2) * pitch;
    const toWorld = (point: Point): Point => ({
      x: (point.x - bleed) / pitch + (1 - CELL) / 2,
      y: (point.y - TOP) / pitch + (1 - CELL) / 2,
    });

    /**
     * Where the lamp sits when nothing is pointing at the chart: on today, or at the start of a
     * ranked arrangement. While the row scrolls, the lamp is its scrubber instead: it crosses the
     * screen from one end of the year to the other as the row is swiped, and so ends up on today.
     */
    const restPoint = () => {
      if (narrow) {
        const span = stage.scrollWidth - stage.clientWidth;
        const progress = span > 0 ? clamp01(stage.scrollLeft / span) : 1;
        const from = place([0, 3]);
        return { x: mix(from.x, place([cols - 1, 3]).x, progress), y: from.y };
      }
      return current === 'calendar' ? place(slots.calendar[cells.length - 1]) : place([1, 3]);
    };

    const retarget = (snap: boolean) => {
      const now = performance.now();
      cells.forEach((cell, i) => {
        const slot = slots[current][i];
        const target = place(slot);
        cell.tx = target.x;
        cell.ty = target.y;
        if (snap) {
          cell.x = target.x;
          cell.y = target.y;
          cell.vx = cell.vy = 0;
        } else {
          cell.wake = now + slot[0] * 7 + slot[1] * 5;
        }
      });
    };

    const measure = () => {
      const inner = field.clientWidth;
      if (inner <= 0) return false;
      narrow = inner < NARROW;
      bleed = Math.max(0, (stage.clientWidth - inner) / 2);
      pitch = narrow ? (current === 'play' ? PLAY_PITCH : SWIPE_PITCH) : inner / (cols - (1 - CELL));
      size = pitch * CELL;
      width = (cols - (1 - CELL)) * pitch + bleed * 2;
      height = TOP + 6 * pitch + size + LABELS;
      return true;
    };

    /**
     * Size the canvas. In the game it grows upward into the empty space above, without moving the
     * page; on a narrow screen there is no such space, so there it simply gets taller.
     */
    const fit = () => {
      sky = current === 'play' ? Math.round(pitch * HEAD) : 0;
      const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round((height + sky) * ratio);
      canvas.style.width = narrow ? `${width}px` : ''; // wider than the stage, which scrolls
      canvas.style.height = `${height + sky}px`;
      canvas.style.marginTop = narrow ? '' : `${-sky}px`;
      stage.toggleAttribute('data-playing', current === 'play'); // the stylesheet stops finger-scrolling during the game
      ctx.setTransform(ratio, 0, 0, ratio, 0, sky * ratio); // y = 0 stays at the top of the chart
    };

    /** The columns on screen: all of them, unless the row is scrolling. */
    const windowCols = () => {
      if (!narrow) return { from: 0, to: cols };
      const from = (stage.scrollLeft - bleed) / pitch + (1 - CELL) / 2;
      return { from: Math.max(0, from), to: Math.min(cols, from + stage.clientWidth / pitch) };
    };

    /**
     * Lay everything out for the current width. The observer also reports changes of height (the
     * game makes a narrow chart taller); those change nothing here, and re-laying out would cut
     * short the cells' glide, so they are ignored.
     */
    let laidOut = '';
    const layout = () => {
      if (!measure()) return;
      const shape = `${field.clientWidth}/${stage.clientWidth}/${window.devicePixelRatio}`;
      if (shape === laidOut) return;
      laidOut = shape;
      fit();
      if (narrow && current !== 'play') stage.scrollLeft = stage.scrollWidth - stage.clientWidth - fromEnd; // stay on the same weeks
      retarget(true);
      if (!lampPlaced) {
        const start = reduced.matches ? restPoint() : place([0, 3]);
        lamp.x = start.x;
        lamp.y = start.y;
        lampPlaced = true;
      }
      locate();
      kick();
    };

    const hit = (x: number, y: number) => {
      const reach = pitch / 2;
      return cells.findIndex((cell) => Math.abs(x - cell.x) <= reach && Math.abs(y - cell.y) <= reach);
    };

    /**
     * Re-derive the pointer's position on the field; scrolling moves the canvas under a still mouse.
     * The pointer counts wherever it is on the page, above the chart or below it, for as long as
     * some of the chart is on screen.
     */
    function locate() {
      pointer = null;
      if (client) {
        const box = canvas.getBoundingClientRect();
        const onScreen = box.bottom > 0 && box.top < window.innerHeight;
        if (onScreen || current === 'play') pointer = { x: client.x - box.left, y: client.y - box.top - sky };
      }
      if (!touch) hover = pointer && current !== 'play' ? hit(pointer.x, pointer.y) : -1;
      const wasOver = over;
      over = pointer !== null && pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
      if (invite === 'keys' && over !== wasOver && current !== 'play') setNote(over ? 'Press Space to play' : null);
    }

    /** Take up an invitation: start the game, from where the actor stands if it has a place. */
    const accept = () => {
      startAt = actor?.start();
      actor?.rest(performance.now());
      enterPlay.current();
    };

    /** Whether a press at this point (field coordinates) lands on the invitation. Fingers get more slack. */
    const onInvitation = (point: Point) => actor !== null && current === 'calendar' && actor.hit(toWorld(point), coarse.matches ? 1.9 : 1.05);

    const roundRect = (x: number, y: number, side: number, corner: number) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, side, side, side * corner);
      else ctx.rect(x, y, side, side);
      ctx.fill();
    };

    function draw(now: number) {
      const still = reduced.matches;
      const playing = current === 'play';
      const dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000));
      last = now;
      let busy = playing;

      // The lamp: at the pointer, at a recent touch, sweeping in on load, or resting on today.
      if (touch && now > touch.until) {
        touch = null;
        locate();
      }
      if (pointer && !touch && !playing) hover = hit(pointer.x, pointer.y);
      const age = now - born;
      const sweep = still ? 1 : clamp01((age - 450) / 1500);
      const bottom = height - LABELS;
      let goal = restPoint();
      let reach = 1;
      if (pointer) {
        // From anywhere on the page the lamp tracks the pointer along the band, fading with distance from it.
        const y = Math.min(bottom, Math.max(TOP, pointer.y));
        const away = clamp01(Math.abs(pointer.y - y) / 420);
        reach = 1 - 0.5 * away * away * (3 - 2 * away);
        goal = { x: pointer.x, y };
      } else if (touch) goal = touch;
      else if (sweep < 1) {
        const from = place([0, 3]);
        const eased = easeInOut(sweep);
        goal = { x: from.x + (goal.x - from.x) * eased, y: from.y + (goal.y - from.y) * eased };
        busy = true;
      }
      const follow = still || (sweep < 1 && !pointer && !touch) ? 1 : 1 - Math.exp(-dt * 9);
      lamp.x += (goal.x - lamp.x) * follow;
      lamp.y += (goal.y - lamp.y) * follow;
      if (Math.hypot(goal.x - lamp.x, goal.y - lamp.y) > 0.3) busy = true;
      const power = playing ? 0 : still || age > 350 ? reach : 0;
      lamp.power += (power - lamp.power) * (still ? 1 : 1 - Math.exp(-dt * 5));
      if (Math.abs(power - lamp.power) > 0.004) busy = true;

      ripples = ripples.filter((ripple) => now - ripple.at < RIPPLE_LIFE * 1000);
      if (ripples.length) busy = true;

      const wantLabels = current === 'calendar' ? 1 : 0;
      labelAlpha += (wantLabels - labelAlpha) * (still ? 1 : 1 - Math.exp(-dt * 8));
      if (Math.abs(wantLabels - labelAlpha) > 0.01) busy = true;
      ambient += (1 - wantLabels - ambient) * (still ? 1 : 1 - Math.exp(-dt * 3.5));
      if (Math.abs(1 - wantLabels - ambient) > 0.004) busy = true;
      terrain += ((playing ? 1 : 0) - terrain) * (still ? 1 : 1 - Math.exp(-dt * 7));
      if (Math.abs((playing ? 1 : 0) - terrain) > 0.004) busy = true;

      ctx.save();
      ctx.clearRect(0, -sky, width, height + sky);
      if (game && game.shake > 0.05) {
        ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
      }

      const radius = Math.max(110, pitch * LAMP_RADIUS);
      const ease = still ? 1 : 1 - Math.exp(-dt * 15);
      const smooth = 0.3; // seconds for a cell to settle into a new slot
      const omega = 2 / smooth;
      const k = omega * dt;
      const decay = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k);
      const cellSide = mix(size, pitch * BLOCK, terrain);
      const corner = mix(0.22, 0.14, terrain);

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const slot = slots.calendar[i];

        // Glide to the slot for the current arrangement (critically damped, so it never overshoots).
        if (cell.x !== cell.tx || cell.y !== cell.ty) {
          if (now >= cell.wake) {
            const dx = cell.x - cell.tx;
            const dy = cell.y - cell.ty;
            const tempX = (cell.vx + omega * dx) * dt;
            const tempY = (cell.vy + omega * dy) * dt;
            cell.vx = (cell.vx - omega * tempX) * decay;
            cell.vy = (cell.vy - omega * tempY) * decay;
            cell.x = cell.tx + (dx + tempX) * decay;
            cell.y = cell.ty + (dy + tempY) * decay;
            if (Math.abs(cell.x - cell.tx) < 0.05 && Math.abs(cell.y - cell.ty) < 0.05) {
              cell.x = cell.tx;
              cell.y = cell.ty;
              cell.vx = cell.vy = 0;
            }
          }
          busy = true;
        }

        // Cells arrive week by week on load.
        const appear = still ? 1 : easeOut(clamp01((age - slot[0] * 9) / 420));
        if (appear < 1) busy = true;

        // In the game only standing blocks are drawn, coloured by the hit points they have left.
        const standing = !playing || (hp ? hp[i] > 0 : cell.count > 0);
        cell.show += ((standing ? 1 : 0) - cell.show) * ease;
        if (Math.abs((standing ? 1 : 0) - cell.show) > 0.004) busy = true;
        const tone = playing && hp ? Math.min(4, hp[i]) : cell.level;

        // Light from the lamp, from ripples, and from being the hovered cell.
        let glow = clamp01(1 - Math.hypot(cell.x - lamp.x, cell.y - lamp.y) / radius);
        glow = glow * glow * (3 - 2 * glow) * lamp.power;
        for (const ripple of ripples) {
          const seconds = (now - ripple.at) / 1000;
          const gap = Math.hypot(cell.x - ripple.x, cell.y - ripple.y) - seconds * RIPPLE_SPEED;
          const wave = Math.exp(-(gap * gap) / (2 * RIPPLE_WIDTH * RIPPLE_WIDTH)) * (1 - seconds / RIPPLE_LIFE);
          if (wave > glow) glow = wave;
        }
        const lifted = i === hover ? 1 : 0;
        if (lifted) glow = 1;
        const colour = Math.max(glow, ambient);
        cell.light += (colour - cell.light) * ease;
        cell.swell += (glow - cell.swell) * ease;
        cell.lift += (lifted - cell.lift) * ease;
        if (
          Math.abs(colour - cell.light) > 0.004 ||
          Math.abs(glow - cell.swell) > 0.004 ||
          Math.abs(lifted - cell.lift) > 0.004
        ) {
          busy = true;
        }

        // A cell a bug has eaten is gone for a moment, then grows back.
        if (cell.eaten > 0) {
          cell.eaten = Math.max(0, cell.eaten - dt / 3.4);
          busy = true;
        }
        const regrown = playing ? 1 : 1 - clamp01(cell.eaten / 0.45) ** 2;
        const side = cellSide * appear * cell.show * regrown * (1 + (0.16 * cell.swell + 0.2 * cell.lift) * (1 - terrain));
        if (side <= 0.2) continue;
        const left = cell.x - side / 2;
        const top = cell.y - side / 2;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgba(${palette.ink},${palette.rest[tone]})`;
        roundRect(left, top, side, corner);
        if (cell.light > 0.004) {
          ctx.globalAlpha = Math.min(1, cell.light);
          ctx.fillStyle = palette.lit[tone];
          roundRect(left, top, side, corner);
        }
      }

      // Month labels, only meaningful in the calendar arrangement.
      ctx.textBaseline = 'alphabetic';
      if (labelAlpha > 0.01) {
        ctx.font = `10px ${font}`;
        ctx.textAlign = 'left';
        ctx.globalAlpha = 0.45 * labelAlpha * (still ? 1 : clamp01((age - 500) / 600));
        ctx.fillStyle = `rgb(${palette.ink})`;
        for (const month of months) {
          const origin = place([month.col, 6]);
          ctx.fillText(month.label, origin.x - size / 2, origin.y + size / 2 + 14);
        }
        if (age < 1100 && !still) busy = true;
      }

      // The hovered day, set just above the grid.
      if (hover >= 0) {
        const cell = cells[hover];
        readout.date = `${readoutDate.format(utc(cell.date))}  `;
        readout.amount = cell.count === 0 ? 'No contributions' : `${cell.count} contribution${cell.count === 1 ? '' : 's'}`;
        readout.x = cell.x;
      }
      const wantReadout = hover >= 0 ? 1 : 0;
      readout.alpha += (wantReadout - readout.alpha) * (still ? 1 : 1 - Math.exp(-dt * 16));
      if (Math.abs(wantReadout - readout.alpha) > 0.01) busy = true;
      if (readout.alpha > 0.01) {
        ctx.font = `11px ${font}`;
        const lead = ctx.measureText(readout.date).width;
        const half = (lead + ctx.measureText(readout.amount).width) / 2;
        const from = narrow ? stage.scrollLeft : 0; // the part of the row on screen
        const to = (narrow ? from + stage.clientWidth : width) - (invite === 'boardy' ? pitch * 2.2 : 0); // Boardy stands at the end
        const x = Math.min(to - bleed - half, Math.max(from + bleed + half, readout.x)) - half;
        ctx.textAlign = 'left';
        ctx.fillStyle = `rgb(${palette.ink})`;
        ctx.globalAlpha = 0.5 * readout.alpha;
        ctx.fillText(readout.date, x, TOP - 10);
        ctx.globalAlpha = readout.alpha;
        ctx.fillText(readout.amount, x + lead, TOP - 10);
      }
      ctx.globalAlpha = 1;

      const sprites = { x: worldX, y: worldY, unit: pitch, ink: `rgb(${palette.ink})`, paper: palette.paper, font, greens: palette.lit };

      // An invitation on the resting chart. It runs only while it can be seen, and asks for frames only while it moves.
      if (actor && visible && current === 'calendar' && !still) {
        const idle = actor.update(now, pointer ? toWorld(pointer) : null);
        actor.draw(ctx, sprites);
        if (idle === 0) busy = true;
        else {
          window.clearTimeout(inviteTimer);
          inviteTimer = window.setTimeout(kick, idle);
        }
        canvas.style.cursor = actor.cursor;
        if (invite === 'nudge') setNote(actor.caption);
      }

      // On a narrow screen the world is wider than the screen: the camera keeps the player in the middle.
      if (game && narrow) {
        const want = Math.min(stage.scrollWidth - stage.clientWidth, Math.max(0, worldX(game.focus.x) - stage.clientWidth / 2));
        camera += (want - camera) * (still ? 1 : 1 - Math.exp(-dt * 9));
        stage.scrollLeft = camera;
      }

      // The game runs on top of the terrain once the cells have fallen into place.
      if (game && now >= gameFrom) {
        const held = (...names: string[]) => names.some((name) => keys.has(name));
        const seen = windowCols();
        // By touch there is no fire button: a finger on the field shoots at that spot, like the mouse.
        const input: GameInput = {
          left: held('ArrowLeft', 'a') || pad.left,
          right: held('ArrowRight', 'd') || pad.right,
          jump: held('ArrowUp', 'w', ' ') || pad.jump,
          jumpPressed,
          down: held('ArrowDown', 's'),
          fire: mouseDown || held('x', 'j', 'k'),
          aim: mouseDown && pointer ? toWorld(pointer) : null,
          pointer: pointer && !coarse.matches ? toWorld(pointer) : null,
          confirm: confirmPressed,
        };
        jumpPressed = confirmPressed = false;
        const bestBefore = game.best;
        game.update(dt, input);
        if (game.best > bestBefore) writeBest(game.best);
        game.draw(ctx, { ...sprites, from: seen.from, to: seen.to, touch: coarse.matches });
      }
      ctx.restore();

      if (busy) frame = requestAnimationFrame(draw);
      else running = false;
    }

    function kick() {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(draw);
    }

    const readTheme = () => {
      palette = document.documentElement.classList.contains('dark') ? PALETTE.dark : PALETTE.light;
      kick();
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const wasInside = pointer !== null;
      client = { x: event.clientX, y: event.clientY };
      locate();
      if (pointer || wasInside) kick(); // nothing to redraw while the mouse is elsewhere on the page
    };
    const onGone = () => {
      client = null;
      mouseDown = false;
      keys.clear();
      locate();
      kick();
    };
    const onScroll = () => {
      if (!client) return;
      const wasInside = pointer !== null;
      locate();
      if (pointer || wasInside) kick();
    };
    /** The row scrolled sideways: remember where, and let the lamp follow (see restPoint). */
    const onPan = () => {
      if (current === 'play') return; // the camera is doing it
      fromEnd = Math.max(0, stage.scrollWidth - stage.clientWidth - stage.scrollLeft);
      if (touch) {
        touch = null; // a tapped day gives the lamp back once the row moves
        hover = -1;
      }
      if (client) locate();
      kick();
    };
    const fieldPoint = (event: { clientX: number; clientY: number }): Point => {
      const box = canvas.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top - sky };
    };
    /** A finger on the chart: light it there and read out the day under it. */
    const touchAt = (point: Point) => {
      touch = { ...point, until: performance.now() + 2600 };
      hover = hit(point.x, point.y);
      kick();
    };
    const onDrag = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      if (current === 'play') {
        // A finger held on the field keeps aiming where it is.
        if (mouseDown && event.pointerId === firePointer) {
          client = { x: event.clientX, y: event.clientY };
          locate();
        }
        return;
      }
      // While the row scrolls, a moving finger is scrolling it.
      if (!narrow) touchAt(fieldPoint(event));
    };
    let downWith = '';
    const onDown = (event: PointerEvent) => {
      downWith = event.pointerType;
      if (current === 'play') {
        if (event.button === 0) {
          mouseDown = true;
          firePointer = event.pointerId;
        }
        if (event.pointerType === 'touch') {
          client = { x: event.clientX, y: event.clientY }; // shoot at the finger
          locate();
        }
        event.preventDefault(); // no text selection while shooting
        return;
      }
      if (event.pointerType === 'touch') return; // may be the start of a scroll; onTap handles a real tap
      const point = fieldPoint(event);
      if (onInvitation(point)) return accept();
      if (!reduced.matches) ripples.push({ ...point, at: performance.now() });
      kick();
    };
    const onTap = (event: MouseEvent) => {
      if (downWith !== 'touch' || current === 'play') return;
      const point = fieldPoint(event);
      if (onInvitation(point)) return accept();
      if (!reduced.matches) ripples.push({ ...point, at: performance.now() });
      touchAt(point);
    };

    /** With the `keys` invitation, a game key pressed while the pointer is on the chart starts the game. */
    const onStartKey = (event: KeyboardEvent) => {
      if (current === 'play' || !over || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (!START_KEYS.has(key)) return;
      event.preventDefault();
      setNote(null);
      enterPlay.current();
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId !== firePointer) return; // some other finger
      mouseDown = false;
      firePointer = -1;
      if (event.pointerType === 'touch' && current === 'play') {
        client = null; // a lifted finger aims at nothing
        locate();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (!GAME_KEYS.has(key)) return;
      event.preventDefault(); // keep arrows and space from scrolling the page
      if (key === 'Escape') {
        leavePlay.current();
        return;
      }
      if (!event.repeat) {
        if (key === 'ArrowUp' || key === 'w' || key === ' ') jumpPressed = true;
        if (key === 'Enter' || key === 'r') confirmPressed = true;
      }
      keys.add(key);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    };

    const startGame = () => {
      const level: GameLevel = {
        cols,
        tiles,
        hp: Uint8Array.from(cells, (cell) => (cell.count > 0 ? Math.max(1, cell.level) : 0)),
        waves,
      };
      hp = level.hp;
      // On a narrow screen only part of the year is in view, so bugs arrive from just outside it.
      const spawnWithin = narrow ? Math.max(8, stage.clientWidth / PLAY_PITCH / 2 + 3) : undefined;
      game = createChartGame(level, readBest(), Math.random, { start: startAt, spawnWithin });
      startAt = undefined;
      camera = stage.scrollLeft;
      actor?.rest(performance.now());
      setNote(null);
      gameFrom = performance.now() + (reduced.matches ? 0 : GAME_SETTLE);
      hover = -1;
      touch = null;
      ripples = [];
      keys.clear();
      jumpPressed = confirmPressed = mouseDown = false;
      pad.left = pad.right = pad.jump = false;
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      canvas.style.cursor = coarse.matches ? '' : 'crosshair';
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); // so Space does not re-press Play
      // Bring the game into view; on a narrow screen the middle of it, so the controls under it show too.
      window.requestAnimationFrame(() => stage.scrollIntoView({ block: narrow ? 'center' : 'nearest', behavior: reduced.matches ? 'auto' : 'smooth' }));
    };

    const stopGame = () => {
      game = null;
      hp = null;
      keys.clear();
      mouseDown = false;
      pad.left = pad.right = pad.jump = false;
      fromEnd = 0; // the row goes back to today
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.style.cursor = '';
    };

    font = getComputedStyle(canvas).fontFamily || font;
    readTheme();
    layout();

    const resize = new ResizeObserver(layout);
    resize.observe(stage);
    const theme = new MutationObserver(readTheme);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    document.fonts?.ready.then(kick);

    // The invitation, if any. A wandering bug or a waiting Boardy is an actor on the chart; the
    // one-time bug is shown once per visitor (every time with `replay`).
    const host: InviteHost = {
      cellAt: (col, row) => (row < 0 || row >= ROWS ? -1 : slots.calendar.findIndex((slot) => slot[0] === col && slot[1] === row)),
      active: (cell) => cells[cell].count > 0,
      slot: (cell) => slots.calendar[cell],
      window: windowCols,
      bite: (cell) => {
        cells[cell].eaten = 1;
      },
      today: cells.length - 1,
    };
    if (invite === 'bug') actor = createBug(host, false);
    if (invite === 'boardy') actor = createBoardy(host);
    if (invite === 'nudge') {
      let shown = false;
      try {
        shown = !replay && window.localStorage.getItem(NUDGED_KEY) === '1';
        window.localStorage.setItem(NUDGED_KEY, '1');
      } catch {
        // Private browsing: it may show again next time.
      }
      if (!shown) actor = createBug(host, true);
    }
    if (invite === 'keys') window.addEventListener('keydown', onStartKey);
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    watcher.observe(canvas);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('blur', onGone);
    document.documentElement.addEventListener('pointerleave', onGone);
    stage.addEventListener('scroll', onPan, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onDrag);
    canvas.addEventListener('click', onTap);

    engine.current = {
      setView(next) {
        if (next === current) return;
        const previous = current;
        current = next;
        if (previous === 'play') stopGame();
        measure(); // the game has its own scale on a narrow screen
        fit();
        if (next === 'play') startGame();
        else {
          actor?.rest(performance.now()); // it belongs to the resting calendar, and comes back there
          canvas.style.cursor = '';
          if (narrow) {
            // The calendar ends on today; the ranked arrangements start with the busiest days.
            const left = next === 'calendar' ? stage.scrollWidth : 0;
            stage.scrollTo({ left, behavior: reduced.matches ? 'auto' : 'smooth' });
          }
        }
        locate();
        retarget(reduced.matches);
        kick();
      },
      hold(key, down) {
        if (down && !pad[key]) {
          if (key === 'jump') jumpPressed = true;
          confirmPressed = true; // any press starts again once the game is over
        }
        pad[key] = down;
      },
    };

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(inviteTimer);
      window.removeEventListener('keydown', onStartKey);
      watcher.disconnect();
      stopGame();
      resize.disconnect();
      theme.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('blur', onGone);
      document.documentElement.removeEventListener('pointerleave', onGone);
      stage.removeEventListener('scroll', onPan);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onDrag);
      canvas.removeEventListener('click', onTap);
      engine.current = null;
    };
  }, [days, model, invite, replay]);

  useEffect(() => {
    engine.current?.setView(view);
  }, [view]);

  const playing = view === 'play';
  const loud = invite === 'label' && !playing;
  const caption =
    playing && touchPlay
      ? { long: 'Slide to move, tap Jump, touch the field to shoot there.', short: 'Touch the field to shoot there.' }
      : captions[view];

  return (
    <div className={styles.field}>
      <div ref={stageRef} className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={`GitHub contribution chart: ${captions.calendar.long}.`} />
      </div>
      <div className={styles.caption}>
        <div className={styles.views} role="group" aria-label="Arrange the chart">
          {VIEWS.map(({ id, label }) => (
            <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            className={loud ? `${styles.play} ${styles.loud}` : styles.play}
            aria-pressed={playing}
            onClick={() => setView(playing ? 'calendar' : 'play')}
          >
            {loud && <BoxIcon />}
            <span className={styles.playWord}>
              {playing ? 'Quit' : 'Play'}
              {loud && <Underline seed={77} />}
            </span>
          </button>
        </div>
        {note && !playing ? (
          // An invitation's line stands in for the caption, and is itself a way in.
          <button type="button" className={styles.note} onClick={() => setView('play')}>
            {note}
          </button>
        ) : (
          <p className={styles.stat} aria-live="polite">
            <span className={styles.long}>{caption.long}</span>
            <span className={styles.short}>{caption.short}</span>
          </p>
        )}
      </div>
      {playing && touchPlay && <Pad hold={(key, down) => engine.current?.hold(key, down)} />}
    </div>
  );
}

/** The player's box, small, for the Play label. */
function BoxIcon() {
  return (
    <svg className={styles.boxIcon} viewBox="0 0 12 12" aria-hidden focusable="false">
      <rect width="12" height="12" rx="1.6" fill="#e3b078" />
      <rect width="2" height="12" rx="0.6" fill="#c8925c" />
      <rect x="4.6" y="3.4" width="1.5" height="2.1" rx="0.75" fill="#1d2433" />
      <rect x="8.2" y="3.4" width="1.5" height="2.1" rx="0.75" fill="#1d2433" />
      <path d="M4.2 7.6 Q7 9.8 9.9 7.4" fill="none" stroke="#1d2433" strokeWidth="0.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Touch controls for the game: a rocker to move (the thumb can slide from one side to the other
 * without lifting) and a button to jump. Each tracks its own finger, so both work at once.
 */
function Pad({ hold }: { hold(key: PadKey, down: boolean): void }) {
  const [side, setSide] = useState<'left' | 'right' | null>(null);
  const [jumping, setJumping] = useState(false);

  const steer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const next = event.clientX < box.left + box.width / 2 ? 'left' : 'right';
    hold('left', next === 'left');
    hold('right', next === 'right');
    setSide(next);
  };
  const release = () => {
    hold('left', false);
    hold('right', false);
    setSide(null);
  };
  const jump = (down: boolean) => {
    hold('jump', down);
    setJumping(down);
  };

  return (
    <div className={styles.pad} onContextMenu={(event) => event.preventDefault()}>
      <div
        className={styles.rocker}
        role="group"
        aria-label="Move"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          steer(event);
        }}
        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && steer(event)}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <span data-on={side === 'left'} aria-hidden>
          <Arrow flip />
        </span>
        <span data-on={side === 'right'} aria-hidden>
          <Arrow />
        </span>
      </div>
      <button
        type="button"
        className={styles.jump}
        data-on={jumping}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          jump(true);
        }}
        onPointerUp={() => jump(false)}
        onPointerCancel={() => jump(false)}
        onLostPointerCapture={() => jump(false)}
      >
        Jump
      </button>
    </div>
  );
}

function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" style={flip ? { transform: 'scaleX(-1)' } : undefined} focusable="false">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
