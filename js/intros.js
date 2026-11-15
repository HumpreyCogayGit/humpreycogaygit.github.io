// Loading-screen preludes. Each one draws on the startup canvas, lands on the name's
// rules, and returns a stop function. One is picked at random per visit; append new
// preludes here. `duration` (ms) is the minimum loader time; it defaults to the app's.
// Force a specific one with `?intro=<id>` for testing. Keep the ?v= on the imports in step
// with INTRO_VERSION in app.js.
import { playIntroLines, LINES_REVEAL_AT, LINES_DURATION } from "./intro-lines.js?v=11";
import { playIntroTracers, TRACERS_REVEAL_AT } from "./intro-tracers.js?v=11";
import { playIntroOrbits, ORBITS_REVEAL_AT } from "./intro-orbits.js?v=11";

export const intros = [
  { id: "lissajous", play: playIntroLines, revealAt: LINES_REVEAL_AT, duration: LINES_DURATION },
  { id: "tracers", play: playIntroTracers, revealAt: TRACERS_REVEAL_AT },
  { id: "orbits", play: playIntroOrbits, revealAt: ORBITS_REVEAL_AT }
];

export function pickIntro() {
  const requested = new URLSearchParams(location.search).get("intro");
  return intros.find((intro) => intro.id === requested) ?? intros[Math.floor(Math.random() * intros.length)];
}
