/**
 * A small platform shooter played on the contribution chart.
 *
 * The world is measured in cells: x runs 0..cols across the year, y runs from -HEAD (top of the sky)
 * through 0 (top of the chart) to ROWS (the floor). Active days are solid blocks whose hit points
 * are their GitHub level. Each month is a wave, and busier months send more bugs.
 *
 * This file is pure simulation plus canvas drawing. It knows nothing about React or the DOM.
 */

export const ROWS = 7;
export const HEAD = 4; // rows of open sky above the chart

/** Everything worth tweaking. Distances are in cells, times in seconds. */
export const TUNING = {
  step: 1 / 120, // fixed simulation step
  gravity: 62,
  maxFall: 38,
  player: {
    size: 0.72,
    run: 10,
    accel: 120,
    airAccel: 75,
    friction: 95,
    jump: 17.5, // launch speed; peak height is jump² / (2 × gravity) ≈ 2.5 cells
    jumpCut: 7, // releasing jump early caps the upward speed at this
    coyote: 0.09, // grace period to jump after walking off a ledge
    buffer: 0.11, // a jump pressed this long before landing still counts
    hp: 3,
    invulnerable: 1.1,
    knockback: 9,
  },
  gun: { rate: 8, speed: 36, size: 0.22, life: 1.1, recoil: 0.6 },
  crawler: { size: 0.7, speed: 3.1, accel: 40, jump: 15.5, hp: 2, chew: 0.45, score: 10 },
  flyer: { size: 0.56, speed: 3.6, turn: 2.4, bob: 1.2, hp: 1, score: 15 },
  wave: {
    pause: 1.6, // banner between waves
    gap: 1.5, // time between spawns in the first wave
    gapDrop: 0.08, // each wave spawns this much faster
    minGap: 0.45,
    maxAlive: 9,
    flyerShare: 0.22,
    speedUp: 0.035, // bugs get this much faster each wave
  },
};

export interface Point {
  x: number;
  y: number;
}

export interface GameLevel {
  cols: number;
  /** cols × ROWS, row-major: the cell occupying each tile, or -1. */
  tiles: Int16Array;
  /** Hit points per cell; 0 means gone. The chart reads this to draw damage. */
  hp: Uint8Array;
  waves: { label: string; bugs: number }[];
}

export interface GameInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** True for the frame the jump key went down. */
  jumpPressed: boolean;
  down: boolean;
  fire: boolean;
  /** Where to shoot, in world cells, when firing with the mouse or a finger. Null fires the way the player faces. */
  aim: Point | null;
  pointer: Point | null;
  /** True for the frame Enter went down. */
  confirm: boolean;
}

export interface GameView {
  x(u: number): number;
  y(v: number): number;
  unit: number; // pixels per cell
  ink: string;
  paper: string;
  font: string;
  greens: string[];
  /** The columns on screen, when the world is wider than the screen and a camera follows the player. */
  from?: number;
  to?: number;
  /** Played by touch: the hints name taps, not keys. */
  touch?: boolean;
}

export interface GameOptions {
  /** Where the player begins (top-left, in cells) instead of dropping in at the middle. */
  start?: Point;
  /** Bugs arrive no further than this many columns from the player, for when only part of the world is on screen. */
  spawnWithin?: number;
}

export type GameState = 'ready' | 'between' | 'playing' | 'over' | 'won';

export interface ChartGame {
  readonly state: GameState;
  readonly score: number;
  readonly best: number;
  /** Screen shake, in pixels, for the host to apply to the whole scene. */
  readonly shake: number;
  /** The centre of the player, for a camera to follow. */
  readonly focus: Point;
  update(dt: number, input: GameInput): void;
  draw(ctx: CanvasRenderingContext2D, view: GameView): void;
}

interface Body extends Point {
  w: number;
  h: number;
  vx: number;
  vy: number;
  ground: boolean;
}

interface Player extends Body {
  facing: 1 | -1;
  hp: number;
  hurt: number;
  coyote: number;
  buffer: number;
  cooldown: number;
}

