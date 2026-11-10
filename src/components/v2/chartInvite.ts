/**
 * Invitations to the game: something on the resting chart that makes it plain there is one.
 *
 *  - a bug: now and then one square wakes up, turns orange, grows eyes and wanders the chart eating
 *    squares; clicking it starts the game (`bug`). The same bug can instead drop in once, shortly
 *    after the first visit (`nudge`).
 *  - Boardy: the player's box waits on top of today's column, blinking and hopping; clicking it
 *    starts the game with it where it stands (`boardy`).
 *
 * Like the game, this is simulation plus canvas drawing in cell units, and knows nothing of the DOM.
 * It asks for frames only while something moves; between events it says how long it can be left.
 */

import { drawBox, drawBug, type GameView, type Point } from './chartGame';

/** The ways of inviting. `keys` and `label` need no actor here; the chart handles them itself. */
export type Invite = 'bug' | 'boardy' | 'keys' | 'label' | 'nudge';

export interface InviteHost {
  /** The day cell at a place in the calendar arrangement, or -1 where the year has none. */
  cellAt(col: number, row: number): number;
  /** Whether that day has any contributions (a coloured square). */
  active(cell: number): boolean;
  /** Where a cell sits in the calendar arrangement. */
  slot(cell: number): [col: number, row: number];
  /** The columns on screen. */
  window(): { from: number; to: number };
  /** Eat a cell: it vanishes, then grows back. */
  bite(cell: number): void;
  /** Today's cell. */
  today: number;
}

export interface ChartInvite {
  /**
   * Advance to `now` (ms). `pointer` is in cells. Returns 0 if it needs the very next frame,
   * otherwise how many ms it can be left alone.
   */
  update(now: number, pointer: Point | null): number;
  draw(ctx: CanvasRenderingContext2D, view: GameView): void;
  /** Would a press at this point, with this much slack (in cells), take the invitation? */
  hit(point: Point, reach: number): boolean;
  /** Where the player begins if the invitation is taken, when that matters. */
  start(): Point | undefined;
  /** Put it away (the arrangement changed, or the game began). It comes back later. */
  rest(now: number): void;
  readonly cursor: string;
  /** A line for the chart's caption while the invitation stands. */
  readonly caption: string | null;
}

const BUG_SIZE = 0.7;
const CELL_INSET = 0.1; // a cell covers the middle 0.8 of its tile
const between = (random: () => number, low: number, high: number) => low + random() * (high - low);
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : 1 - (1 - t) ** 3);

