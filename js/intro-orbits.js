// Startup prelude. Circles pop in with an elastic bloom, drift, then get pulled into
// three counter-rotating orbits around the centre, each hop eased per axis with a random
// curve. The orbits spin up in sudden eased kicks, then the circles shrink into beads,
// drop onto the two rules the name rises from, bounce to rest, and get threaded together.

export const ORBITS_REVEAL_AT = 3800; // ms: when the beaded rules are in place for the name to rise

const TAU = Math.PI * 2;
const ORBITS = [.42, .72, 1.02]; // orbit radii, as a fraction of the base radius
const BEAD = 2.6; // px: radius of a circle once it rests on a rule
const END_AT = 5.4; // seconds: every bead has popped by now

// Tunable parameters; the loader uses these defaults, the study page overrides them.
// spin and kick scale the orbit rotation; bounce blends the drop from a plain ease-out to a full bounce.
export const ORBITS_DEFAULTS = { speed: 1, circles: 36, maxRadius: 22, orbitSize: .3, spin: 1, kick: 1, bounce: 1 };

const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
const lerp = (from, to, amount) => from + (to - from) * amount;
const span = (time, start, duration) => clamp01((time - start) / duration);
const random = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const ease = {
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outQuart: (t) => 1 - (1 - t) ** 4,
  inOutCubic: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  inOutCirc: (t) => (t < .5 ? (1 - Math.sqrt(1 - (2 * t) ** 2)) / 2 : (Math.sqrt(1 - (-2 * t + 2) ** 2) + 1) / 2),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (10 - 20 * t)) / 2),
  inBack: (t) => 2.70158 * t ** 3 - 1.70158 * t ** 2,
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
const gatherEasings = [ease.inOutSine, ease.outQuart, ease.inOutCubic, ease.inOutCirc, ease.inOutExpo, ease.outBack, ease.inOutBack, ease.outElastic];
const kickEasings = [ease.inOutBack, ease.inOutExpo, ease.outElastic, ease.outBack];

const colors = ["#087f6a", "#167da3", "#7456c9"];
const ruleColors = ["#087f6a", "#167da3"];

function planCircles(o) {
  const count = Math.max(2, Math.round(o.circles));
  const circles = Array.from({ length: count }, (_, i) => {
    const orbit = i % ORBITS.length;
    const slot = Math.floor(i / ORBITS.length);
    const perOrbit = Math.floor((count - 1 - orbit) / ORBITS.length) + 1;
    return {
      homeX: random(.1, .9), homeY: random(.14, .86),
      wobble: Math.random() * TAU, wobbleSpeed: random(.6, 1.4),
      radius: random(Math.min(3, o.maxRadius), o.maxRadius), ring: Math.random() < .6,
      color: pick(colors), alpha: random(.5, .95),
      appearAt: random(.15, 1),
      orbit, angle: (slot / perOrbit) * TAU + random(-.15, .15),
      gatherAt: random(1.15, 1.5), gatherFor: random(.7, 1.05),
      ex: pick(gatherEasings), ey: pick(gatherEasings)
    };
  });
  // Each rule gets every other circle, ordered left to right by where it sits on the orbit,
  // so the drop reads as a cascade rather than a tangle.
  [0, 1].forEach((rule) => {
    const onRule = circles.filter((_, i) => i % 2 === rule).sort((a, b) => Math.cos(a.angle) - Math.cos(b.angle));
    onRule.forEach((circle, k) => {
      circle.rule = rule;
      circle.u = onRule.length > 1 ? k / (onRule.length - 1) : .5;
      circle.dropAt = 2.75 + circle.u * .35 + random(0, .15) + rule * .08;
      circle.dropFor = random(.6, .8);
      circle.popAt = 4.55 + circle.u * .45 + rule * .1;
    });
  });
  // Each orbit spins at its own pace, direction, and with its own sudden eased kicks.
  const orbits = ORBITS.map((size, k) => ({
    size, direction: k % 2 ? -1 : 1, speed: o.spin * random(.35, .6) / (k + 1),
    kicks: [
      { at: random(1.75, 2.0), for: random(.45, .7), turn: o.kick * random(.6, 1.3), ease: pick(kickEasings) },
      { at: random(2.25, 2.5), for: random(.4, .6), turn: o.kick * random(.4, 1), ease: pick(kickEasings) }
    ]
  }));
  return { circles, orbits };
}

