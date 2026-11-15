// Info popups for the animation studies: the math each one uses, the easing curves
// (plotted live), and the history behind the techniques. Content is authored here;
// each card's info button names its entry with data-info.

const ease = {
  linear: (t) => t,
  outCubic: (t) => 1 - (1 - t) ** 3,
  outQuart: (t) => 1 - (1 - t) ** 4,
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inOutCubic: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  inOutQuint: (t) => (t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 ** (20 * t - 10) / 2 : (2 - 2 ** (10 - 20 * t)) / 2),
  inBack: (t) => 2.70158 * t ** 3 - 1.70158 * t ** 2,
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1),
  outBounce: (t) => {
    const n = 7.5625; const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  },
  damped: (t) => 1 - Math.exp(-3.2 * t * 2) * Math.cos(9 * t * 2)
};

const studies = {
  brain: {
    meta: "CANVAS / INTERACTIVE",
    title: "Wiremesh Neural Brain",
    summary: "A 3D graph of nodes and wires shaped like a brain's side profile, rotated and projected onto a flat canvas every frame. Neurons fire, and glowing packets travel along straight struts and curved tracts.",
    math: [
      { name: "3D rotation", formula: "x′ = x·cos θ − z·sin θ\nz′ = z·cos θ + x·sin θ", text: "Each node is turned around the vertical axis, then the horizontal axis. Two plain 2D rotations chained together give the drag-to-rotate and mouse-tilt motion." },
      { name: "Perspective projection", formula: "scale = f / (f − z)\nscreen = centre + position · radius · scale", text: "Points nearer the viewer get a larger scale, so the far hemisphere shrinks and the near side swells. With f = 3.2 the effect is gentle, like a long camera lens." },
      { name: "Cubic Bézier tracts", formula: "B(t) = (1−t)³P₀ + 3(1−t)²t·P₁ + 3(1−t)t²·P₂ + t³P₃", text: "The sweeping white-matter bundles are cubic Bézier curves in 3D. Packets ride along them by evaluating B(t) as t goes from 0 to 1." },
      { name: "Smoothed following", formula: "rotation += (target − rotation) · min(1, dt · 5.5)", text: "Rotation chases its target by a fixed fraction each frame (exponential smoothing), so the sculpture glides instead of snapping." },
      { name: "Breathing", formula: "breath = 1 + 0.011 · sin(1.45t + phase)", text: "Every node scales by about 1%, each with its own phase, so the mesh never sits perfectly still." }
    ],
    curves: [{ key: "linear", label: "Packet travel (linear t)" }],
    trivia: [
      "Bézier curves are named after Pierre Bézier, who used them to design Renault car bodies in the 1960s. Paul de Casteljau had worked out the same curves at Citroën around 1959, but the company kept his work confidential.",
      "The weights (1−t)³, 3(1−t)²t, … are Bernstein polynomials, introduced by Sergei Bernstein in 1912, decades before anyone drew a curve with them.",
      "Linear perspective was famously demonstrated by Filippo Brunelleschi in Florence around 1415, and written up by Leon Battista Alberti in <i>De pictura</i> (1435).",
      "A real human brain has roughly 86 billion neurons. This sculpture gets by with a few hundred nodes.",
      "Real neurons briefly can't fire again right after firing (a refractory period). The study models this too: a node that has just fired absorbs incoming packets without relaying them."
    ]
  },
  orbit: {
    meta: "PARTICLES / SIMULATION",
    title: "Orbit Breach",
    summary: "Thousands of points orbit in a thick ring seen from above at an angle. Red attack arcs hop from one compromised point to the next, like an infection spreading through a network.",
    math: [
      { name: "Box–Muller transform", formula: "g = √(−2 ln u) · cos(2πv)", text: "Turns two uniform random numbers u, v into one normally distributed value. That gives the ring its soft, Gaussian cross-section instead of hard edges." },
      { name: "Kepler-style orbital speed", formula: "ω ∝ r^(−3/2)", text: "Inner particles orbit faster than outer ones, as planets do. This differential rotation makes the ring shear and shimmer instead of spinning like a rigid disc." },
      { name: "Tilted camera + perspective", formula: "depth = z·cos(tilt) − y·sin(tilt)\nk = F / (F + depth)", text: "The ring lies flat and the camera looks down at the tilt angle. k shrinks the far side, and the near half fades out so the ring reads as 3D." },
      { name: "Quadratic Bézier arcs", formula: "B(s) = (1−s)²A + 2(1−s)s·Q + s²V", text: "Each attack bows sideways: the control point Q sits at the midpoint, pushed perpendicular to the line from attacker A to victim V by a random bend." },
      { name: "Ease-out arc growth", formula: "progress = 1 − (1 − p)³", text: "Arcs leap out fast and slow down as they reach their target." }
    ],
    curves: [{ key: "outCubic", label: "Arc growth (ease-out cubic)" }],
    trivia: [
      "George Box and Mervin Muller published their transform in 1958. It is still one of the simplest ways to make bell-curve randomness from a plain random number generator.",
      "ω ∝ r^(−3/2) follows from Kepler's third law (T² ∝ a³), published in <i>Harmonices Mundi</i> in 1619. It's the reason Saturn's inner rings lap its outer rings.",
      "The infect-then-heal cycle resembles epidemic models from mathematical biology. The classic SIR model was published by Kermack and McKendrick in 1927.",
      "Performance trick: tens of thousands of dots are sorted into 10 opacity buckets each frame, so the canvas changes fill colour 10 times instead of once per dot."
    ]
  },
  wave: {
    meta: "WIREFRAME / RESPONSIVE",
    title: "Waving Mesh Ribbon",
    summary: "A 3D ribbon built from 42 strands along a waving S-shaped spine. It twists as it travels, and where it turns edge-on the strands crowd together into bright flares.",
    math: [
      { name: "Travelling waves", formula: "y(u, t) = A · sin(k·u − ω·t)", text: "Two sine waves of different wavelength and speed travel along the spine. Subtracting ωt moves the crests forward over time." },
      { name: "Envelope", formula: "envelope = 0.35 + 0.65 · sin(π·u)", text: "Ripples are strongest mid-ribbon and calmer at the ends, so the ribbon feels anchored." },
      { name: "Moving frame", formula: "T = normalize(p(u+ε) − p(u))\nN = normalize(Z × T),  B = T × N", text: "At every station the code builds three perpendicular directions from the spine's tangent. The ribbon's cross-section is laid out in that local frame." },
      { name: "Twist (torsion)", formula: "twist = −0.55 + 3.65·u + 0.85·sin(4.6u − 1.15t)", text: "The cross-section rotates inside the frame by this angle. Where the ribbon turns edge-on, its projected width collapses." },
      { name: "Fake caustics", formula: "compression = 1 − screenWidth / (1.42 · halfWidth)", text: "When the on-screen width gets much narrower than the real width, the strands overlap, and that spot is lit up as a flare." },
      { name: "Pointer ripple", formula: "push = sin(0.055d − 5.5t) · 16 · (1 − d/R)²", text: "A ring wave spreads from the cursor and fades smoothly to zero at radius R." }
    ],
    curves: [{ key: "inOutSine", label: "Sine wave motion" }],
    trivia: [
      "Jean le Rond d'Alembert wrote down the wave equation and its travelling-wave solutions in 1747, while studying vibrating strings.",
      "The tangent–normal–binormal frame is named after Jean Frédéric Frenet (1847) and Joseph Serret (1851). This study uses a simpler variant built from a fixed 'up' vector, which avoids the frame flipping where the curve straightens.",
      "'Caustic' comes from the Greek for 'burning'. Caustics are the bright curves light makes at the bottom of a pool or inside a coffee cup. Ehrenfried von Tschirnhaus studied them mathematically in the 1680s.",
      "Twist a ribbon half a turn and join its ends, and you get a Möbius strip, described independently by August Möbius and Johann Listing in 1858."
    ]
  },
  lissajous: {
    meta: "LOADER / CANVAS",
    title: "Lissajous Mesh Loader",
    summary: "Random dots gather into six spinning Lissajous figures. These unfold into waves that ring down like a spring and settle into the two lines the name rises from.",
    math: [
      { name: "Lissajous figure", formula: "x = r · sin(a·θ + φ)\ny = r · sin(b·θ)", text: "Two perpendicular sine waves with frequencies a and b. The six strands use the ratios 1:2, 3:2, 3:4, 5:4, 2:3 and 5:6. φ grows over time, so each figure appears to rotate." },
      { name: "Damped spring", formula: "ring(s) = e^(−3.2s) · cos(9s)", text: "The wave height swings through zero a few times while decaying exponentially, like a plucked string coming to rest. The Damping slider changes the 3.2." },
      { name: "Pinned harmonics", formula: "swell · sin²(π·u)", text: "Two travelling sine waves are multiplied by sin²(πu), which is zero at both screen edges, so the waves stay pinned at the ends." },
      { name: "Gaussian cursor push", formula: "force = push · e^(−d² / 2σ²),  σ = 130px", text: "Lines bend away from the cursor, strongly up close and smoothly fading with distance." },
      { name: "Staged easing", formula: "pos = lerp(random, lerp(figure, wave, e₁), e₂) …", text: "Each stage (gather, unfold, land, retract) blends between two shapes using its own easing curve." }
    ],
    curves: [
      { key: "inOutExpo", label: "Gather · retract (in-out expo)" },
      { key: "inOutQuint", label: "Land on rule (in-out quint)" },
      { key: "damped", label: "Spring ring-down" }
    ],
    trivia: [
      "The figures are named after Jules Antoine Lissajous, who in 1857 bounced light off mirrors fixed to two vibrating tuning forks. Nathaniel Bowditch had studied the same curves in 1815, so they're also called Bowditch curves.",
      "Before digital frequency counters, engineers compared two frequencies by feeding them into an oscilloscope's X and Y inputs and reading off the Lissajous figure.",
      "The Australian Broadcasting Corporation's logo is a Lissajous figure.",
      "When a:b is a ratio of whole numbers the curve closes into a loop. If it were irrational, the curve would never repeat and would slowly fill its whole square."
    ]
  },
  tracers: {
    meta: "LOADER / EASING",
    title: "Eased Tracers Loader",
    summary: "Ten lines dart between random waypoints. For each hop, the horizontal and vertical motion get two different randomly chosen easing curves, so the paths bend unpredictably before landing on the name.",
    math: [
      { name: "Per-axis easing", formula: "x = lerp(x₀, x₁, easeA(p))\ny = lerp(y₀, y₁, easeB(p))", text: "With the same easing on both axes, a hop is a straight line. With different curves, one axis runs ahead of the other and the path bends. That mismatch is where the unpredictability comes from." },
      { name: "Ease-out back (overshoot)", formula: "1 + c₃(t−1)³ + c₁(t−1)²\nc₁ = 1.70158, c₃ = c₁ + 1", text: "Overshoots the target by about 10%, then settles back." },
      { name: "Ease-out elastic", formula: "2^(−10t) · sin((10t − 0.75) · 2π/3) + 1", text: "A sine wave inside a shrinking exponential envelope: it springs past the target and wobbles to rest." },
      { name: "Ease-out bounce", formula: "7.5625 · t²  (piecewise, 4 arcs)", text: "Four parabolic arcs glued together, like a ball dropped onto the floor." },
      { name: "Trails as a function of time", formula: "trail = { position(t − k·Δt) : k = 0…n }", text: "Positions are never stored: every frame, the trail is recomputed by sampling the head's path at earlier times." }
    ],
    curves: [
      { key: "outBack", label: "Ease-out back" },
      { key: "outElastic", label: "Ease-out elastic" },
      { key: "outBounce", label: "Ease-out bounce" },
      { key: "inOutExpo", label: "Sweep along rule (in-out expo)" }
    ],
    trivia: [
      "Easing traces back to 'slow in and slow out', one of Disney's 12 principles of animation, set out by Ollie Johnston and Frank Thomas in <i>The Illusion of Life</i> (1981).",
      "Most easing functions on the web descend from Robert Penner's easing equations, written for Flash around 2001. The odd constant 1.70158 comes from his ease-back, and it's tuned to overshoot by exactly 10%.",
      "The cheat sheet many developers use, easings.net, was made by Andrey Sitnik and Ivan Solovev.",
      "CSS can't express elastic or bounce with a single cubic-bezier(). Those need keyframes, or the newer linear() easing function."
    ]
  },
  orbits: {
    meta: "LOADER / CIRCLES",
    title: "Bouncing Orbits Loader",
    summary: "Circles bloom with a spring, get pulled into three counter-rotating orbits that spin forward in sudden kicks, then shrink into beads and bounce onto the lines under the name.",
    math: [
      { name: "Circular motion", formula: "x = cx + R·cos θ(t)\ny = cy + R·sin θ(t)", text: "Every circle sits on one of three orbits. Adjacent orbits turn in opposite directions." },
      { name: "Kicked rotation", formula: "θ(t) = θ₀ + dir · (ω·t + Σ turnᵢ · easeᵢ(span))", text: "On top of a steady spin, each orbit gets two sudden extra turns, each with a randomly chosen easing (back, expo, elastic). The rotation lurches instead of turning at a constant rate." },
      { name: "Elastic bloom", formula: "scale = outElastic(p)", text: "Circles overshoot their size and wobble as they appear, like a bubble popping into place." },
      { name: "Bounce drop", formula: "x: inOutCubic(p)   y: outBounce(p)", text: "Sideways motion is smooth while the fall bounces, and the mismatch makes the drop look physical. The Bounce slider blends from a plain ease-out to the full bounce." },
      { name: "Implosion", formula: "radius · (1 − inBack(p))", text: "The guide rings pull slightly outward first (the 'back'), then collapse to nothing." }
    ],
    curves: [
      { key: "outElastic", label: "Bloom (ease-out elastic)" },
      { key: "outBounce", label: "Drop (ease-out bounce)" },
      { key: "inBack", label: "Ring implode (ease-in back)" }
    ],
    trivia: [
      "Penner's bounce curve dips to 0.75, 0.9375 and 0.984375, so each bounce is a quarter of the height of the one before. In physics terms, that's a ball with a coefficient of restitution of 0.5.",
      "A clockwork model of planets on orbits is called an orrery, after Charles Boyle, 4th Earl of Orrery, for whom an early one was built around 1713.",
      "The spinning dashed middle ring is just a dashed stroke whose starting offset moves with the rotation angle. No geometry actually rotates.",
      "Adjacent orbits turning in opposite directions is a classic trick for making layered motion readable: the eye separates the layers by direction."
    ]
  },
  easing: {
    meta: "GUIDE / EASING",
    title: "Easing Guide",
    summary: "A reference and playground for easing functions: 15 families, most with in, out and in-out versions. Each one drives live demos, shows its formula, and can be tuned with sliders and copied as JavaScript or CSS.",
    math: [
      { name: "What an easing does", formula: "value = start + (end − start) · f(t)", text: "Time t runs evenly from 0 to 1. The easing f reshapes it, so equal steps of time no longer give equal steps of motion." },
      { name: "Out is a flipped in", formula: "out(t) = 1 − in(1 − t)", text: "Every ease-out is its ease-in rotated 180°. That's why the families come in matching pairs." },
      { name: "In-out is two halves", formula: "inOut(t) = in(2t) / 2            for t < ½\ninOut(t) = 1 − in(2 − 2t) / 2     for t ≥ ½", text: "A half-size ease-in followed by a half-size ease-out, meeting at (½, ½)." },
      { name: "Peak speed", formula: "power n in-out:  max f′(t) = n", text: "For the polynomial family, the in-out's fastest moment is n times the average speed, which is a handy way to compare how 'strong' a curve feels." }
    ],
    curves: [
      { key: "inOutCubic", label: "In-out cubic" },
      { key: "outBack", label: "Out back" },
      { key: "outElastic", label: "Out elastic" },
      { key: "outBounce", label: "Out bounce" }
    ],
    trivia: [
      "Nearly every easing library traces back to Robert Penner's easing equations for Flash (~2001), which he released under an open-source licence.",
      "The idea itself is older: Disney's 'slow in and slow out', one of the 12 principles of animation in <i>The Illusion of Life</i> (1981).",
      "Penner's bounce constants 2.75 and 7.5625 come from a ball losing half its speed per bounce. The guide's Bounce sliders rebuild them from that physics.",
      "CSS gained linear() in 2023, so bounce and elastic curves can finally be approximated in pure CSS, and the guide generates them for you."
    ]
  }
};

