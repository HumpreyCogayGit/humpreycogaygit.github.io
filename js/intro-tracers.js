// Startup prelude. Tracer lines dart in from the screen edges and hop between random
// waypoints. Every hop eases its x and y with two independently chosen easing curves
// (overshoots, bounces, springs, exponential snaps), so no two paths bend alike. The
// tracers then dive onto the two rules the name rises from, sweep along them, and zip away.

export const TRACERS_REVEAL_AT = 3750; // ms: when the rules are laid down well enough for the name to rise

const TAU = Math.PI * 2;
const SAMPLE_STEP = 1 / 120; // seconds between trail samples
const WANDER_UNTIL = 2.55; // seconds: last moment a wander hop may begin
const RETRACT_FOR = .75;
const END_AT = 5.4; // seconds: every tracer has retracted and faded by now

// Tunable parameters; the loader uses these defaults, the study page overrides them.
// trail: seconds the tail lags the head while wandering. reach: longest hop, as a screen fraction.
export const TRACERS_DEFAULTS = { speed: 1, tracers: 10, trail: .38, reach: .48, holdChance: .16, lineWidth: 1.6, ripples: 1 };

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const lerp = (from, to, amount) => from + (to - from) * amount;
const span = (time, start, duration) => clamp01((time - start) / duration);
const random = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const ease = {
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inQuart: (t) => t ** 4,
  outQuart: (t) => 1 - (1 - t) ** 4,
  inOutCubic: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  inOutCirc: (t) => (t < .5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (10 - 20 * t)) / 2),
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  inOutBack: (t) => {
    const c = 1.70158 * 1.525;
    return t < .5 ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2 : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
  },
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - .75) * (TAU / 3)) + 1),
  outBounce: (t) => {
    const n = 7.5625; const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  }
};
// Wander hops draw each axis from this pool independently; the mismatch is what curves the paths.
const wanderEasings = Object.values(ease);

const palette = [
  { color: "#087f6a", alpha: .95 },
  { color: "#167da3", alpha: .8 },
  { color: "#7456c9", alpha: .65 }
];

// A node is where a hop ends: `at` is its arrival time, `ex`/`ey` ease the hop into it.
// Rule nodes (`rule`, `u`) are resolved against the live name geometry every frame.
function planTracer(index, o) {
  const nodes = [];
  // Launch from just beyond a random screen edge.
  const edge = Math.floor(Math.random() * 4);
  const along = random(.1, .9);
  const launch = [[along, -.08], [1.08, along], [along, 1.08], [-.08, along]][edge];
  let at = random(.1, .7);
  let x = launch[0]; let y = launch[1];
  nodes.push({ at, x, y });

  while (at < WANDER_UNTIL) {
    if (nodes.length > 2 && Math.random() < o.holdChance) {
      // A short hold: the head stops dead and the tail catches up before the next dart.
      at += random(.1, .26);
      nodes.push({ at, x, y, ex: ease.inOutSine, ey: ease.inOutSine });
      continue;
    }
    const reach = random(Math.min(.18, o.reach), o.reach);
    const angle = Math.random() * TAU;
    x = clamp01(x + Math.cos(angle) * reach) * .84 + .08;
    y = clamp01(y + Math.sin(angle) * reach) * .76 + .12;
    at += random(.26, .72);
    nodes.push({ at, x, y, ex: pick(wanderEasings), ey: pick(wanderEasings) });
  }

  // Dive onto a rule, then sweep to one of its ends. Tracers sharing a rule alternate
  // directions, so between them they cover its full length.
  const rule = index % 2;
  const toRight = Math.floor(index / 2) % 2 === 0;
  const landU = toRight ? random(.08, .5) : random(.5, .92);
  at = Math.max(at, 2.75) + random(.42, .62);
  nodes.push({ at, rule, u: landU, ex: ease.inOutCubic, ey: ease.outBack, landing: true });
  at += random(.55, .8);
  nodes.push({ at, rule, u: toRight ? 1 : 0, ex: ease.inOutExpo, ey: ease.inOutExpo });
  return { nodes, ...palette[index % palette.length], landAt: nodes.at(-2).at, endAt: at };
}

