/**
 * Hand-drawn underlines.
 *
 * Plain SVG rendered on the server. Each line is generated from a seed, so every underline is a
 * little different but the same on every render. The roughness comes from the filters in
 * <SketchFilters>; stepping between them is what makes a line shake like a held drawing in
 * hand-drawn animation. Styling and motion live in the page stylesheet, keyed on `data-mark`.
 */

/** Small deterministic generator (mulberry32). */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fixed = (value: number) => value.toFixed(1);

/** Two quick passes of a pen, there and back, in a 100 × 10 box that stretches to the word's width. */
function linePath(seed: number) {
  const next = random(seed);
  const wobble = (amount: number) => (next() - 0.5) * 2 * amount;
  const first = 3.4 + wobble(0.5);
  const second = 7 + wobble(0.5);
  return [
    `M${fixed(1 + next())} ${fixed(first + wobble(0.7))}`,
    `C${fixed(22 + wobble(5))} ${fixed(first + wobble(1.5))} ${fixed(44 + wobble(6))} ${fixed(first + wobble(1.5))} ${fixed(61 + wobble(4))} ${fixed(first + wobble(0.9))}`,
    `S${fixed(86 + wobble(4))} ${fixed(first + wobble(1.5))} ${fixed(98.6 + wobble(0.4))} ${fixed(first + wobble(0.9))}`,
    `M${fixed(95 + wobble(2))} ${fixed(second + wobble(0.5))}`,
    `C${fixed(70 + wobble(6))} ${fixed(second + wobble(1.1))} ${fixed(36 + wobble(6))} ${fixed(second + wobble(1.1))} ${fixed(5 + wobble(3))} ${fixed(second + wobble(0.7))}`,
  ].join(' ');
}

/** Filter definitions, included once per page: four takes of the same roughness. */
export function SketchFilters() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {[3, 11, 23, 42].map((seed, index) => (
          <filter key={seed} id={`sk-rough-${index}`} x="-20%" y="-60%" width="140%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}

/** A sketched underline. Sits inside a positioned element and stretches to its width. */
export function Underline({ seed }: { seed: number }) {
  return (
    <svg data-mark="line" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden focusable="false">
      <path d={linePath(seed)} />
    </svg>
  );
}