function plot(curve) {
  const fn = ease[curve.key];
  const W = 160; const H = 110; const pad = 18;
  const top = pad; const bottom = H - pad; // y=0 at bottom, y=1 at top; room for overshoot
  const y = (v) => bottom - v * (bottom - top);
  const points = Array.from({ length: 121 }, (_, i) => {
    const t = i / 120;
    return `${(pad + t * (W - 2 * pad)).toFixed(1)},${y(fn(t)).toFixed(1)}`;
  }).join(" ");
  return `<figure class="curve" data-curve="${curve.key}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Graph of ${curve.label}">
      <line x1="${pad}" x2="${W - pad}" y1="${y(0)}" y2="${y(0)}" class="curve-axis"/>
      <line x1="${pad}" x2="${W - pad}" y1="${y(1)}" y2="${y(1)}" class="curve-axis is-dashed"/>
      <polyline points="${points}" class="curve-line"/>
      <line x1="${W - 6}" x2="${W - 6}" y1="${y(0)}" y2="${y(1)}" class="curve-axis"/>
      <circle r="3.5" class="curve-dot" cx="${pad}" cy="${y(0)}"/>
      <circle r="4.5" class="curve-ball" cx="${W - 6}" cy="${y(0)}"/>
    </svg>
    <figcaption>${curve.label}</figcaption>
  </figure>`;
}