interface Bug extends Body {
  kind: 'crawler' | 'flyer';
  hp: number;
  blocked: number;
  phase: number;
  flash: number;
}

interface Shot extends Point {
  vx: number;
  vy: number;
  life: number;
}

interface Spark extends Point {
  vx: number;
  vy: number;
  life: number;
  span: number;
  size: number;
  /** 0 ink, 1–4 a chart green, 5 crawler, 6 flyer. */
  tone: number;
}

// GitHub's Halloween contribution palette, so the bugs read as part of the chart's world.
const BUG = { crawler: '#fe9600', flyer: '#ffc501', eye: '#03001c' };
// The player is Boardy's cardboard box head.
const BOX = { front: '#e3b078', side: '#c8925c', face: '#1d2433' };

/** A filled rounded box in world cells. */
function fillBox(ctx: CanvasRenderingContext2D, view: GameView, x: number, y: number, w: number, h: number, round = 0.2) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(view.x(x), view.y(y), w * view.unit, h * view.unit, Math.min(w, h) * view.unit * round);
  else ctx.rect(view.x(x), view.y(y), w * view.unit, h * view.unit);
  ctx.fill();
}

export interface BugSprite extends Point {
  size: number;
  kind: 'crawler' | 'flyer';
  /** Which way the eyes look, -1 to 1. */
  look: number;
  /** Drawn in ink for the moment it is hit. */
  flash?: boolean;
}

/** A bug: a block in one of the chart's Halloween colours, with two eyes. Also drawn on the resting chart. */
export function drawBug(ctx: CanvasRenderingContext2D, view: GameView, bug: BugSprite) {
  const { x, y, size } = bug;
  ctx.fillStyle = bug.flash ? view.ink : bug.kind === 'crawler' ? BUG.crawler : BUG.flyer;
  fillBox(ctx, view, x, y, size, size, bug.kind === 'flyer' ? 0.5 : 0.22);
  const look = bug.look * size * 0.1;
  const eye = size * 0.17;
  ctx.fillStyle = bug.flash ? view.paper : BUG.eye;
  fillBox(ctx, view, x + size * 0.24 + look - eye / 2, y + size * 0.38, eye, eye, 0.3);
  fillBox(ctx, view, x + size * 0.76 + look - eye / 2, y + size * 0.38, eye, eye, 0.3);
}

export interface BoxSprite extends Point {
  size: number;
  facing: 1 | -1;
  /** Eyes shut. */
  blink?: boolean;
}

/** The player: Boardy's cardboard box with a face, looking the way it is heading. Also drawn on the resting chart. */
export function drawBox(ctx: CanvasRenderingContext2D, view: GameView, box: BoxSprite) {
  const { x, y, size, facing } = box;
  ctx.fillStyle = BOX.front;
  fillBox(ctx, view, x, y, size, size, 0.12);
  ctx.fillStyle = BOX.side;
  fillBox(ctx, view, facing > 0 ? x : x + size * 0.84, y, size * 0.16, size, 0.3); // the side of the box trails behind
  const look = facing * size * 0.09;
  const eye = size * 0.13;
  ctx.fillStyle = BOX.face;
  const lid = box.blink ? 0.25 : 1.3;
  const drop = box.blink ? eye * 0.5 : 0;
  fillBox(ctx, view, x + size * 0.36 + look - eye / 2, y + size * 0.3 + drop, eye, eye * lid, 0.5);
  fillBox(ctx, view, x + size * 0.68 + look - eye / 2, y + size * 0.3 + drop, eye, eye * lid, 0.5);
  ctx.strokeStyle = BOX.face;
  ctx.lineWidth = Math.max(1, view.unit * 0.055);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(view.x(x + size * 0.3 + look), view.y(y + size * 0.62));
  ctx.quadraticCurveTo(view.x(x + size * 0.52 + look), view.y(y + size * 0.82), view.x(x + size * 0.74 + look), view.y(y + size * 0.6));
  ctx.stroke();
}