/** A bug loose on the chart. With `once` it drops in a single time and never returns. */
export function createBug(host: InviteHost, once: boolean, random: () => number = Math.random): ChartInvite {
  type Phase = 'wait' | 'hatch' | 'drop' | 'roam' | 'leave' | 'gone';
  const LIFE = once ? 24_000 : 15_000;
  const HOP = 230; // ms in the air between two cells

  let phase: Phase = 'wait';
  let until = -1; // when the wait ends; set on the first update
  let since = 0; // when the current phase began
  let born = 0;
  let at: [number, number] = [0, 0]; // the cell it is on (or leaving)
  let to: [number, number] | null = null; // the cell it is hopping to
  let hopAt = 0;
  let nextHop = 0;
  let heading: [number, number] = [1, 0];
  let near = false;
  let look = 1;
  const position = { x: 0, y: 0, scale: 0 };

  const firstWait = () => (once ? 6_000 : 4_200);

  function pickCell(): number {
    const { from, to: end } = host.window();
    const candidates: number[] = [];
    const fallback: number[] = [];
    for (let col = Math.max(0, Math.ceil(from) + 1); col < Math.floor(end) - 1; col++) {
      for (let row = 0; row < 7; row++) {
        const cell = host.cellAt(col, row);
        if (cell < 0) continue;
        (host.active(cell) ? candidates : fallback).push(cell);
      }
    }
    const pool = candidates.length ? candidates : fallback;
    return pool.length ? pool[Math.floor(random() * pool.length)] : host.today;
  }

  function chooseHop(): [number, number] | null {
    const options: [number, number][] = [];
    const tryStep = (dx: number, dy: number, weight: number) => {
      if (host.cellAt(at[0] + dx, at[1] + dy) < 0) return;
      for (let i = 0; i < weight; i++) options.push([dx, dy]);
    };
    tryStep(heading[0], heading[1], 5); // mostly straight on
    tryStep(1, 0, 2);
    tryStep(-1, 0, 2);
    tryStep(0, 1, 1);
    tryStep(0, -1, 1);
    if (!options.length) return null;
    const step = options[Math.floor(random() * options.length)];
    heading = step;
    return [at[0] + step[0], at[1] + step[1]];
  }

  const eat = () => {
    const cell = host.cellAt(at[0], at[1]);
    if (cell >= 0) host.bite(cell);
  };

  return {
    update(now, pointer) {
      if (until < 0) until = now + firstWait();
      if (phase === 'gone') return 3_600_000;

      if (phase === 'wait') {
        if (now < until) return until - now;
        const cell = pickCell();
        at = host.slot(cell);
        to = null;
        born = since = now;
        if (once) {
          phase = 'drop';
        } else {
          phase = 'hatch';
        }
      }

      const centre = { x: at[0] + 0.5, y: at[1] + 0.5 };
      let lift = 0;
      position.scale = 1;

      if (phase === 'hatch') {
        // The square shivers, then is a bug.
        const t = (now - since) / 650;
        position.scale = 0.6 + 0.4 * ease(t) + (t < 1 ? Math.sin(now / 28) * 0.05 : 0);
        if (t >= 1) {
          phase = 'roam';
          nextHop = now + 500;
          eat();
        }
      } else if (phase === 'drop') {
        // Falls in from above the chart and lands on its square.
        const t = (now - since) / 520;
        lift = (1 - Math.min(1, t) ** 2) * (at[1] + 3.2);
        if (t >= 1) {
          phase = 'roam';
          nextHop = now + 700;
          eat();
        }
      } else if (phase === 'roam') {
        if (to) {
          const t = (now - hopAt) / HOP;
          if (t >= 1) {
            at = to;
            to = null;
            centre.x = at[0] + 0.5;
            centre.y = at[1] + 0.5;
            eat();
            nextHop = now + between(random, 380, 760);
          } else {
            centre.x += (to[0] - at[0]) * t;
            centre.y += (to[1] - at[1]) * t;
            lift = Math.sin(Math.PI * t) * 0.32;
          }
        } else if (now >= nextHop) {
          // With the pointer close it holds still, so it is easy to click.
          if (near) nextHop = now + 250;
          else if (now - born > LIFE) {
            phase = 'leave';
            since = now;
          } else {
            to = chooseHop();
            hopAt = now;
            if (!to) nextHop = now + 400;
          }
        }
        if (!to) position.scale = 1 + Math.sin(now / 170) * 0.035; // breathing
      } else if (phase === 'leave') {
        const t = (now - since) / 380;
        position.scale = 1 - ease(t);
        if (t >= 1) {
          phase = once ? 'gone' : 'wait';
          until = now + between(random, 7_000, 12_000);
          near = false;
          return phase === 'gone' ? 3_600_000 : until - now;
        }
      }

      position.x = centre.x;
      position.y = centre.y - lift;
      const distance = pointer ? Math.hypot(pointer.x - position.x, pointer.y - position.y) : Infinity;
      near = distance < 2.6;
      look = pointer && distance < 12 ? Math.max(-1, Math.min(1, (pointer.x - position.x) / 2)) : heading[0];
      return 0;
    },

    draw(ctx, view) {
      if (phase === 'wait' || phase === 'gone') return;
      const size = BUG_SIZE * position.scale;
      drawBug(ctx, view, { x: position.x - size / 2, y: position.y - size / 2, size, kind: 'crawler', look });
    },

    hit(point, reach) {
      if (phase === 'wait' || phase === 'gone' || phase === 'leave') return false;
      return Math.hypot(point.x - position.x, point.y - position.y) < reach;
    },

    start: () => undefined,

    rest(now) {
      if (phase === 'gone') return;
      phase = once ? 'gone' : 'wait';
      until = now + between(random, 6_000, 9_000);
      near = false;
    },

    get cursor() {
      return near && phase !== 'wait' && phase !== 'gone' ? 'crosshair' : '';
    },

    get caption() {
      return once && phase !== 'wait' && phase !== 'gone' ? 'A bug got in. Play?' : null;
    },
  };
}