/** Plays the prelude on `canvas`, landing on the bottom edges of `nameLines`. Returns a stop function. */
export function playIntroOrbits(canvas, nameLines, options = {}) {
  const o = { ...ORBITS_DEFAULTS, ...options };
  const context = canvas.getContext("2d");
  const { circles, orbits } = planCircles(o);
  const startedAt = performance.now();
  let width = 0; let height = 0; let frame = 0;

  function fitCanvas() {
    if (canvas.clientWidth === width && canvas.clientHeight === height) return;
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  const orbitAngle = (orbit, t) => orbit.direction * (orbit.speed * t +
    orbit.kicks.reduce((turned, kick) => turned + kick.turn * kick.ease(span(t, kick.at, kick.for)), 0));

  function draw(now) {
    const t = Math.max(0, now - startedAt) / 1000 * o.speed;
    fitCanvas();
    context.clearRect(0, 0, width, height);
    if (t >= END_AT) { stop(); return; }

    const rules = nameLines.map((line) => line.getBoundingClientRect());
    const centerX = width / 2; const centerY = height / 2;
    const base = Math.min(width, height) * o.orbitSize;

    // Guide rings breathe open behind the orbits, then implode as the circles drop.
    context.lineWidth = 1;
    orbits.forEach((orbit, k) => {
      const opened = ease.outBack(span(t, 1.15 + k * .12, .9));
      const closed = ease.inBack(span(t, 2.7 + k * .08, .55));
      const radius = base * orbit.size * opened * (1 - closed);
      if (radius <= .5) return;
      context.beginPath();
      context.setLineDash(k === 1 ? [2, 7] : []);
      context.lineDashOffset = -orbitAngle(orbit, t) * radius;
      context.arc(centerX, centerY, radius, 0, TAU);
      context.strokeStyle = colors[k];
      context.globalAlpha = .22 * (1 - closed);
      context.stroke();
    });
    context.setLineDash([]);

    // Threads draw through each rule's beads, then unspool as the beads pop.
    rules.forEach((rule, k) => {
      const drawn = ease.outQuart(span(t, 3.55 + k * .1, .65));
      const unspooled = ease.inOutExpo(span(t, 4.55 + k * .1, .7));
      if (drawn <= unspooled) return;
      context.beginPath();
      context.moveTo(lerp(rule.left, rule.right, unspooled), rule.bottom);
      context.lineTo(lerp(rule.left, rule.right, drawn), rule.bottom);
      context.lineWidth = 1.5;
      context.strokeStyle = ruleColors[k % ruleColors.length];
      context.globalAlpha = .85;
      context.stroke();
    });

    circles.forEach((circle) => {
      const appeared = ease.outElastic(span(t, circle.appearAt, .8));
      const popped = ease.inBack(span(t, circle.popAt, .3));
      if (appeared <= 0 || popped >= 1) return;

      const orbit = orbits[circle.orbit];
      const theta = circle.angle + orbitAngle(orbit, t);
      const orbitRadius = base * orbit.size * (1 + .06 * Math.sin(t * 3 + circle.angle * 2));
      const drift = 14 * Math.min(t, 1);
      const homeX = circle.homeX * width + Math.cos(circle.wobble + t * circle.wobbleSpeed) * drift;
      const homeY = circle.homeY * height + Math.sin(circle.wobble * 1.3 + t * circle.wobbleSpeed * .8) * drift;
      const gathered = span(t, circle.gatherAt, circle.gatherFor);
      let x = lerp(homeX, centerX + Math.cos(theta) * orbitRadius, circle.ex(gathered));
      let y = lerp(homeY, centerY + Math.sin(theta) * orbitRadius, circle.ey(gathered));

      // The drop: a smooth glide sideways, a bouncing fall onto the rule.
      const rule = rules[circle.rule % rules.length];
      const dropped = span(t, circle.dropAt, circle.dropFor);
      x = lerp(x, lerp(rule.left, rule.right, circle.u), ease.inOutCubic(dropped));
      y = lerp(y, rule.bottom, lerp(ease.outQuart(dropped), ease.outBounce(dropped), o.bounce));

      const shrunk = ease.inOutCubic(span(t, circle.dropAt - .15, .45));
      const radius = Math.max(0, lerp(circle.radius * (1 - .35 * ease.inOutSine(gathered)), BEAD, shrunk) * appeared * (1 - popped));
      const filled = circle.ring ? shrunk : 1;
      const color = shrunk > .5 ? ruleColors[circle.rule % ruleColors.length] : circle.color;
      const alpha = lerp(circle.alpha, .95, shrunk);

      context.beginPath();
      context.arc(x, y, radius, 0, TAU);
      context.fillStyle = color; context.strokeStyle = color;
      if (filled > 0) {
        // Large filled circles stay translucent so they read as soft discs, not blots.
        context.globalAlpha = alpha * filled * lerp(.35, 1, shrunk);
        context.fill();
      }
      if (circle.ring && filled < 1) {
        context.lineWidth = 1.4;
        context.globalAlpha = alpha * (1 - filled);
        context.stroke();
      }
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