const EPS = 1e-4;
const approach = (value: number, target: number, amount: number) =>
  value < target ? Math.min(target, value + amount) : Math.max(target, value - amount);
const overlaps = (a: Body, b: Body) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function createChartGame(
  level: GameLevel,
  bestBefore = 0,
  random: () => number = Math.random,
  options: GameOptions = {},
): ChartGame {
  const { cols, tiles, hp, waves } = level;
  const original = hp.slice();
  const T = TUNING;

  let state: GameState = 'ready';
  let score = 0;
  let best = bestBefore;
  let shake = 0;
  let wave = 0;
  let queue = 0; // bugs still to spawn this wave
  let spawnIn = 0;
  let banner = 0;
  let carry = 0; // unsimulated time
  let clock = 0;
  let pointer: Point | null = null;
  // Key presses are latched until a simulation step consumes them, so none are lost on fast displays.
  let jumpLatch = false;
  let confirmLatch = false;

  const player: Player = {
    x: 0, y: 0, w: T.player.size, h: T.player.size, vx: 0, vy: 0, ground: false,
    facing: 1, hp: T.player.hp, hurt: 0, coyote: 0, buffer: 0, cooldown: 0,
  };
  let bugs: Bug[] = [];
  let shots: Shot[] = [];
  let sparks: Spark[] = [];

  let begun = false; // the first life may begin somewhere chosen; later ones drop in at the middle

  function reset() {
    hp.set(original);
    state = 'ready';
    score = 0;
    wave = 0;
    queue = 0;
    bugs = [];
    shots = [];
    sparks = [];
    const start = !begun && options.start ? options.start : { x: cols / 2 - T.player.size / 2, y: -HEAD + 0.4 };
    begun = true;
    Object.assign(player, {
      x: start.x, y: start.y, vx: 0, vy: 0, ground: false,
      facing: 1, hp: T.player.hp, hurt: 0, coyote: 0, buffer: 0, cooldown: 0,
    });
  }
  reset();

  // ---------------------------------------------------------------- terrain

  const cellAt = (col: number, row: number) =>
    col < 0 || col >= cols || row < 0 || row >= ROWS ? -1 : tiles[row * cols + col];

  /** Side walls and the floor are solid; the sky is open. */
  const solid = (col: number, row: number) => {
    if (col < 0 || col >= cols || row >= ROWS) return true;
    if (row < 0) return false;
    const cell = tiles[row * cols + col];
    return cell >= 0 && hp[cell] > 0;
  };

  function burst(x: number, y: number, count: number, tone: number, speed: number) {
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2;
      const force = speed * (0.35 + random() * 0.65);
      const span = 0.28 + random() * 0.3;
      sparks.push({
        x, y, vx: Math.cos(angle) * force, vy: Math.sin(angle) * force - speed * 0.3,
        life: span, span, size: 0.12 + random() * 0.14, tone,
      });
    }
  }

  /** Take one hit point off a block. Returns false if there was nothing there. */
  function damage(col: number, row: number) {
    const cell = cellAt(col, row);
    if (cell < 0 || hp[cell] === 0) return false;
    const tone = hp[cell];
    hp[cell] -= 1;
    const broken = hp[cell] === 0;
    burst(col + 0.5, row + 0.5, broken ? 7 : 2, tone, broken ? 9 : 5);
    return true;
  }

  // ---------------------------------------------------------------- movement

  /** Move horizontally, stopping at blocks. Returns true if something was in the way. */
  function moveX(body: Body, dx: number) {
    if (dx === 0) return false;
    body.x += dx;
    const top = Math.floor(body.y + EPS);
    const bottom = Math.floor(body.y + body.h - EPS);
    const col = dx > 0 ? Math.floor(body.x + body.w - EPS) : Math.floor(body.x + EPS);
    for (let row = top; row <= bottom; row++) {
      if (!solid(col, row)) continue;
      body.x = dx > 0 ? col - body.w : col + 1;
      return true;
    }
    return false;
  }

  /** Move vertically. Sets `ground` when landing; returns true on any collision. */
  function moveY(body: Body, dy: number) {
    body.ground = false;
    if (dy === 0) return false;
    body.y += dy;
    const left = Math.floor(body.x + EPS);
    const right = Math.floor(body.x + body.w - EPS);
    if (dy > 0) {
      const row = Math.floor(body.y + body.h - EPS);
      for (let col = left; col <= right; col++) {
        if (!solid(col, row)) continue;
        body.y = row - body.h;
        body.ground = true;
        return true;
      }
      return false;
    }
    const row = Math.floor(body.y + EPS);
    for (let col = left; col <= right; col++) {
      if (!solid(col, row)) continue;
      body.y = row + 1;
      return true;
    }
    if (body.y < -HEAD) {
      body.y = -HEAD;
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- actors

  function stepPlayer(input: GameInput, dt: number) {
    const p = player;
    const want = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (want !== 0) p.facing = want as 1 | -1;

    if (want !== 0) p.vx = approach(p.vx, want * T.player.run, (p.ground ? T.player.accel : T.player.airAccel) * dt);
    else p.vx = approach(p.vx, 0, T.player.friction * (p.ground ? 1 : 0.35) * dt);

    p.coyote = p.ground ? T.player.coyote : Math.max(0, p.coyote - dt);
    p.buffer = jumpLatch ? T.player.buffer : Math.max(0, p.buffer - dt);
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -T.player.jump;
      p.buffer = 0;
      p.coyote = 0;
    }
    if (!input.jump && p.vy < -T.player.jumpCut) p.vy = -T.player.jumpCut;

    p.vy = Math.min(T.maxFall, p.vy + T.gravity * dt);
    if (moveX(p, p.vx * dt)) p.vx = 0;
    if (moveY(p, p.vy * dt)) p.vy = 0;
    p.hurt = Math.max(0, p.hurt - dt);

    p.cooldown -= dt;
    if (input.fire && p.cooldown <= 0) {
      const cx = p.x + p.w / 2;
      const cy = p.y + p.h / 2;
      let dx: number = p.facing;
      let dy = 0;
      if (input.aim) {
        const ax = input.aim.x - cx;
        const ay = input.aim.y - cy;
        const length = Math.hypot(ax, ay) || 1;
        dx = ax / length;
        dy = ay / length;
        if (Math.abs(dx) > 0.25) p.facing = dx > 0 ? 1 : -1;
      } else if (input.down && !p.ground) {
        dx = 0;
        dy = 1; // shoot straight down while airborne, to dig or to hover a little
      }
      shots.push({ x: cx + dx * 0.45, y: cy + dy * 0.45, vx: dx * T.gun.speed, vy: dy * T.gun.speed, life: T.gun.life });
      p.vx -= dx * T.gun.recoil;
      p.vy -= dy * T.gun.recoil * 4;
      p.cooldown = 1 / T.gun.rate;
    }
  }

  function spawn() {
    const flyer = wave > 0 && random() < Math.min(0.5, T.wave.flyerShare * (1 + wave * 0.1));
    const size = flyer ? T.flyer.size : T.crawler.size;
    let x = 0;
    const within = options.spawnWithin;
    for (let tries = 0; tries < 8; tries++) {
      // Anywhere in the year, or (when only part of it is on screen) to one side of the player, just out of view.
      x = within ? player.x + (random() < 0.5 ? -1 : 1) * within * (0.55 + random() * 0.45) : random() * (cols - 1);
      if (within ? x >= 0 && x <= cols - 1 : Math.abs(x - player.x) > 8) break;
    }
    x = Math.min(cols - 1, Math.max(0, x));
    bugs.push({
      kind: flyer ? 'flyer' : 'crawler', x, y: -HEAD - 1, w: size, h: size, vx: 0, vy: 0, ground: false,
      hp: flyer ? T.flyer.hp : T.crawler.hp, blocked: 0, phase: random() * Math.PI * 2, flash: 0,
    });
  }

  /** Crawlers walk at the player, hop small steps, and eat through whatever else is in the way. */
  function stepCrawler(bug: Bug, quick: number, dt: number) {
    const p = player;
    const dx = p.x + p.w / 2 - (bug.x + bug.w / 2);
    const dy = p.y + p.h / 2 - (bug.y + bug.h / 2);
    const heading = Math.abs(dx) < 0.08 ? 0 : Math.sign(dx);
    const aligned = Math.abs(dx) < 0.5;

    bug.vx = approach(bug.vx, heading * T.crawler.speed * quick, T.crawler.accel * dt);
    bug.vy = Math.min(T.maxFall, bug.vy + T.gravity * dt);
    const wasGrounded = bug.ground;
    const walled = moveX(bug, bug.vx * dt);
    const rising = bug.vy < 0;
    const bumped = moveY(bug, bug.vy * dt);
    if (bumped) bug.vy = 0;

    const col = Math.floor(bug.x + bug.w / 2);
    const row = Math.floor(bug.y + bug.h / 2);
    let target: [number, number] | null = null;
    if (walled) {
      target = [col + heading, row];
    } else if (aligned && dy < -1 && bumped && rising) {
      target = [col, row - 1]; // player overhead: eat upward
    } else if (aligned && dy > 1 && bug.ground) {
      // Player below: eat whichever block is holding the bug up.
      const under = Math.floor(bug.y + bug.h + 0.5);
      const left = Math.floor(bug.x + EPS);
      const right = Math.floor(bug.x + bug.w - EPS);
      const leftCell = cellAt(left, under);
      target = leftCell >= 0 && hp[leftCell] > 0 ? [left, under] : [right, under];
    }

    if (target) {
      bug.blocked += dt;
      if (bug.blocked > T.crawler.chew && damage(target[0], target[1])) bug.blocked = 0;
    } else {
      bug.blocked = Math.max(0, bug.blocked - dt * 2);
    }

    const wantsUp = walled || (aligned && dy < -1);
    if (wantsUp && (bug.ground || wasGrounded) && bug.vy >= 0) {
      bug.vy = -T.crawler.jump;
      bug.ground = false;
    }
  }

  /** Flyers ignore the terrain and steer at the player with a slight bob. */
  function stepFlyer(bug: Bug, quick: number, dt: number) {
    const p = player;
    const dx = p.x + p.w / 2 - (bug.x + bug.w / 2);
    const dy = p.y + p.h / 2 - (bug.y + bug.h / 2);
    const length = Math.hypot(dx, dy) || 1;
    const speed = T.flyer.speed * quick;
    bug.vx += ((dx / length) * speed - bug.vx) * T.flyer.turn * dt;
    bug.vy += ((dy / length) * speed - bug.vy) * T.flyer.turn * dt;
    bug.phase += dt * 6;
    bug.x += bug.vx * dt;
    bug.y += (bug.vy + Math.sin(bug.phase) * T.flyer.bob) * dt;
  }

  function hurtPlayer(from: Bug) {
    const p = player;
    p.hp -= 1;
    p.hurt = T.player.invulnerable;
    p.vx = (p.x + p.w / 2 < from.x + from.w / 2 ? -1 : 1) * T.player.knockback;
    p.vy = -T.player.knockback;
    shake = 6;
    burst(p.x + p.w / 2, p.y + p.h / 2, 8, 0, 8);
    if (p.hp <= 0) {
      state = 'over';
      shake = 10;
      burst(p.x + p.w / 2, p.y + p.h / 2, 18, 0, 13);
    }
  }

  function stepBugs(dt: number) {
    const quick = 1 + wave * T.wave.speedUp;
    for (let i = bugs.length - 1; i >= 0; i--) {
      const bug = bugs[i];
      bug.flash = Math.max(0, bug.flash - dt);
      if (bug.kind === 'crawler') stepCrawler(bug, quick, dt);
      else stepFlyer(bug, quick, dt);
      if (state !== 'over' && player.hurt <= 0 && overlaps(bug, player)) hurtPlayer(bug);
    }
  }

  function stepShots(dt: number) {
    const reach = T.gun.size / 2;
    for (let i = shots.length - 1; i >= 0; i--) {
      const shot = shots[i];
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.life -= dt;
      let spent = shot.life <= 0 || shot.x < 0 || shot.x >= cols || shot.y < -HEAD - 1 || shot.y >= ROWS;

      if (!spent) {
        for (let j = bugs.length - 1; j >= 0; j--) {
          const bug = bugs[j];
          if (shot.x < bug.x - reach || shot.x > bug.x + bug.w + reach) continue;
          if (shot.y < bug.y - reach || shot.y > bug.y + bug.h + reach) continue;
          spent = true;
          bug.hp -= 1;
          bug.flash = 0.08;
          bug.vx += shot.vx * 0.06;
          const tone = bug.kind === 'crawler' ? 5 : 6;
          if (bug.hp <= 0) {
            score += bug.kind === 'crawler' ? T.crawler.score : T.flyer.score;
            if (score > best) best = score;
            burst(bug.x + bug.w / 2, bug.y + bug.h / 2, 10, tone, 10);
            shake = Math.max(shake, 2.5);
            bugs.splice(j, 1);
          } else {
            burst(shot.x, shot.y, 2, tone, 5);
          }
          break;
        }
      }
      if (!spent && shot.y >= 0 && damage(Math.floor(shot.x), Math.floor(shot.y))) spent = true;
      if (spent) shots.splice(i, 1);
    }
  }

  function stepSparks(dt: number) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      spark.vy += 30 * dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.life -= dt;
      if (spark.life <= 0) sparks.splice(i, 1);
    }
  }

  function stepWaves(dt: number) {
    if (state === 'between') {
      banner -= dt;
      if (banner <= 0) {
        state = 'playing';
        queue = waves[wave].bugs;
        spawnIn = 0.4;
      }
      return;
    }
    if (state !== 'playing') return;

    spawnIn -= dt;
    if (queue > 0 && spawnIn <= 0 && bugs.length < T.wave.maxAlive) {
      spawn();
      queue -= 1;
      spawnIn = Math.max(T.wave.minGap, T.wave.gap - T.wave.gapDrop * wave) * (0.7 + random() * 0.6);
    }
    if (queue === 0 && bugs.length === 0) {
      wave += 1;
      if (wave >= waves.length) {
        wave = waves.length - 1;
        state = 'won';
        return;
      }
      state = 'between';
      banner = T.wave.pause;
      player.hp = Math.min(T.player.hp, player.hp + 1);
    }
  }

  function step(input: GameInput) {
    const dt = T.step;
    clock += dt;
    shake = Math.max(0, shake - dt * 28);
    stepSparks(dt);

    if (state === 'over' || state === 'won') {
      if (confirmLatch) reset();
      return;
    }

    stepPlayer(input, dt);
    if (state === 'ready' && (input.left || input.right || input.jump || input.fire)) {
      state = 'between';
      banner = T.wave.pause;
    }
    stepShots(dt);
    stepBugs(dt);
    stepWaves(dt);
  }

  // ---------------------------------------------------------------- drawing

  function draw(ctx: CanvasRenderingContext2D, view: GameView) {
    const box = (x: number, y: number, w: number, h: number, round = 0.2) => fillBox(ctx, view, x, y, w, h, round);
    const toneColour = (tone: number) =>
      tone === 0 ? view.ink : tone === 5 ? BUG.crawler : tone === 6 ? BUG.flyer : view.greens[Math.min(4, tone)];

    ctx.globalAlpha = 1;

    for (const spark of sparks) {
      const fade = spark.life / spark.span;
      const side = spark.size * (0.4 + 0.6 * fade);
      ctx.globalAlpha = Math.min(1, fade * 1.6);
      ctx.fillStyle = toneColour(spark.tone);
      box(spark.x - side / 2, spark.y - side / 2, side, side, 0.15);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = view.ink;
    for (const shot of shots) box(shot.x - T.gun.size / 2, shot.y - T.gun.size / 2, T.gun.size, T.gun.size, 0.3);

    for (const bug of bugs) {
      // The eyes follow the player.
      drawBug(ctx, view, { x: bug.x, y: bug.y, size: bug.w, kind: bug.kind, look: Math.sign(player.x - bug.x), flash: bug.flash > 0 });
    }

    const flicker = player.hurt > 0 && Math.floor(clock * 14) % 2 === 0;
    if (state !== 'over' && !flicker) drawBox(ctx, view, { x: player.x, y: player.y, size: player.w, facing: player.facing });

    // Crosshair at the pointer.
    if (pointer && state !== 'over' && state !== 'won') {
      const px = view.x(pointer.x);
      const py = view.y(pointer.y);
      ctx.fillStyle = view.ink;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(px - 6, py - 0.5, 4, 1);
      ctx.fillRect(px + 2, py - 0.5, 4, 1);
      ctx.fillRect(px - 0.5, py - 6, 1, 4);
      ctx.fillRect(px - 0.5, py + 2, 1, 4);
      ctx.globalAlpha = 1;
    }

    // Heads-up line along the top of the sky: wave on the left, lives, score on the right.
    // With a camera, it is pinned to the part of the world on screen.
    const left = view.from ?? 0;
    const right = view.to ?? cols;
    const top = view.y(-HEAD) + 11;
    const current = waves[wave];
    ctx.font = `11px ${view.font}`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = view.ink;
    ctx.textAlign = 'left';
    ctx.globalAlpha = 0.55;
    const waveText = `${current.label}  ${wave + 1}/${waves.length}`;
    ctx.fillText(waveText, view.x(left + 0.1), top);
    const heartsAt = view.x(left + 0.1) + ctx.measureText(waveText).width + 14;
    for (let i = 0; i < T.player.hp; i++) {
      ctx.globalAlpha = i < player.hp ? 0.9 : 0.18;
      ctx.fillRect(heartsAt + i * 11, top - 7, 7, 7);
    }
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.55;
    ctx.fillText(best > 0 ? `${score}   best ${best}` : `${score}`, view.x(right - 0.1), top);

    // One or two centred lines for the state of play.
    let title = '';
    let hint = '';
    if (state === 'ready') {
      title = 'Bugs are eating the year.';
      hint = 'Move to start';
    } else if (state === 'between') {
      title = `${current.label}: ${current.bugs} bug${current.bugs === 1 ? '' : 's'}`;
    } else if (state === 'over') {
      title = `Eaten in ${current.label}. Score ${score}.`;
      hint = view.touch ? 'Tap to try again' : 'Enter to try again';
    } else if (state === 'won') {
      title = `The year survived. Score ${score}.`;
      hint = view.touch ? 'Tap to play again' : 'Enter to play again';
    }
    if (title) {
      const middle = view.x((left + right) / 2);
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.9;
      ctx.fillText(title, middle, top + 22);
      if (hint) {
        ctx.globalAlpha = 0.5;
        ctx.fillText(hint, middle, top + 38);
      }
    }
    ctx.globalAlpha = 1;
  }

  return {
    get state() {
      return state;
    },
    get score() {
      return score;
    },
    get best() {
      return best;
    },
    get shake() {
      return shake;
    },
    get focus() {
      return { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    },
    update(dt, input) {
      pointer = input.pointer;
      if (input.jumpPressed) jumpLatch = true;
      if (input.confirm) confirmLatch = true;
      carry = Math.min(carry + dt, T.step * 10); // never simulate more than ten steps to catch up
      while (carry >= T.step) {
        step(input);
        jumpLatch = confirmLatch = false;
        carry -= T.step;
      }
    },
    draw,
  };
}