const BOX_SIZE = 0.72;

/** Boardy waiting on top of today's column. */
export function createBoardy(host: InviteHost, random: () => number = Math.random): ChartInvite {
  const [col] = host.slot(host.today);
  const home = { x: col + 0.5 - BOX_SIZE / 2, y: CELL_INSET - BOX_SIZE }; // standing on the column's top square

  let arrived = -1; // when it drops in; set on the first update, and again after a rest
  let blinkAt = 0;
  let hopAt = 0;
  let near = false;
  let facing: 1 | -1 = -1;
  let lift = 0;
  let blink = false;
  let shown = false;

  const HOP = 460;
  const BLINK = 130;

  return {
    update(now, pointer) {
      if (arrived < 0) {
        arrived = now + 1_700; // after the chart has drawn itself
        blinkAt = arrived + between(random, 1_500, 3_000);
        hopAt = arrived + between(random, 4_000, 6_000);
      }
      if (now < arrived) return arrived - now;
      shown = true;

      const centre = { x: home.x + BOX_SIZE / 2, y: home.y + BOX_SIZE / 2 };
      const distance = pointer ? Math.hypot(pointer.x - centre.x, pointer.y - centre.y) : Infinity;
      near = distance < 1.5;
      if (pointer && distance < 14) facing = pointer.x < centre.x ? -1 : 1;

      let moving = false;
      lift = 0;

      // Drops in from above, with a small bounce.
      const fall = (now - arrived) / 560;
      if (fall < 1) {
        lift = (1 - fall ** 2) * 2.4;
        moving = true;
      }

      if (now >= hopAt) {
        const t = (now - hopAt) / HOP;
        if (t >= 1) hopAt = now + between(random, 4_500, 7_500);
        else {
          lift = Math.sin(Math.PI * t) * 0.55;
          moving = true;
        }
      }
      if (near) {
        lift += Math.abs(Math.sin(now / 150)) * 0.14; // eager
        moving = true;
      }

      blink = now >= blinkAt && now < blinkAt + BLINK;
      if (now >= blinkAt + BLINK) blinkAt = now + between(random, 2_400, 4_600);
      if (blink) moving = true;

      if (moving) return 0;
      return Math.max(16, Math.min(blinkAt, hopAt) - now);
    },

    draw(ctx, view) {
      if (!shown) return;
      const y = home.y - lift;
      drawBox(ctx, view, { x: home.x, y, size: BOX_SIZE, facing, blink });
      if (near) {
        ctx.font = `10px ${view.font}`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'right';
        ctx.fillStyle = view.ink;
        ctx.globalAlpha = 0.6;
        ctx.fillText('play?', view.x(home.x) - 5, view.y(home.y + BOX_SIZE / 2));
        ctx.globalAlpha = 1;
        ctx.textBaseline = 'alphabetic';
      }
    },

    hit(point, reach) {
      if (!shown) return false;
      return Math.hypot(point.x - (home.x + BOX_SIZE / 2), point.y - (home.y + BOX_SIZE / 2)) < reach;
    },

    start: () => ({ x: home.x, y: home.y - lift }),

    rest() {
      arrived = -1; // it drops in again when the chart is next at rest
      shown = false;
      near = false;
    },

    get cursor() {
      return near && shown ? 'pointer' : '';
    },

    caption: null,
  };
}