function render(study) {
  return `
    <p class="info-meta">${study.meta}</p>
    <h2 id="study-info-title">${study.title}</h2>
    <p class="info-summary">${study.summary}</p>
    <h3>History &amp; trivia</h3>
    <ul class="info-trivia">${study.trivia.map((fact) => `<li>${fact}</li>`).join("")}</ul>
    <h3>The math</h3>
    <ol class="info-math">${study.math.map((item) => `
      <li><strong>${item.name}</strong><pre>${item.formula}</pre><p>${item.text}</p></li>`).join("")}
    </ol>
    <h3>Easing &amp; motion curves</h3>
    <div class="info-curves">${study.curves.map(plot).join("")}</div>`;
}

// While the popup is open, a dot traces each curve at a steady pace in time, and the ball
// on the right rises by the eased value, so the easing itself is visible.
const PLAY = 1.6; const REST = .6; // seconds
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let frame = 0;
function animateCurves(now) {
  const cycle = (now / 1000) % (PLAY + REST);
  const t = Math.min(cycle / PLAY, 1);
  body.querySelectorAll(".curve").forEach((figure) => {
    const v = ease[figure.dataset.curve](t);
    const [W, H, pad] = [160, 110, 18];
    const y = H - pad - v * (H - 2 * pad);
    figure.querySelector(".curve-dot").setAttribute("cx", (pad + t * (W - 2 * pad)).toFixed(1));
    figure.querySelector(".curve-dot").setAttribute("cy", y.toFixed(1));
    figure.querySelector(".curve-ball").setAttribute("cy", y.toFixed(1));
  });
  frame = requestAnimationFrame(animateCurves);
}

const dialog = document.querySelector("#study-info");
const body = dialog.querySelector(".info-body");
let opener = null;

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-info]");
  if (!button) return;
  const study = studies[button.dataset.info];
  if (!study) return;
  opener = button;
  body.innerHTML = render(study);
  body.scrollTop = 0;
  dialog.showModal();
  cancelAnimationFrame(frame);
  if (!reducedMotion) frame = requestAnimationFrame(animateCurves);
});
dialog.querySelector(".info-close").addEventListener("click", () => dialog.close());
// Clicking the backdrop (the dialog element itself, outside its panel) closes it.
dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener("close", () => { cancelAnimationFrame(frame); opener?.focus(); });