/** Plays the prelude on `canvas`, landing on the bottom edges of `nameLines`. Returns a stop function. */
export function playIntroTracers(canvas, nameLines, options = {}) {
  const o = { ...TRACERS_DEFAULTS, ...options };
  const TRAIL = o.trail;
  const context = canvas.getContext("2d");
  const tracers = Array.from({ length: Math.max(1, Math.round(o.tracers)) }, (_, i) => planTracer(i, o));
  const startedAt = performance.now();
  let width = 0; let height = 0; let frame = 0; let rules = [];

  function fitCanvas() {
    if (canvas.clientWidth === width && canvas.clientHeight === height) return;
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  const resolve = (node) => {
    if (node.rule === undefined) return { x: node.x * width, y: node.y * height };
    const rule = rules[node.rule % rules.length];
    return { x: lerp(rule.left, rule.right, node.u), y: rule.bottom };
  };

  // Head position of `tracer` at `time`: a pure function of time, so trails are resampled
  // from the plan every frame instead of being recorded.
  const positionAt = (tracer, time) => {
    const { nodes } = tracer;
    if (time <= nodes[0].at) return resolve(nodes[0]);
    for (let k = 1; k < nodes.length; k++) {
      const node = nodes[k];
      if (time > node.at) continue;
      const previous = nodes[k - 1];
      const progress = (time - previous.at) / (node.at - previous.at);
      const from = resolve(previous); const to = resolve(node);
      return { x: lerp(from.x, to.x, node.ex(progress)), y: lerp(from.y, to.y, node.ey(progress)) };
    }
    return resolve(nodes.at(-1));
  };

  function draw(now) {
    const t = Math.max(0, now - startedAt) / 1000 * o.speed;
    fitCanvas();
    context.clearRect(0, 0, width, height);
    if (t >= END_AT) { stop(); return; }
    rules = nameLines.map((line) => line.getBoundingClientRect());

    context.lineCap = "round"; context.lineJoin = "round";
    tracers.forEach((tracer, i) => {
      const retractAt = tracer.endAt + .2 + (i % 2) * .1;
      const retracted = ease.inOutExpo(span(t, retractAt, RETRACT_FOR));
      // The tail trails the head, pins at the landing point, then zips to the rule's end.
      const tailTime = retracted > 0 ? lerp(tracer.landAt, tracer.endAt, retracted) : Math.min(t - TRAIL, tracer.landAt);
      const headTime = Math.min(t, tracer.endAt);
      const landed = ease.inOutCubic(span(t, tracer.landAt, .4));
      const faded = ease.inOutCubic(span(t, retractAt + RETRACT_FOR * .6, .35));
      if (faded >= 1 || t < tracer.nodes[0].at) return;

      // Waypoint ripples mark each hop's arrival.
      context.lineWidth = 1;
      if (o.ripples > 0) tracer.nodes.forEach((node, k) => {
        if (k === 0 || node.rule !== undefined) return;
        const age = t - node.at;
        if (age < 0 || age > .7) return;
        const grow = ease.outQuart(age / .7);
        const point = resolve(node);
        context.beginPath();
        context.arc(point.x, point.y, 2 + grow * 9 * o.ripples, 0, TAU);
        context.strokeStyle = tracer.color;
        context.globalAlpha = tracer.alpha * .55 * (1 - grow);
        context.stroke();
      });

      // Trail: drawn in chunks that brighten toward the head; the taper flattens once landed.
      const samples = Math.max(1, Math.ceil((headTime - tailTime) / SAMPLE_STEP));
      const points = [];
      for (let s = 0; s <= samples; s++) points.push(positionAt(tracer, lerp(tailTime, headTime, s / samples)));
      const CHUNK = 6;
      context.lineWidth = o.lineWidth;
      context.strokeStyle = tracer.color;
      for (let start = 0; start < points.length - 1; start += CHUNK) {
        const end = Math.min(start + CHUNK, points.length - 1);
        const taper = .12 + .88 * ((start + end) / 2 / (points.length - 1)) ** .9;
        context.beginPath();
        context.moveTo(points[start].x, points[start].y);
        for (let s = start + 1; s <= end; s++) context.lineTo(points[s].x, points[s].y);
        context.globalAlpha = tracer.alpha * lerp(taper, 1, landed) * (1 - faded);
        context.stroke();
      }

      // Glowing head.
      const head = points.at(-1);
      context.fillStyle = tracer.color;
      context.globalAlpha = tracer.alpha * .16 * (1 - faded);
      context.beginPath(); context.arc(head.x, head.y, 6, 0, TAU); context.fill();
      context.globalAlpha = tracer.alpha * (1 - faded);
      context.beginPath(); context.arc(head.x, head.y, 2.2, 0, TAU); context.fill();
    });
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    cancelAnimationFrame(frame);
  }

  frame = requestAnimationFrame(draw);
  return stop;
}
