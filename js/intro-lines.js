// Startup prelude. Scattered dots gather into six Lissajous strands, which unfold
// into travelling waves that ring down like a damped spring, then settle into the
// two rules the name rises from. Every dot becomes a vertex in the line mesh.


const TAU = Math.PI * 2;
const DOTS_BEGIN_AT = .25;
const DOTS_LOADED_AT = 1.15;
const GATHER_AT = 1.5;
const MESH_DELAY = 2;
const END_AT = 5.35; // seconds: every strand has retracted by now (before any hold is added)

// Tunable parameters; the loader uses these defaults, the study page overrides them.
// hold: extra seconds the Lissajous strands keep spinning before they unfold into waves.
export const LINES_DEFAULTS = { speed: 1, strands: 6, points: 150, dotStep: 5, waveHeight: 1, damping: 3.2, push: 46, hold: 1.4 };
export const LINES_REVEAL_AT = 3750 + LINES_DEFAULTS.hold * 1000; // ms: when the rules are close enough for the name to rise
export const LINES_DURATION = 5450 + LINES_DEFAULTS.hold * 1000; // ms: minimum loader time for one full play

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const lerp = (from, to, amount) => from + (to - from) * amount;
// Progress of `time` through the window [start, start + duration], clamped to 0..1.
const span = (time, start, duration) => clamp01((time - start) / duration);

const ease = {
  outCubic: (t) => 1 - (1 - t) ** 3,
  inOutCubic: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  inOutQuint: (t) => (t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (10 - 20 * t)) / 2)
};

// a:b is each figure's frequency ratio; alternate strands land on alternate name lines.
const strands = [
  { a: 1, b: 2, color: "#087f6a", alpha: .95 },
  { a: 3, b: 2, color: "#167da3", alpha: .8 },
  { a: 3, b: 4, color: "#7456c9", alpha: .6 },
  { a: 5, b: 4, color: "#087f6a", alpha: .5 },
  { a: 2, b: 3, color: "#167da3", alpha: .45 },
  { a: 5, b: 6, color: "#7456c9", alpha: .4 }
];

