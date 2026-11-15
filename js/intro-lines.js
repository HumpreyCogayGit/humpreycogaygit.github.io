// Line prelude for the startup screen. Six strands are traced as Lissajous figures,
// unfold into travelling waves that ring down like a damped spring, then settle into
// the two rules the name rises from. Every strand is one polyline whose points are
// blended between those three shapes by eased weights.

export const LINES_REVEAL_AT = 1700; // ms: when the rules are close enough for the name to rise

const TAU = Math.PI * 2;
const POINTS = 150;
const END_AT = 3.3; // seconds: every strand has retracted by now

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
export function playIntroLines(canvas, nameLines) {
  const context = canvas.getContext("2d");
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, energy: 0, moved: false };
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
    const t = Math.max(0, now - startedAt) / 1000;
    fitCanvas();
    context.clearRect(0, 0, width, height);
    if (t >= END_AT) { stop(); return; }

    // The pointer eases toward the cursor, and its influence eases in once it has moved.
    pointer.x += (pointer.targetX - pointer.x) * .12;
    pointer.y += (pointer.targetY - pointer.y) * .12;
    pointer.energy += ((pointer.moved ? 1 : 0) - pointer.energy) * .08;

    const centerX = width / 2; const centerY = height / 2;
    const radius = Math.min(width, height) * .24;
    const waveHeight = Math.min(height * .13, 96);
    const waveGap = Math.min(height * .035, 22);
    // Damped spring: the waves overshoot through zero a few times as they flatten.
    const sinceUnfold = Math.max(0, t - .7);
    const ring = Math.exp(-3.2 * sinceUnfold) * Math.cos(9 * sinceUnfold);
    const rules = nameLines.map((line) => line.getBoundingClientRect());

    context.lineWidth = 1.5; context.lineCap = "round"; context.lineJoin = "round";
    strands.forEach((strand, i) => {
      const rule = rules[i % rules.length];
      const toWave = ease.inOutCubic(span(t, .65 + i * .05, .7));
      const toRule = ease.inOutQuint(span(t, 1.1 + i * .04, .6));
      const traced = ease.outCubic(span(t, i * .06, .85));
      const retracted = ease.inOutExpo(span(t, 2.35 + (i % rules.length) * .12, .7));
      const phase = t * .9 + i * .5;
      const push = 46 * pointer.energy * (1 - toRule);

      context.beginPath();
      const first = Math.ceil(retracted * POINTS); const last = Math.floor(traced * POINTS);
      for (let j = first; j <= last; j++) {
        const u = j / POINTS;
        const theta = u * TAU;
        const figureX = centerX + radius * Math.sin(strand.a * theta + phase);
        const figureY = centerY + radius * Math.sin(strand.b * theta);
        // Two travelling harmonics, pinched to nothing at both screen edges.
        const swell = Math.sin(TAU * (1.5 + i * .25) * u - t * 3 + i) + .45 * Math.sin(TAU * (3.5 + i * .4) * u + t * 4.4 + i * 1.7);
        const waveX = u * width;
        const waveY = centerY + (i - (strands.length - 1) / 2) * waveGap + waveHeight * ring * Math.sin(Math.PI * u) ** 2 * swell;
        let x = lerp(lerp(figureX, waveX, toWave), lerp(rule.left, rule.right, u), toRule);
        let y = lerp(lerp(figureY, waveY, toWave), rule.bottom, toRule);
        if (push > .01) {
          // Lines bow away from the cursor with a Gaussian falloff.
          const dx = x - pointer.x; const dy = y - pointer.y;
          const distance = Math.hypot(dx, dy) + 1;
          const force = push * Math.exp(-(distance * distance) / (2 * 130 * 130));
          x += dx / distance * force; y += dy / distance * force;
        }
        if (j === first) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = strand.color;
      context.globalAlpha = strand.alpha;
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