/** Plays the prelude on `canvas`, landing on the bottom edges of `nameLines`. Returns a stop function. */
export function playIntroLines(canvas, nameLines, options = {}) {
  const o = { ...LINES_DEFAULTS, ...options };
  const active = strands.slice(0, Math.max(1, Math.round(o.strands)));
  const POINTS = Math.round(o.points);
  const DOT_STEP = Math.max(1, Math.round(o.dotStep));
  const context = canvas.getContext("2d");
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, energy: 0, moved: false };
  // Normalized origins keep the random field stable if the viewport changes mid-intro.
  const origins = active.map(() => Array.from({ length: POINTS + 1 }, () => ({
    x: Math.random(), y: Math.random(), phase: Math.random() * TAU,
    speed: .45 + Math.random() * .55, size: .8 + Math.random() * 1.4,
    appearsAt: DOTS_BEGIN_AT + Math.random() * (DOTS_LOADED_AT - DOTS_BEGIN_AT - .2)
  })));
  const startedAt = performance.now();
  let width = 0; let height = 0; let frame = 0;

  const onPointerMove = (event) => {
    pointer.targetX = event.clientX; pointer.targetY = event.clientY;
    if (!pointer.moved) { pointer.x = event.clientX; pointer.y = event.clientY; pointer.moved = true; }
  };
  window.addEventListener("pointermove", onPointerMove);

  function fitCanvas() {
    if (canvas.clientWidth === width && canvas.clientHeight === height) return;
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(now) {
    const t = Math.max(0, now - startedAt) / 1000 * o.speed;
    fitCanvas();
    context.clearRect(0, 0, width, height);
    if (t >= END_AT + o.hold) { stop(); return; }

    // The pointer eases toward the cursor, and its influence eases in once it has moved.
    pointer.x += (pointer.targetX - pointer.x) * .12;
    pointer.y += (pointer.targetY - pointer.y) * .12;
    pointer.energy += ((pointer.moved ? 1 : 0) - pointer.energy) * .08;

    const centerX = width / 2; const centerY = height / 2;
    const radius = Math.min(width, height) * .24;
    const waveHeight = Math.min(height * .13, 96) * o.waveHeight;
    const waveGap = Math.min(height * .035, 22);
    // The figures spin from MESH_DELAY on; everything after (unfold, rules, retract) waits out the hold.
    const spinTime = Math.max(0, t - MESH_DELAY);
    const meshTime = Math.max(0, spinTime - o.hold);
    // Damped spring: the waves overshoot through zero a few times as they flatten.
    const sinceUnfold = Math.max(0, meshTime - .7);
    const ring = Math.exp(-o.damping * sinceUnfold) * Math.cos(9 * sinceUnfold);
    const rules = nameLines.map((line) => line.getBoundingClientRect());

    context.lineWidth = 1.5; context.lineCap = "round"; context.lineJoin = "round";
    active.forEach((strand, i) => {
      const rule = rules[i % rules.length];
      // The complete random field holds briefly before any particle starts gathering.
      const gathered = ease.inOutExpo(span(t, GATHER_AT + i * .02, .75));
      const dotsFaded = ease.inOutCubic(span(t, 2.15 + i * .015, .38));
      const linesVisible = ease.inOutCubic(span(t, 2.12 + i * .02, .42));
      const toWave = ease.inOutCubic(span(meshTime, .65 + i * .05, .7));
      const toRule = ease.inOutQuint(span(meshTime, 1.1 + i * .04, .6));
      const traced = ease.outCubic(span(t, 2.08 + i * .04, .48));
      const retracted = ease.inOutExpo(span(meshTime, 2.35 + (i % rules.length) * .12, .7));
      const phase = spinTime * .9 + i * .5;
      const push = o.push * pointer.energy * (1 - toRule);

      const pointAt = (j) => {
        const u = j / POINTS;
        const theta = u * TAU;
        const figureX = centerX + radius * Math.sin(strand.a * theta + phase);
        const figureY = centerY + radius * Math.sin(strand.b * theta);
        // Two travelling harmonics, pinched to nothing at both screen edges.
        const swell = Math.sin(TAU * (1.5 + i * .25) * u - meshTime * 3 + i) + .45 * Math.sin(TAU * (3.5 + i * .4) * u + meshTime * 4.4 + i * 1.7);
        const waveX = u * width;
        const waveY = centerY + (i - (active.length - 1) / 2) * waveGap + waveHeight * ring * Math.sin(Math.PI * u) ** 2 * swell;
        const origin = origins[i][j];
        const drift = 7 * (1 - gathered);
        const randomX = origin.x * width + Math.cos(origin.phase + t * origin.speed) * drift;
        const randomY = origin.y * height + Math.sin(origin.phase * 1.7 + t * origin.speed * .8) * drift;
        let x = lerp(randomX, lerp(lerp(figureX, waveX, toWave), lerp(rule.left, rule.right, u), toRule), gathered);
        let y = lerp(randomY, lerp(lerp(figureY, waveY, toWave), rule.bottom, toRule), gathered);
        if (push > .01) {
          // Lines bow away from the cursor with a Gaussian falloff.
          const dx = x - pointer.x; const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) + 1;
          const force = push * Math.exp(-(distance * distance) / (2 * 130 * 130));
          x += dx / distance * force; y += dy / distance * force;
        }
        return { x, y };
      };

      // Each sampled particle has an independent arrival, leaving the opening frames empty.
      if (t >= DOTS_BEGIN_AT && dotsFaded < 1) {
        for (let j = 0; j <= POINTS; j += DOT_STEP) {
          const dot = origins[i][j];
          const appeared = ease.outCubic(span(t, dot.appearsAt, .2));
          const opacity = appeared * (1 - dotsFaded);
          if (opacity <= .001) continue;
          const point = pointAt(j);
          context.beginPath();
          context.moveTo(point.x + dot.size, point.y);
          context.arc(point.x, point.y, dot.size, 0, TAU);
          context.fillStyle = strand.color;
          context.globalAlpha = strand.alpha * opacity;
          context.fill();
        }
      }

      context.beginPath();
      const first = Math.ceil(retracted * POINTS); const last = Math.floor(traced * POINTS);
      for (let j = first; j <= last; j++) {
        const point = pointAt(j);
        if (j === first) context.moveTo(point.x, point.y); else context.lineTo(point.x, point.y);
      }
      context.strokeStyle = strand.color;
      context.globalAlpha = strand.alpha * linesVisible;
      context.stroke();
    });
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onPointerMove);
  }

  frame = requestAnimationFrame(draw);
  return stop;
}
