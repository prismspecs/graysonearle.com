/*! A Fly Like Thee 1.0.0 | Olivier Jonvaux | Web Residencies 22, Akademie Schloss Solitude | MIT */
(function () {
/* ===================================================================
   A FLY LIKE THEE: settings
   Olivier Jonvaux, Web Residencies 22, Akademie Schloss Solitude
   =================================================================== */

// Images sit in ../img/, next to this script's folder, unless the page
// gives their addresses (window.FLY_LIKE_THEE.sheet and .wings).
const FLY_BASE = ((document.currentScript && document.currentScript.src) || '')
  .replace(/[^/]*$/, '') + '../img/';
// Body sheet rendered in Blender WITHOUT wings, 30 frames: 8 walk,
// 6 front-tarsi grooming, 6 hind-tarsi grooming, 4 resting poses,
// 2 shiver, 4 flight with tucked legs. The wings are separate layers.
const SHEET_192 = (window.FLY_LIKE_THEE || {}).sheet || FLY_BASE + 'fly_sheet.webp';
// Wings, rendered once and mirrored: left then right.
const WINGS = (window.FLY_LIKE_THEE || {}).wings || FLY_BASE + 'fly_wings.webp';
// Where the wing roots sit and how the thorax is turned, frame by
// frame, in 512 px sheet space: [rootLx, rootLy, rootRx, rootRy, yaw].
const ATTACH = {"size":512,"rest":20,"restYaw":0.048,"pivL":[279.45,235.51],"pivR":[232.52,235.55],"f":[[279.44,235.2,232.52,235.24,0.048],[279.19,235.05,232.29,234.38,-0.932],[279.19,235.0,232.29,234.33,-0.929],[279.21,235.47,232.3,234.8,-0.958],[279.45,235.83,232.52,235.87,0.048],[279.62,236.06,232.72,236.81,1.133],[279.62,236.11,232.71,236.86,1.136],[279.63,235.6,232.73,236.35,1.106],[279.45,242.68,232.53,242.71,0.048],[279.45,242.68,232.53,242.71,0.048],[279.45,242.68,232.53,242.71,0.048],[279.45,242.68,232.53,242.71,0.048],[279.45,242.68,232.53,242.71,0.048],[279.45,242.68,232.53,242.71,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,240.17,232.52,240.21,0.048],[279.45,235.51,232.52,235.55,0.048],[279.45,235.51,232.52,235.55,0.048],[279.45,235.51,232.52,235.55,0.048],[279.45,235.51,232.52,235.55,0.048],[279.21,235.47,232.3,234.8,-0.958],[279.21,235.47,232.3,234.8,-0.958],[279.44,233.15,232.52,233.18,0.048],[279.44,233.15,232.52,233.18,0.048],[279.44,233.15,232.52,233.18,0.048],[279.44,233.15,232.52,233.18,0.048]]};

const CONFIG = {
  // ── Sprite sheet ──────────────────────────────────────────────
  sheetURL:    null,            // optional full-resolution sheet: overrides
                                // the standard one when given
  embedded:    SHEET_192,       // standard sheet, 192 px per frame
  dabURL:      null,            // proboscis dabbing sheet, once rendered
  frameCount:  24,
  walkFrames:  8,               // walk cycle, loops
  groomFrames: 6,               // frames per grooming gesture
  groomSets:   2,               // gestures on the sheet: front tarsi, then hind
  flyFrames:   4,               // flight frames, at the very end of the
                                // sheet: wings fanned, legs tucked. What
                                // sits between grooming and flight is the
                                // resting poses.
  spriteFacing: 90,             // degrees added: the sprite faces up

  // ── Characters ────────────────────────────────────────────────
  // Each fly is born with a character. It sets how readily it stops,
  // runs, grooms, flees and seeks the others, plus a behaviour of its own
  // for some of them. Two flies of the same character still differ a
  // little: every value is jittered at birth.
  //
  //   weight  how common the character is
  //   stop    readiness to stop          run    length of its runs
  //   speed   walking pace               nerve  jitter and path curvature
  //   fly     eagerness to take off      flee   distance that alarms it
  //   groom   share of stops spent       micro  share of short darts
  //           grooming                   group  pull toward the others
  //   ignore  chance of not caring about a given cursor approach
  characters: {
    shy:        { weight: 16, stop: 1.6, run: .55, speed: .85, nerve: 1.2,
                  fly: .6,  flee: 1.9, groom: 1.4, micro: 1.5, group: .2 ,
                  ignore: .05 },
    outgoing:   { weight: 16, stop: .55, run: 1.7, speed: 1.15, nerve: .7,
                  fly: 1.1, flee: .45, groom: .6, micro: .5, group: 1.8 ,
                  ignore: .45 },
    courting:   { weight: 12, stop: .8,  run: .9,  speed: 1.2, nerve: 1.0,
                  fly: .8,  flee: .9,  groom: .5, micro: 1.0, group: 0,
                  ignore: .55,
                  follows: true },  // picks a partner and tails it
    nervous:    { weight: 16, stop: 1.1, run: .5,  speed: 1.25, nerve: 2.0,
                  fly: 2.4, flee: 1.4, groom: .8, micro: 2.0, group: .6 ,
                  ignore: 0 },
    placid:     { weight: 16, stop: 1.8, run: .8,  speed: .7,  nerve: .5,
                  fly: .3,  flee: .7,  groom: 1.0, micro: .4, group: 1.0 ,
                  ignore: .75 },
    fastidious: { weight: 12, stop: 1.5, run: .7,  speed: .9,  nerve: .8,
                  fly: .5,  flee: 1.0, groom: 2.2, micro: .8, group: .7 ,
                  ignore: .35 },
    curious:    { weight: 12, stop: .9,  run: 1.1, speed: 1.0, nerve: 1.0,
                  fly: .7,  flee: .35, groom: .7, micro: 1.2, group: .5,
                  ignore: .5,
                  approaches: true }, // drifts toward the cursor
  },
  charJitter: .18,              // spread between two flies of one character

  // ── Grooming sequences ────────────────────────────────────────
  groomChain: .55,              // chance of moving straight on to another
                                // gesture instead of settling. A real fly
                                // works through front tarsi, then hind,
                                // then starts over.
  groomChainMax: 4,             // gestures in a row, at most

  // A grooming bout is not one steady rub. The fly rubs, holds still with
  // its tarsi together, rubs again, drops its legs for a moment, starts
  // over. These two pauses are what turn a loop into a behaviour.
  groomHold:  .40,              // chance of freezing mid-rub
  groomHoldTime: [.12, .45],    // how long it holds, tarsi still joined
  groomRest:  .35,              // chance of settling between two gestures
  groomRestTime: [.25, .90],    // how long before picking it up again

  // ── Wing shiver ───────────────────────────────────────────────
  shiverFrames: 2,              // frames on the sheet, between the resting
                                // poses and the flight ones
  shiverChance: .35,            // chance per resting pose of a shiver
  shiverTime: [.10, .22],       // how long it lasts
  shiverRate: 14,               // flicks per second

  // ── Startle ───────────────────────────────────────────────────
  scrollStartle: .55,           // share of flies that jump when the page
                                // scrolls. They react to a human presence,
                                // not to the content.
  scrollFly:  .25,              // and this share of those take off

  // ── Clustering ────────────────────────────────────────────────
  clusterChance: .30,           // chance a run curves toward the others.
                                // Flies avoid each other but never seek
                                // each other, which leaves them too evenly
                                // spread.
  clusterFar:  240,             // px beyond which the group starts pulling

  // ── Wings ─────────────────────────────────────────────────────
  // Wings are drawn separately from the body and steered here. Angles
  // are in degrees, positive meaning outward, measured from the folded
  // position they were rendered in.
  wingSpread: {                 // resting spread, by character
    shy: [0, 3], outgoing: [9, 15], courting: [3, 7], nervous: [2, 10],
    placid: [5, 9], fastidious: [1, 4], curious: [3, 8] },
  wingAsym:   2.5,              // built-in left/right difference, per fly
  wingAskew:  .30,              // chance a settled fly holds one wing askew
  wingAskewAmp: [12, 26],       // how far that wing strays
  wingLift:   16,               // hind grooming: wings raised off the back.
  wingLiftScale: .55,           // Seen from above a raised wing looks
                                // shorter: it is foreshortened, not bent.
  wingShiver: 24,               // amplitude of a wing shiver
  wingCourt:  58,               // courtship: one wing held out and vibrated
  wingCourtRate: 11,            // vibrations per second
  wingFly:    66,               // in flight: wings out
  wingBeatAmp: 24,              // and sweeping
  wingBeat:   23,               // beats per second, faster than the screen
                                // on purpose: it must never settle
  wingRate:   1800,             // °/s when a wing moves to a new angle.
                                // Insect wings snap from one position to the
                                // next and hold: at 420 °/s they swung shut
                                // smoothly, like a car door.

  // ── Population ────────────────────────────────────────────────
  count:      0,                // set by the robots: one fly each
  size:       70,               // displayed width, px
  sizeVary:   14,               // % spread below the reference size
  sizeUpRatio: .4,              // the spread above it is shorter: the
                                // biggest fly stays close to `size`

  // ── Gait ──────────────────────────────────────────────────────
  // Speed is expressed in BODY LENGTHS per second, the only unit that
  // means anything here. Musca domestica walks at 10 to 25 mm/s for a
  // 7 mm body, i.e. 1.4 to 3.6 body lengths per second.
  bodyRatio:  .717,             // share of the frame the body occupies
                                // = 0.86 (mesh length) / 1.20 (ortho scale)
  speedBody:  2.0,              // body lengths per second
  sizeSpeedBias: 0,             // how size feeds speed.
                                //   0  every fly walks at the same body
                                //      lengths per second. Biologically
                                //      right, but the eye reads relative
                                //      speed, so they all look alike.
                                //  -1  every fly walks at the same pixels
                                //      per second: big ones then look
                                //      slow and heavy, small ones brisk.
                                // -0.5 is a good middle ground.
  speedVary:  30,               // % spread
  accelBody:  14,               // body lengths per second squared
  runBody:    3.2,              // average run length, in body lengths
  cadence:    100,              // %: 100 means legs track the ground
  strideRatio: .200,            // ground covered by one leg cycle, as a
                                // share of displayed size = STRIDE / ortho
  saturation:  8,               // how hard the cadence ceiling bites
  maxStepRate: 7,               // cycles/s ceiling: 8 frames at 60 Hz
                                // cannot show more

  // ── Turning ───────────────────────────────────────────────────
  // A fly does not pivot on the spot before setting off: it turns WHILE
  // walking. Every run gets a constant curvature drawn at random.
  curveChance: .45,             // share of runs that curve
  turnTotal:  [12, 85],         // TOTAL heading change over one run, in
                                // degrees. Drawing a rate instead let a
                                // long run accumulate a full circle: at
                                // 70 °/s over 2.5 s the fly spun on the
                                // spot. An angle cannot overshoot.
  turnAmp:    70,               // kept for the panel: caps the total
  steerRate:  260,              // °/s correction when a heading is imposed:
                                // frame edge, exit, flight
  wobble:     6,                // heading drift while walking, °/s
  spacing:    26,               // px of clearance before swerving around
                                // another fly. 0 disables avoidance.
  avoidRate:  260,              // °/s of the swerve
  bodyGap:    .34,              // contact radius on the glass, as a share of
                                // size. Two flies' centres never come closer
                                // than the sum. In the air there is none.
  avoidMax:   75,               // total degrees one encounter may turn.
                                // Without a cap, two flies nose to nose
                                // swerve at 260 °/s for as long as they
                                // face each other: a full circle in under
                                // two seconds.

  // ── Turning on the ground ─────────────────────────────────────
  // A walking insect turns by stepping: no speed, no turn. Every heading
  // change on the glass is bound to the actual speed through a minimum
  // turning radius. This is what forbids spinning on the spot, whether
  // after a stop, at a frame edge, around a neighbour or in flight from
  // the cursor.
  turnRadius:  .60,             // minimum turning radius, in body lengths
  maxTurnRate: 190,             // °/s ceiling, whatever the speed
  turnPerBody: 55,              // at most this many degrees per body length
                                // travelled: a short dart turns little
  fleeSide:    110,             // escape at most this far off the current
                                // heading: sideways, never a half-turn
  airSteer:    700,             // °/s once airborne, where turns are jumps

  // ── Stopping ──────────────────────────────────────────────────
  runLengthVary: [.55, 1.6],
  pauseFreq:  55,               // % chance of stopping between two runs
  pauseDur:   200,              // reference stop length, hundredths of a second
  pauseVary:  70,               // spread. Higher means mostly brief stops
                                // with the occasional long stillness.
  microChance: .40,             // share of departures that are a short dart
                                // of a few pixels rather than a full run.
                                // A fly rarely commits to a long walk.
  microRun:   [.08, .24],       // dart length, in seconds
  stopSpeed:  6,                // px/s below which the fly counts as stopped

  // ── What it does while stopped ────────────────────────────────
  groomChance: .45,             // share of stops spent rubbing tarsi
  groomRate:  3.2,              // rub cycles per second
  groomTime:  [.8, 1.8],        // grooming length, seconds. A gesture that
                                // runs for five seconds does not exist.
  poseChange: 1.1,              // average seconds between two resting poses.
                                // The poses differ only by head angle, so
                                // switching reads as a head saccade.

  // ── Flight ────────────────────────────────────────────────────
  // No extra sprite frames: a flying fly IS a blur. The sprite lifts off
  // the plane with a slight enlargement, a CSS blur and a stretch along
  // the direction of travel. Detail disappears, which is exactly what
  // happens in life.
  flyChance:  .10,              // share of stops that end in a take-off
  flyPanic:   .45,              // within this fraction of fleeRadius the fly
                                // takes off instead of running. A cornered
                                // insect flies: this is the moment the
                                // illusion tips.
  flySpeed:   16,               // body lengths per second in the air
  flyTime:    [.5, 1.5],        // seconds aloft
  flyCeilingCalm: [.35, .70],   // ceiling when the fly takes off of its own
                                // accord: a low hop, close to the glass
  flyCeilingPanic: [.80, 1.0],  // ceiling when the cursor drove it off: it
                                // climbs hard and goes soft at once
  flyPanicSpeed: 1.35,          // and flies faster
  flyPanicTime: 1.6,            // and stays up longer, as a multiplier
  flyCeiling: [.40, 1.0],       // how high a given flight goes. The whole
                                // point of varying it: altitude drives both
                                // size and blur, so a low pass skims the
                                // glass while a high one goes soft and large.
  flyBob:     .30,              // slow altitude swing during the flight, as
                                // a fraction of the ceiling. A fly does not
                                // hold one height.
  flyBobRate: [.5, 1.5],        // that swing, in cycles per second
  flyRise:    .45,              // enlargement at full altitude: the fly
                                // leaves the glass and nears the eye
  flyBlur:    2.4,              // px of blur at full altitude. Kept low: a
                                // heavy blur on a mostly transparent sprite
                                // eats the silhouette and leaves a smudge.
  smearGain:  1.0,              // how much of the real per-frame travel
                                // becomes elongation. 1 = exactly the
                                // distance covered in one frame, which is
                                // what a camera would record.
  smearMax:   .30,              // ceiling on that elongation. Past this the
                                // fly turns into a stick.
  wingRate:   18,               // wing-beat cycles per second. A real fly
                                // beats at 200 Hz: any value that keeps the
                                // frames churning will do.
  flySaccade: [.12, .38],       // seconds between two mid-air heading jumps
  flyTurn:    [25, 85],         // degrees per jump. Flight turns are
                                // instantaneous, unlike walking.
  takeoffTime: .13,             // seconds to leave the ground
  landTime:   .22,              // seconds to settle back

  // ── Cursor flight ─────────────────────────────────────────────
  fleeRadius: 90,               // px. Cursor distance that sets off a dash.
  fleeSpeed:  2.6,              // speed multiplier while fleeing
  fleeTime:   .9,               // seconds of flight after the alarm
  fleeIdle:   2.5,              // seconds of cursor stillness after which it
                                // stops being alarming

  loomSpeed:  400,              // px/s of approach that truly frightens
  groomAbsorb: .5,              // a grooming fly reacts this much less
  habitGain:  .25,              // each approach makes it a little more used to it
  habitDecay: 20,               // seconds to forget completely

  // ── Lifecycle ─────────────────────────────────────────────────
  topGuard:   1.4,              // distance to the top edge, in fly sizes,
                                // below which it turns back down
  runsMin:    4,                // runs before leaving the frame
  runsMax:    14,
  respawnMin: 0.2,
  respawnMax: 3.0,
  margin:     90,               // off-frame margin for entering and leaving
  debug:      false,
  showTraits: false,
  respectReducedMotion: true,

  // ── On a host site ────────────────────────────────────────────
  panel:      false,            // no settings panel
  sceneId:    'fly-like-thee',  // id of the layer, unlikely to exist already
  classPrefix: 'flt-',          // .flt-fly: never meets the site's own classes
};

// Settings given by the page override the defaults.
Object.assign(CONFIG, (window.FLY_LIKE_THEE || {}).config || {});

/* ── In-place reorientation ────────────────────────────────────────
   A stopped fly does not stay locked on one heading. Every few seconds
   it turns 20 to 40 degrees on the spot, in two to four quick steps of
   its legs, then freezes again. Walking never pivots; this is the one
   exception, and it only happens at rest. */
const SHUFFLE = {
  every:   [1.6, 5.0],   // seconds of stillness between two reorientations
                         // (divided by the character's nerve: nervous flies
                         // shuffle more often, placid ones less)
  chance:  .70,          // chance a due reorientation actually happens
  angle:   [20, 40],     // total turn, degrees
  steps:   [2, 4],       // jerks it is split into
  rate:    260,          // degrees per second during a jerk
  hold:    [.04, .11],   // seconds frozen between two jerks
  cadence: 9,            // leg cycles per second while turning
};

/* ── Individual tone ───────────────────────────────────────────────
   Every fly gets its own slight shade, drawn at birth, so two flies side
   by side never look copy-pasted. Applied to the body layer only: the
   wings stay translucent and take their colour from what lies beneath. */
const TONE = {
  brightness: [.84, 1.12],   // darker to lighter
  saturate:   [.75, 1.20],   // greyer to warmer
};

/* ── Freezing ──────────────────────────────────────────────────────
   A frightened fly never reacts instantly. It freezes, mid-stride if it
   was walking, adjusts its posture, then bolts away from the threat.
   Faced with a slow approach, it may just stay frozen and not flee. */
const FREEZE = {
  react:      [.10, .20],  // seconds frozen before taking off
  dart:       [.05, .12],  // seconds frozen before running off
  holdSlow:   .5,          // an approach slower than this share of
                           // CONFIG.loomSpeed counts as slow
  holdChance: .40,         // chance a slow approach only freezes it
  hold:       [.8, 2.5],   // how long it stays frozen then
  wingsUp:    14,          // degrees the wings open just before a jump
};

/* ── Encounters ────────────────────────────────────────────────────
   Two flies that bump into each other on the glass rarely slide past
   politely. Often one hops off a few centimetres, or both stop and push
   at each other with their forelegs. */
const ENCOUNTER = {
  hop:        .30,          // chance one of them hops away
  box:        .25,          // chance they spar with their forelegs
                            // (otherwise they just slide past)
  cooldown:   2.5,          // seconds before the same fly reacts again
  hopTime:    [.15, .35],   // seconds in the air
  hopCeiling: [.20, .45],   // a hop stays close to the glass
  boxTime:    [.30, .70],   // seconds of sparring
};

/* ── Gait ──────────────────────────────────────────────────────────
   A fly does not glide at constant speed: it moves in pulses, one per
   tripod of legs, two per leg cycle. */
const GAIT = {
  pulse:  .30,   // speed swing around the mean, as a share (0 = smooth)
  offset: 0,     // phase shift, in frames, to line the pulses up with
                 // the legs on the sheet
};

/* ── Proboscis dabbing ─────────────────────────────────────────────
   After grooming, the most typical gesture of a settled fly: it dabs
   the surface with its proboscis. Needs a separate sheet rendered in
   Blender (see the notes that came with this file). Until that file
   exists, the gesture is simply never chosen. */
const DAB = {
  url:    CONFIG.dabURL === undefined ? 'fly_dab.png' : CONFIG.dabURL,   // single row of square frames, same framing as
                           // the main sheet, no wings. A data URI works too.
  chance: .30,             // share of stops spent dabbing
  rate:   2.2,             // dabs per second
  time:   [.8, 2.4],       // seconds of a dabbing bout
  pause:  .35,             // chance of a short stillness between two dabs
  pauseTime: [.12, .45],
};
const dab = { url: '', frames: 0, ready: false };
{
  const img = new Image();
  img.onload = () => {
    dab.url = img.src;
    dab.frames = Math.max(1, Math.round(img.width / img.height));
    dab.ready = true;
  };
  if (DAB.url) img.src = DAB.url;
}

const TAU = Math.PI * 2;
const rad = d => d * Math.PI / 180;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];

/* ── Sprite sheet ─────────────────────────────────────────────── */

const sprite = { url: '', frames: 30, walk: 8, groom0: 8, groom: 6, sets: 2,
                 rest0: 20, rest: 4, shiver0: 24, shiver: 2,
                 fly0: 26, fly: 4, ready: false };

function useSheet(img) {
  sprite.url = img.src;
  const guess = Math.round(img.width / img.height);
  sprite.frames = guess > 1 ? guess : CONFIG.frameCount;

  sprite.walk = Math.min(CONFIG.walkFrames, sprite.frames);
  sprite.groom0 = sprite.walk;
  sprite.groom = Math.min(CONFIG.groomFrames, sprite.frames - sprite.walk);
  sprite.sets = sprite.groom
    ? Math.min(CONFIG.groomSets,
               Math.floor((sprite.frames - sprite.walk) / sprite.groom))
    : 0;
  // Sheet order: walk · grooming · resting poses · wing shiver · flight.
  sprite.rest0 = sprite.walk + sprite.groom * sprite.sets;
  sprite.fly = Math.min(CONFIG.flyFrames, sprite.frames - sprite.rest0);
  sprite.fly0 = sprite.frames - sprite.fly;
  sprite.shiver = Math.min(CONFIG.shiverFrames, sprite.fly0 - sprite.rest0);
  sprite.shiver0 = sprite.fly0 - sprite.shiver;
  sprite.rest = sprite.shiver0 - sprite.rest0;
  sprite.ready = true;
}

/* ── Cursor ───────────────────────────────────────────────────────
   Position and smoothed velocity. The velocity is what tells a hand
   swooping down from one drifting past. */

const cursor = { x: 0, y: 0, vx: 0, vy: 0, t: 0, seen: false };
addEventListener('pointermove', e => {
  const now = performance.now();
  const dt = Math.max((now - cursor.t) / 1000, .008);
  if (cursor.seen) {
    cursor.vx = cursor.vx * .7 + (e.clientX - cursor.x) / dt * .3;
    cursor.vy = cursor.vy * .7 + (e.clientY - cursor.y) / dt * .3;
  }
  cursor.x = e.clientX; cursor.y = e.clientY;
  cursor.t = now; cursor.seen = true;
}, { passive: true });

// Flies react to a human presence, not to the content: a scroll means
// someone is there. Indifferent characters may not care.
let lastScroll = 0;
addEventListener('scroll', () => {
  const now = performance.now();
  if (now - lastScroll < 400) return;      // one startle per gesture
  lastScroll = now;
  for (const f of flies) {
    if (f.dead || f.lift > .05) continue;
    if (Math.random() < f.ignore) continue;
    if (Math.random() > CONFIG.scrollStartle) continue;
    f.stopIdle();
    if (Math.random() < CONFIG.scrollFly) { f.takeOff(false); continue; }
    f.state = 'walk';
    f.timer = rand(.10, .28);              // a short startled dart
    f.newCurve(f.timer);
  }
}, { passive: true });

const scene = document.getElementById(CONFIG.sceneId || 'scene') || (() => {
  const d = document.createElement('div');
  d.id = CONFIG.sceneId || 'scene';
  d.setAttribute('aria-hidden', 'true');
  document.body.appendChild(d);
  return d;
})();
const view = { w: 0, h: 0 };
let flies = [], running = true, last = 0;

/* Weighted draw among the characters. */
function pickCharacter() {
  const entries = Object.entries(CONFIG.characters);
  const total = entries.reduce((s, [, c]) => s + c.weight, 0);
  let r = Math.random() * total;
  for (const [name, c] of entries) { r -= c.weight; if (r <= 0) return name; }
  return entries[0][0];
}

/* Mean position of the other flies, for the mild pull toward the group. */
function centroid(self) {
  let x = 0, y = 0, n = 0;
  for (const o of flies) {
    if (o === self || o.dead) continue;
    x += o.x; y += o.y; n++;
  }
  return n ? { x: x / n, y: y / n } : null;
}

/* ===================================================================
   ONE FLY
   states: enter · walk · stop · pause · freeze · takeoff · fly · land · exit
   =================================================================== */

class Fly {
  constructor() { this.spawn(); }

  spawn() {
    const W = view.w, H = view.h, m = CONFIG.margin;
    for (let essai = 0; essai < 12; essai++) {
      this.place(W, H, m);
      const libre = flies.every(o => o === this || o.dead
        || Math.hypot(o.x - this.x, o.y - this.y) > CONFIG.size * .9);
      if (libre) break;
    }
    this.init();
  }

  place(W, H, m) {
    const edge = pick(['b', 'l', 'r']);
    if (edge === 'b') { this.x = rand(0, W); this.y = H + m; this.a = rad(rand(230, 310)); }
    // Sur les côtés : pas trop près du haut, et cap horizontal ou descendant.
    if (edge === 'l') { this.x = -m; this.y = rand(H * .25, H); this.a = rad(rand(-15, 40)); }
    if (edge === 'r') { this.x = W + m; this.y = rand(H * .25, H); this.a = rad(rand(140, 195)); }
  }

  init() {
    const v = CONFIG.sizeVary / 100, sv = CONFIG.speedVary / 100;
    // Asymmetric spread: small flies get a little smaller, big ones barely
    // exceed the reference size.
    this.scale = rand(1 - v, 1 + v * CONFIG.sizeUpRatio);
    this.vFactor = rand(1 - sv, 1 + sv);
    this.setCharacter(pickCharacter());
    this.phase = Math.random() * sprite.walk;
    this.runsLeft = (rand(CONFIG.runsMin, CONFIG.runsMax + 1)) | 0;
    this.dead = false;
    this.side = Math.random() < .5 ? -1 : 1;
    this.swerved = 0;
    this.frozen = null;
    this.grooming = false;
    this.gset = 0;
    this.gphase = 0;
    this.tGroom = 0;
    this.flight = 0;
    this.panic = false;
    this.tPose = 0;
    this.tShiver = 0;
    this.shPhase = 0;
    this.gLeft = 0;
    this.gHold = 0;
    this.gBack = 0;
    this.curve = 0;
    this.lift = 0;
    this.ceiling = 1;
    this.bobPh = 0; this.bobRate = 1;
    this.wing = 0;
    this.airTime = 0;
    this.tSacc = 0;
    this.aim = null;
    this.habit = 0;              // 0 watchful, close to 1 used to the cursor
    this.verdict = null;         // decision taken for the current approach
    this.spin = null;            // in-place reorientation under way, if any
    this.tTurn = this.nextTurn();
    this.tone = 'brightness(' + rand(TONE.brightness[0], TONE.brightness[1]).toFixed(3)
      + ') saturate(' + rand(TONE.saturate[0], TONE.saturate[1]).toFixed(3) + ')';
    this.toneSet = false;        // written once, at the next draw
    this.freezeAct = null;       // what it will do when the freeze ends
    this.escape = 0;
    this.tBump = 0;              // encounter cooldown
    this.dabbing = false;
    this.dphase = 0;
    this.tDab = 0;
    this.dHold = 0;
    this.v = this.speed;

    this.state = 'enter';
    this.timer = this.runDuration();
    this.newCurve(this.timer);
  }

  setCharacter(name) {
    const c = CONFIG.characters[name];
    const j = () => 1 + rand(-CONFIG.charJitter, CONFIG.charJitter);
    this.trait  = name;
    this.tStop  = c.stop  * j();
    this.tNerve = c.nerve * j();
    this.tFly   = c.fly   * j();
    this.cRun   = c.run   * j();
    this.cSpeed = c.speed * j();
    this.cFlee  = c.flee  * j();
    this.cGroom = c.groom * j();
    this.cMicro = c.micro * j();
    this.cGroup = c.group;
    this.ignore = Math.min(.95, (c.ignore || 0) * j());
    this.follows = !!c.follows;
    this.approaches = !!c.approaches;
    this.partner = null;
    const sp = CONFIG.wingSpread[name] || [2, 7];
    this.wSpread = rand(sp[0], sp[1]);
    this.wAsym = rand(-CONFIG.wingAsym, CONFIG.wingAsym);
    this.wA = [this.wSpread + this.wAsym, this.wSpread - this.wAsym];
    this.wK = [1, 1];
    this.wPh = 0;
    this.askew = [0, 0];
    this.court = 0;
    this.courtSide = 0;
  }

  get size()  { return CONFIG.size * this.scale; }
  get body()  { return this.size * CONFIG.bodyRatio; }
  get accel() { return this.body * CONFIG.accelBody; }
  get speed() {
    const f = this.flight > 0 ? CONFIG.fleeSpeed : 1;
    const b = Math.pow(this.scale, CONFIG.sizeSpeedBias);
    return this.body * CONFIG.speedBody * this.vFactor * this.cSpeed * f * b;
  }
  runDuration() {
    const [lo, hi] = CONFIG.runLengthVary;
    return (this.body * CONFIG.runBody * this.cRun * rand(lo, hi)) / this.speed;
  }

  /* Leaving any idle state: everything that holds a frame is cleared. */
  stopIdle() {
    this.frozen = null;
    this.grooming = false;
    this.tShiver = 0;
    this.shPhase = 0;
    this.gHold = 0;
    this.gBack = 0;
    this.gLeft = 0;
    this.askew = [0, 0];
    this.spin = null;
    this.dabbing = false;
    this.dHold = 0;
  }

  /* The frame currently shown, so that a freeze can hold it. */
  curFrame() {
    if (this.dabbing) return null;           // another sheet: not holdable
    if (this.lift > .28 && sprite.fly > 0)
      return sprite.fly0 + (Math.floor(this.wing) % sprite.fly);
    if (this.grooming)
      return sprite.groom0 + this.gset * sprite.groom
             + (Math.floor(this.gphase) % sprite.groom);
    if (this.tShiver > 0 && sprite.shiver > 0)
      return sprite.shiver0 + (Math.floor(this.shPhase) % sprite.shiver);
    return this.frozen !== null ? this.frozen
                                : Math.floor(this.phase) % sprite.walk;
  }

  /* Freeze on the spot, holding the current frame, before acting.
     action: 'fly' take off, 'run' dash away, 'hold' stay put. */
  freezeFor(action) {
    const f = this.curFrame();
    this.stopIdle();
    this.frozen = f;
    this.freezeAct = action;
    this.state = 'freeze';
    this.v = 0;
    this.aim = null;
    this.curve = 0;
    const r = action === 'fly' ? FREEZE.react
            : action === 'run' ? FREEZE.dart : FREEZE.hold;
    this.timer = rand(r[0], r[1]);
  }

  /* End of a freeze: act on it, away from where the cursor is NOW. */
  unfreeze() {
    const away = Math.atan2(this.y - cursor.y, this.x - cursor.x);
    const act = this.freezeAct;
    this.freezeAct = null;
    this.frozen = null;
    if (act === 'fly') {
      this.flight = CONFIG.fleeTime;
      this.takeOff(true);
      this.aim = away + rad(rand(-30, 30));
    } else if (act === 'run') {
      const e = ((away - this.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
      const lim = rad(CONFIG.fleeSide);
      this.aim = this.a + Math.max(-lim, Math.min(lim, e));
      this.runsLeft = Math.max(this.runsLeft, 2);
      this.state = 'walk';
      this.flight = CONFIG.fleeTime;
      this.timer = this.runDuration();
    } else {
      // It decided to stay: it settles where it froze, for a moment.
      this.state = 'pause';
      this.timer = rand(.3, 1.2);
      this.settle();
    }
  }

  /* A short hop off the glass, after bumping into another fly. */
  hop(away) {
    this.takeOff(false);
    this.airTime = rand(ENCOUNTER.hopTime[0], ENCOUNTER.hopTime[1]);
    this.ceiling = rand(ENCOUNTER.hopCeiling[0], ENCOUNTER.hopCeiling[1]);
    this.aim = away + rad(rand(-40, 40));
    this.tBump = ENCOUNTER.cooldown;
  }

  /* Sparring: it stops and pushes with its forelegs, which on the sheet
     is the front-tarsi rubbing gesture. */
  spar() {
    this.stopIdle();
    this.state = 'pause';
    this.v = 0;
    this.timer = rand(ENCOUNTER.boxTime[0], ENCOUNTER.boxTime[1]);
    if (sprite.sets > 0) {
      this.grooming = true;
      this.gset = 0;
      this.gphase = 0;
      this.tGroom = this.timer;
      this.gLeft = 1;
    }
    this.tBump = ENCOUNTER.cooldown;
  }

  /* Two flies have touched on the glass: decide what comes of it. */
  bump(o) {
    if (this.tBump > 0 || o.tBump > 0 || o.dead || o.lift > .05
        || o.state === 'freeze' || this.state === 'freeze') return;
    this.tBump = o.tBump = ENCOUNTER.cooldown;
    const r = Math.random();
    if (r < ENCOUNTER.hop) {
      // The one that was bumped while standing still is usually the one
      // that jumps; otherwise either may.
      const still = o.state === 'pause' || o.state === 'stop';
      const who = still && Math.random() < .7 ? o : pick([this, o]);
      const other = who === this ? o : this;
      who.hop(Math.atan2(who.y - other.y, who.x - other.x));
    } else if (r < ENCOUNTER.hop + ENCOUNTER.box) {
      this.spar();
      o.spar();
    }
  }

  /* Seconds until the next in-place reorientation. */
  nextTurn() {
    return rand(SHUFFLE.every[0], SHUFFLE.every[1]) / Math.max(this.tNerve, .3);
  }

  /* Start turning on the spot: a total angle split into a few jerks.
     The resting pose is kept aside and restored at the end. */
  startSpin() {
    const n = Math.round(rand(SHUFFLE.steps[0], SHUFFLE.steps[1]));
    const total = rad(rand(SHUFFLE.angle[0], SHUFFLE.angle[1]))
                  * (Math.random() < .5 ? -1 : 1);
    this.spin = { step: total / n, left: total / n, steps: n - 1, hold: 0,
                  rest: this.frozen };
    this.frozen = null;          // the legs show while it turns
  }

  /* Advance the reorientation. Returns true while it is under way. */
  spinning(dt) {
    const s = this.spin;
    if (!s) return false;
    if (s.hold > 0) {            // frozen between two jerks, legs still
      s.hold -= dt;
      if (s.hold <= 0) s.left = s.step;
      return true;
    }
    const d = Math.sign(s.left)
              * Math.min(Math.abs(s.left), rad(SHUFFLE.rate) * dt);
    this.a += d;
    s.left -= d;
    this.phase = (this.phase + SHUFFLE.cadence * sprite.walk * dt) % sprite.walk;
    if (Math.abs(s.left) < 1e-4) {
      if (s.steps > 0) {
        s.steps--;
        s.left = 0;
        s.hold = rand(SHUFFLE.hold[0], SHUFFLE.hold[1]);
      } else {
        // Done: back to the resting pose it had before.
        this.frozen = s.rest;
        this.spin = null;
        this.tTurn = this.nextTurn();
      }
    }
    return true;
  }

  get airSpeed() {
    return this.body * CONFIG.flySpeed * this.vFactor
           * (this.panic ? CONFIG.flyPanicSpeed : 1);
  }

  takeOff(panic) {
    this.panic = !!panic;
    this.stopIdle();
    this.aim = null;
    this.curve = 0;
    this.state = 'takeoff';
    this.timer = CONFIG.takeoffTime;
    this.airTime = rand(CONFIG.flyTime[0], CONFIG.flyTime[1])
                   * (this.panic ? CONFIG.flyPanicTime : 1);
    this.tSacc = rand(CONFIG.flySaccade[0], CONFIG.flySaccade[1]);
    const c = this.panic ? CONFIG.flyCeilingPanic : CONFIG.flyCeilingCalm;
    this.ceiling = rand(c[0], c[1]);
    this.bobPh = Math.random() * TAU;
    this.bobRate = rand(CONFIG.flyBobRate[0], CONFIG.flyBobRate[1]);
  }

  newCurve(duration) {
    this.aim = null;
    const d = Math.max(duration || this.runDuration(), .05);
    const dist = Math.max(this.speed * d, this.body * .2);
    const maxTot = rad(CONFIG.turnPerBody) * dist / this.body;
    const vers = (tx, ty, part) => {
      const want = Math.atan2(ty - this.y, tx - this.x);
      let e = ((want - this.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
      const max = Math.min(rad(Math.min(CONFIG.turnTotal[1], CONFIG.turnAmp)) * part,
                           maxTot);
      this.curve = Math.sign(e) * Math.min(Math.abs(e), max) / dist;
    };

    if (this.follows) {
      if (!this.partner || this.partner.dead || !flies.includes(this.partner)) {
        const autres = flies.filter(o => o !== this && !o.dead);
        this.partner = autres.length ? pick(autres) : null;
      }
      if (this.partner && Math.random() < .85) {
        vers(this.partner.x, this.partner.y, 1);
        return;
      }
    }

    if (this.approaches && cursor.seen
        && (performance.now() - cursor.t) / 1000 < CONFIG.fleeIdle * 2
        && Math.random() < .7) {
      vers(cursor.x, cursor.y, .8);
      return;
    }

    if (Math.random() < CONFIG.clusterChance * this.cGroup) {
      const c = centroid(this);
      if (c && Math.hypot(c.x - this.x, c.y - this.y) > CONFIG.clusterFar) {
        vers(c.x, c.y, 1);
        return;
      }
    }
    if (Math.random() < CONFIG.curveChance) {
      const [lo, hi] = CONFIG.turnTotal;
      const total = Math.min(rad(Math.min(rand(lo, hi) * this.tNerve,
                                          CONFIG.turnAmp)), maxTot);
      this.curve = total / dist * (Math.random() < .5 ? -1 : 1);
    } else {
      this.curve = 0;
    }
  }

  /* Hard contact on the glass: the step is cut of whatever part would
     enter a neighbour, keeping only the part that slides past it. */
  contact(mx, my, dt) {
    const nx = this.x + mx, ny = this.y + my;
    const pas = Math.hypot(mx, my);
    let hit = false, tx = 0, ty = 0;
    for (const o of flies) {
      if (o === this || o.dead || o.lift > .05) continue;
      const need = (this.size + o.size) * CONFIG.bodyGap;
      const dx = nx - o.x, dy = ny - o.y, d = Math.hypot(dx, dy);
      if (d >= need || d < 1e-6) continue;
      const ux = dx / d, uy = dy / d;
      if (Math.hypot(this.x - o.x, this.y - o.y) < need) {
        mx += ux * pas * .5; my += uy * pas * .5; hit = true;
        continue;
      }
      const inward = mx * ux + my * uy;
      if (inward < 0) {
        mx -= inward * ux; my -= inward * uy;
        tx = -uy * this.side; ty = ux * this.side;
        hit = true;
        this.touched = o;
      }
    }
    if (!hit) return [mx, my];

    if (Math.hypot(mx, my) < pas * .25) { mx = tx * pas * .6; my = ty * pas * .6; }

    const want = Math.atan2(my, mx);
    const e = ((want - this.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    const used = Math.abs(((this.a - this.a0 + Math.PI) % TAU + TAU) % TAU - Math.PI);
    const cap = Math.max(0, this.turnCap() * dt - used);
    this.a += Math.max(-cap, Math.min(cap, e));
    this.v *= .94;
    return [mx, my];
  }

  /* Highest turning rate available right now, in rad/s. */
  turnCap() {
    const r = Math.max(this.body * CONFIG.turnRadius, 1);
    return Math.min(this.v / r, rad(CONFIG.maxTurnRate));
  }

  steer(dt, air) {
    if (this.aim === null) return false;
    let d = ((this.aim - this.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    const step = (air ? rad(CONFIG.airSteer)
                      : Math.min(rad(CONFIG.steerRate), this.turnCap())) * dt;
    if (Math.abs(d) <= step) { this.a = this.aim; this.aim = null; return true; }
    this.a += Math.sign(d) * step;
    return true;
  }

  /* Sideways swerve when another fly comes up ahead. */
  avoidFlies(dt) {
    let tx = 0, ty = 0, found = false;
    const fx = Math.cos(this.a), fy = Math.sin(this.a);
    for (const o of flies) {
      if (o === this || o.dead) continue;
      const dx = o.x - this.x, dy = o.y - this.y;
      const reach = (this.size + o.size) * .5 + CONFIG.spacing;
      const d2 = dx * dx + dy * dy;
      if (d2 > reach * reach || d2 < 1e-6) continue;
      const d = Math.sqrt(d2);
      if ((fx * dx + fy * dy) / d < .1) continue;
      const w = 1 - d / reach;
      tx += dx / d * w; ty += dy / d * w;
      found = true;
    }
    if (!found) { this.swerved = 0; return false; }
    if (this.swerved >= rad(CONFIG.avoidMax)) return false;

    const cross = fx * ty - fy * tx;
    const dir = Math.abs(cross) < .05 ? this.side : -Math.sign(cross);
    const step = Math.min(rad(CONFIG.avoidRate), this.turnCap()) * dt;
    this.a += dir * step;
    this.swerved += step;
    return true;
  }

  aimOffscreen() {
    const dl = this.x, dr = view.w - this.x, db = view.h - this.y;
    const near = Math.min(dl, dr, db);
    // Caps toujours horizontaux ou descendants : jamais vers le haut.
    if (near === db)      this.aim = rad(rand(60, 120));
    else if (near === dl) this.aim = rad(rand(150, 180));
    else                  this.aim = rad(rand(0, 30));
    this.curve = 0;
    this.state = 'exit';
  }

  avoidEdges() {
    const p = CONFIG.margin * .5;
    const top = this.size * CONFIG.topGuard;
    if (this.x > p && this.x < view.w - p && this.y > top && this.y < view.h - p)
      return false;
    const cx = view.w / 2, cy = view.h / 2;
    this.aim = Math.atan2(cy - this.y, cx - this.x) + rad(rand(-45, 45));
    this.curve = 0;
    return true;
  }

  plant() {
    this.tTurn = this.nextTurn() * rand(.4, 1);
    if (dab.ready && Math.random() < DAB.chance) {
      this.dabbing = true;
      this.dphase = 0;
      this.dHold = 0;
      this.tDab = rand(DAB.time[0], DAB.time[1]);
      this.grooming = false;
      this.frozen = null;
      return;
    }
    if (sprite.sets > 0 && Math.random() < Math.min(.95, CONFIG.groomChance * this.cGroom)) {
      this.grooming = true;
      this.gset = (Math.random() * sprite.sets) | 0;
      this.gphase = Math.random() * sprite.groom;
      this.tGroom = rand(CONFIG.groomTime[0], CONFIG.groomTime[1]);
      this.gLeft = 1 + ((Math.random() * CONFIG.groomChainMax) | 0);
      this.gHold = 0;
      this.gBack = 0;
      this.frozen = null;
      return;
    }
    this.grooming = false;
    this.settle();
  }

  askewWings() {
    this.askew = [0, 0];
    if (Math.random() < CONFIG.wingAskew) {
      const [a, b] = CONFIG.wingAskewAmp;
      this.askew[Math.random() < .5 ? 0 : 1] = rand(a, b);
    }
  }

  settle() {
    this.askewWings();
    if (sprite.rest > 0) {
      this.frozen = sprite.rest0 + ((Math.random() * sprite.rest) | 0);
      this.tPose = rand(.5, 1.5) * CONFIG.poseChange;
      if (sprite.shiver > 0 && Math.random() < CONFIG.shiverChance) {
        this.tShiver = rand(CONFIG.shiverTime[0], CONFIG.shiverTime[1]);
        this.shPhase = 0;
      }
    } else {
      this.phase = 0;
      this.frozen = null;
    }
  }

  /* Reaction to the cursor. Not every fly cares: the decision is taken
     once per approach, from its character, how fast the cursor looms,
     whether it is busy grooming and how used to the cursor it has become.
     A sudden lunge close by still sends even the calmest one off. */
  alarm(dt) {
    if (this.flight > 0) this.flight -= dt;
    this.habit = Math.max(0, this.habit - dt / CONFIG.habitDecay);
    if (this.lift > .05 || !CONFIG.fleeRadius || !cursor.seen)
      return this.flight > 0;

    const idle = (performance.now() - cursor.t) / 1000;
    const dx = this.x - cursor.x, dy = this.y - cursor.y;
    const d = Math.hypot(dx, dy);
    const rayon = CONFIG.fleeRadius * this.cFlee;

    // Cursor gone or still: the approach is over, the decision forgotten.
    if (d > rayon * 1.6 || idle > CONFIG.fleeIdle) {
      this.verdict = null;
      return this.flight > 0;
    }
    if (d > rayon + this.size * .5) return this.flight > 0;

    // How fast the cursor is coming at the fly.
    const approach = idle < .12
      ? (cursor.vx * dx + cursor.vy * dy) / Math.max(d, 1) : 0;

    // One decision per approach.
    if (this.verdict === null) {
      let p = 1 - this.ignore;
      p *= Math.min(1.5, .4 + Math.max(approach, 0) / CONFIG.loomSpeed);
      if (this.grooming || this.gHold > 0) p *= CONFIG.groomAbsorb;
      p *= 1 - this.habit;
      this.verdict = Math.random() < p;
      this.habit = Math.min(.85, this.habit + CONFIG.habitGain);
    }

    // A sudden lunge close by overrides indifference.
    const lunge = approach > CONFIG.loomSpeed * 2.5 && d < rayon * .6;

    // Already frozen: it only waits, unless a lunge turns a watchful
    // freeze into an escape.
    if (this.state === 'freeze') {
      if (lunge && this.freezeAct === 'hold') {
        this.freezeAct = 'fly';
        this.timer = Math.min(this.timer, rand(FREEZE.react[0], FREEZE.react[1]));
      }
      return true;
    }

    if (!this.verdict && lunge) this.verdict = true;
    if (!this.verdict) return this.flight > 0;

    // Not fleeing yet: it freezes first, then acts. A slow approach may
    // only freeze it, after which it stays where it is.
    const grounded = this.state === 'walk' || this.state === 'stop'
                     || this.state === 'pause';
    if (this.flight <= 0 && grounded) {
      let act = d < rayon * CONFIG.flyPanic ? 'fly' : 'run';
      if (!lunge && approach < CONFIG.loomSpeed * FREEZE.holdSlow
          && Math.random() < FREEZE.holdChance) {
        act = 'hold';
        this.verdict = false;    // this approach will not scare it again
      }
      this.freezeFor(act);
      return true;
    }

    // Too close to run: it flies.
    if (d < rayon * CONFIG.flyPanic) {
      this.flight = CONFIG.fleeTime;
      this.takeOff(true);
      this.aim = Math.atan2(dy, dx) + rad(rand(-30, 30));
      return true;
    }

    // Escape sideways rather than turning round.
    const away = Math.atan2(dy, dx);
    const e = ((away - this.a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    const lim = rad(CONFIG.fleeSide);
    this.aim = this.a + Math.max(-lim, Math.min(lim, e));
    if (this.flight <= 0) {
      this.stopIdle();
      this.runsLeft = Math.max(this.runsLeft, 2);
      this.curve = 0;
      this.state = 'walk';
      this.timer = this.runDuration();
    }
    this.flight = CONFIG.fleeTime;
    return true;
  }

  /* What happens at the end of a run or a stop. */
  decide() {
    this.stopIdle();

    if (this.runsLeft <= 0) { this.aimOffscreen(); return; }

    if (this.state !== 'pause'
        && Math.random() < CONFIG.pauseFreq / 100 * this.tStop) {
      const v = CONFIG.pauseVary / 100;
      const f = (1 - v) + v * (.25 + Math.pow(Math.random(), 2.2) * 3);
      this.pauseTimer = (CONFIG.pauseDur / 100) * f * this.tStop;
      this.groomBout = null;
      this.state = 'stop';
      return;
    }

    if (this.lift < .05 && Math.random() < CONFIG.flyChance * this.tFly) {
      this.takeOff();
      this.aim = this.a + rad(rand(-70, 70));
      return;
    }

    this.state = 'walk';
    this.timer = Math.random() < Math.min(.95, CONFIG.microChance * this.cMicro)
      ? rand(CONFIG.microRun[0], CONFIG.microRun[1])
      : this.runDuration();
    this.newCurve(this.timer);
    this.runsLeft--;
  }

  update(dt) {
    if (this.dead) {
      this.timer -= dt;
      if (this.timer <= 0) this.spawn();
      return;
    }

    this.alarm(dt);
    if (this.tBump > 0) this.tBump -= dt;
    this.a0 = this.a;

    const airborne = this.state === 'takeoff' || this.state === 'fly'
                                              || this.state === 'land';
    const cruising = this.state === 'walk' || this.state === 'enter'
                                           || this.state === 'exit';
    const braking = this.state === 'stop';

    // ── heading ──────────────────────────────────────────────────
    if (airborne) {
      if (this.state === 'fly') {
        this.tSacc -= dt;
        if (this.tSacc <= 0) {
          const [lo, hi] = CONFIG.flyTurn;
          this.a += rad(rand(lo, hi)) * (Math.random() < .5 ? -1 : 1);
          this.tSacc = rand(CONFIG.flySaccade[0], CONFIG.flySaccade[1]);
        }
      }
      if (this.lift > .1) this.steer(dt, true);
      this.avoidEdges();
    } else if (cruising || braking) {
      if (!this.steer(dt)) {
        if (!(CONFIG.spacing > 0 && this.avoidFlies(dt))) {
          const cap = this.turnCap() * dt;
          const dA = this.curve * this.v * dt
            + rad(rand(-CONFIG.wobble, CONFIG.wobble)) * this.tNerve * dt
              * Math.min(1, this.v / Math.max(this.speed, 1));
          this.a += Math.max(-cap, Math.min(cap, dA));
        }
      }
    } else if (this.state === 'pause') {
      this.timer -= dt;

      if (this.spinning(dt)) {
        // Turning on the spot: nothing else happens until it is done.
      } else if (this.dabbing) {
        // Dabbing: one cycle per dab, now and then a brief stillness
        // between two, proboscis retracted.
        if (this.dHold > 0) {
          this.dHold -= dt;
        } else {
          const cycle = Math.floor(this.dphase / dab.frames);
          this.dphase += DAB.rate * dab.frames * dt;
          if (Math.floor(this.dphase / dab.frames) !== cycle
              && Math.random() < DAB.pause) {
            this.dphase = Math.floor(this.dphase / dab.frames) * dab.frames;
            this.dHold = rand(DAB.pauseTime[0], DAB.pauseTime[1]);
          }
        }
        this.tDab -= dt;
        // It stops at the end of a dab, never with the proboscis out.
        if (this.tDab <= 0 && Math.floor(this.dphase) % dab.frames === 0) {
          this.dabbing = false;
          this.settle();
        }
      } else if (this.gBack > 0) {
        this.gBack -= dt;
        if (this.gBack <= 0) {
          this.grooming = true;
          this.frozen = null;
          this.gset = (this.gset + 1) % Math.max(sprite.sets, 1);
          this.gphase = 0;
          this.tGroom = rand(CONFIG.groomTime[0], CONFIG.groomTime[1]);
        }
      } else if (this.gHold > 0) {
        this.gHold -= dt;
      } else if (this.grooming) {
        this.gphase = (this.gphase + CONFIG.groomRate * sprite.groom * dt)
                      % sprite.groom;
        this.tGroom -= dt;

        if (Math.random() < CONFIG.groomHold * dt * 3) {
          const [a, b] = CONFIG.groomHoldTime;
          this.gHold = rand(a, b);
        }

        if (this.tGroom <= 0) {
          this.gLeft--;
          if (this.gLeft > 0 && sprite.sets > 1
              && Math.random() < CONFIG.groomChain) {
            if (Math.random() < CONFIG.groomRest) {
              this.grooming = false;
              this.settle();
              const [a, b] = CONFIG.groomRestTime;
              this.gBack = rand(a, b);
            } else {
              this.gset = (this.gset + 1) % sprite.sets;
              this.gphase = 0;
              this.tGroom = rand(CONFIG.groomTime[0], CONFIG.groomTime[1]);
            }
          } else {
            this.grooming = false;
            this.settle();
          }
        }
      } else if (this.tShiver > 0) {
        this.tShiver -= dt;
        this.shPhase += CONFIG.shiverRate * dt;
      } else {
        // Settled: head saccades between resting poses...
        if (this.tPose > 0) {
          this.tPose -= dt;
          if (this.tPose <= 0 && sprite.rest > 1) {
            let n;
            do { n = sprite.rest0 + ((Math.random() * sprite.rest) | 0); }
            while (n === this.frozen);
            this.frozen = n;
            this.tPose = rand(.5, 1.5) * CONFIG.poseChange;
            if (Math.random() < .35) this.askewWings();
          }
        }
        // ...and now and then a few steps on the spot to face elsewhere.
        this.tTurn -= dt;
        if (this.tTurn <= 0) {
          if (Math.random() < SHUFFLE.chance) this.startSpin();
          else this.tTurn = this.nextTurn();
        }
      }
      const busy = this.grooming || this.gHold > 0 || this.gBack > 0
                   || this.spin !== null || this.dabbing;
      if (this.timer <= 0 && !busy) this.decide();
    }

    // ── speed ────────────────────────────────────────────────────
    let wanted = cruising ? this.speed : 0;
    if (this.state === 'takeoff' || this.state === 'fly') wanted = this.airSpeed;

    let cible = 0;
    if (this.state === 'takeoff') {
      cible = this.ceiling;
    } else if (this.state === 'fly') {
      this.bobPh += this.bobRate * TAU * dt;
      cible = this.ceiling * (1 - CONFIG.flyBob * (.5 - .5 * Math.sin(this.bobPh)));
    }
    const enVol = this.state === 'fly';
    const vitesseLift = enVol ? 1 / .45
      : 1 / (cible > this.lift ? CONFIG.takeoffTime : CONFIG.landTime);
    this.lift += Math.max(-vitesseLift * dt,
                          Math.min(vitesseLift * dt, cible - this.lift));

    const da = this.accel * (airborne ? 6 : 1) * dt;
    this.v += Math.max(-da, Math.min(da, wanted - this.v));

    let mx = Math.cos(this.a) * this.v * dt, my = Math.sin(this.a) * this.v * dt;
    // On the glass the fly moves in pulses, two per leg cycle. The mean
    // speed is unchanged: the cosine averages out over a cycle.
    if (this.lift < .05 && GAIT.pulse > 0 && sprite.walk > 0) {
      const g = 1 + GAIT.pulse
                * Math.cos(TAU * 2 * (this.phase + GAIT.offset) / sprite.walk);
      mx *= g; my *= g;
    }
    this.touched = null;
    if (this.lift < .05 && CONFIG.bodyGap > 0) [mx, my] = this.contact(mx, my, dt);
    this.x += mx;
    this.y += my;
    // Walking into another fly: something may come of it.
    if (this.touched && this.state === 'walk' && this.v > this.body * .5)
      this.bump(this.touched);

    // ── end of the current state ─────────────────────────────────
    const p = CONFIG.margin * .5;
    if (this.state === 'exit') {
      const m = CONFIG.margin;
       if (this.y < this.size * CONFIG.topGuard && Math.sin(this.a) < 0)
        this.aim = Math.cos(this.a) < 0 ? rad(160) : rad(20);
      if (this.x < -m || this.x > view.w + m || this.y < -m || this.y > view.h + m) {
        this.dead = true;
        this.timer = rand(CONFIG.respawnMin, CONFIG.respawnMax);
      }
    } else if (this.state === 'enter') {
      if (this.x > p && this.x < view.w - p && this.y > p && this.y < view.h - p) {
        this.state = 'walk';
        this.timer = this.runDuration();
        this.newCurve(this.timer);
      }
    } else if (this.state === 'freeze') {
      this.timer -= dt;
      if (this.timer <= 0) this.unfreeze();
    } else if (this.state === 'walk') {
      this.timer -= dt;
      if (!this.avoidEdges() && this.timer <= 0) this.decide();
    } else if (this.state === 'takeoff') {
      this.timer -= dt;
      if (this.timer <= 0) { this.state = 'fly'; this.timer = this.airTime; }
    } else if (this.state === 'fly') {
      this.timer -= dt;
      if (this.timer <= 0) { this.state = 'land'; this.timer = CONFIG.landTime; }
    } else if (this.state === 'land') {
      this.timer -= dt;
      const pris = flies.some(o => o !== this && !o.dead && o.lift < .05
        && Math.hypot(o.x - this.x, o.y - this.y) < (this.size + o.size) * CONFIG.bodyGap);
      if (pris) {
        this.state = 'fly'; this.timer = rand(.15, .35);
      } else if (this.timer <= 0) {
        this.lift = 0;
        this.v = 0;
        this.state = 'pause';
        this.timer = rand(.35, 1.4);
        this.plant();
      }
    } else if (braking && this.v <= this.body * .15) {
      this.v = 0;
      this.state = 'pause';
      this.timer = this.pauseTimer;
      this.plant();
    }

    // ── wing beat and leg cadence ────────────────────────────────
    if (this.lift > .01 && sprite.fly > 0) {
      this.wing = (this.wing + CONFIG.wingRate * sprite.fly * dt) % sprite.fly;
    }

    const stride = this.size * CONFIG.strideRatio;
    const raw = this.v / stride;
    const sat = CONFIG.saturation;
    const rate = raw / Math.pow(1 + Math.pow(raw / CONFIG.maxStepRate, sat), 1 / sat)
                 * (CONFIG.cadence / 100);
    this.phase = (this.phase + rate * sprite.walk * dt) % sprite.walk;
    this.wings(dt);
  }

  /* Wing angles, recomputed every frame. Every change is a snap. */
  wings(dt) {
    const inAir = this.state === 'takeoff' || this.state === 'fly'
                                           || this.state === 'land';
    if (inAir && this.lift > .12) this.airWings = true;
    else if (!inAir || this.lift < .06) this.airWings = false;
    const air = !!this.airWings;
    const tgt = [this.wSpread + this.wAsym, this.wSpread - this.wAsym];
    const k = [1, 1];

    if (air) {
      const o = CONFIG.wingFly + rand(-1, 1) * CONFIG.wingBeatAmp;
      tgt[0] = tgt[1] = o;
    } else if (this.state === 'freeze') {
      // The last instant before a jump: the wings come open.
      if (this.freezeAct === 'fly' && this.timer < .08) {
        tgt[0] += FREEZE.wingsUp; tgt[1] += FREEZE.wingsUp;
      }
    } else if (this.state === 'pause' || this.grooming) {
      const hind = (this.grooming || this.gHold > 0) && this.gset === 1;
      if (hind) {
        tgt[0] += CONFIG.wingLift; tgt[1] += CONFIG.wingLift;
        k[0] = k[1] = CONFIG.wingLiftScale;
      } else if (this.tShiver > 0) {
        const o = Math.abs(Math.sin(this.shPhase * Math.PI)) * CONFIG.wingShiver;
        tgt[0] += o; tgt[1] += o;
      } else {
        tgt[0] += this.askew[0]; tgt[1] += this.askew[1];
      }
    }

    if (this.follows && !air && this.partner && !this.partner.dead) {
      const d = Math.hypot(this.partner.x - this.x, this.partner.y - this.y);
      if (this.court <= 0 && d < this.size * 2.2 && Math.random() < dt * .8) {
        this.court = rand(.35, .9);
        this.courtSide = Math.random() < .5 ? 0 : 1;
      }
    }
    if (this.court > 0) {
      this.court -= dt;
      tgt[this.courtSide] = CONFIG.wingCourt + rand(-8, 8);
    }

    for (const i of [0, 1]) { this.wA[i] = tgt[i]; this.wK[i] = k[i]; }
  }

  /* A fly is three layers: the body and two wings that follow it. */
  create() {
    const el = document.createElement('div');
    el.className = (CONFIG.classPrefix || '') + 'fly';
    const b = document.createElement('i');
    const l = document.createElement('i');
    const r = document.createElement('i');
    l.className = r.className = (CONFIG.classPrefix || '') + 'fw';
    el.append(b, l, r);
    scene.appendChild(el);
    this.el = el; this.fb = b; this.wl = l; this.wr = r;
    const pc = (v) => (v / ATTACH.size * 100).toFixed(3) + '%';
    l.style.backgroundImage = r.style.backgroundImage = 'url(' + WINGS + ')';
    l.style.transformOrigin = pc(ATTACH.pivL[0]) + ' ' + pc(ATTACH.pivL[1]);
    r.style.transformOrigin = pc(ATTACH.pivR[0]) + ' ' + pc(ATTACH.pivR[1]);
    this.cache = { f: -1, s: -1, lift: -1 };
    return el;
  }

  remove() { if (this.el) { this.el.remove(); this.el = null; } }

  draw() {
    const el = this.el;
    if (!el || !sprite.ready) return;
    if (this.dead) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return;
    }
    if (el.style.display === 'none') el.style.display = '';

    // A new fly (or a respawned one) gets its own shade. Written once:
    // a filter that never changes costs nothing per frame.
    if (!this.toneSet) { this.fb.style.filter = this.tone; this.toneSet = true; }

    const s = Math.round(this.size);
    // Dabbing frames live on their own sheet; everything else on the main one.
    const onDab = this.dabbing && dab.ready;
    const f = onDab ? Math.floor(this.dphase) % dab.frames : this.curFrame();

    if (s !== this.cache.s) {
      el.style.width = s + 'px';
      el.style.height = s + 'px';
      this.cache.dab = null;       // sheet size must be rewritten too
      this.wl.style.backgroundSize = this.wr.style.backgroundSize
        = (2 * s) + 'px ' + s + 'px';
      this.wl.style.backgroundPosition = '0 0';
      this.wr.style.backgroundPosition = (-s) + 'px 0';
      el.style.marginLeft = (-s / 2) + 'px';
      el.style.marginTop = (-s / 2) + 'px';
      this.cache.s = s;
      this.cache.f = -1;
    }
    if (onDab !== this.cache.dab && (onDab || sprite.url)) {
      this.fb.style.backgroundImage = 'url(' + (onDab ? dab.url : sprite.url) + ')';
      this.fb.style.backgroundSize =
        (s * (onDab ? dab.frames : sprite.frames)) + 'px ' + s + 'px';
      this.cache.dab = onDab;
      this.cache.f = -1;
    }
    if (f !== this.cache.f) {
      this.fb.style.backgroundPosition = (-f * s) + 'px 0';
      this.cache.f = f;
    }

    // While dabbing the thorax holds its resting attitude.
    const A = ATTACH, sc = s / A.size;
    const r = onDab ? A.f[A.rest] : (A.f[f] || A.f[A.rest]);
    const dyaw = -(r[4] - A.restYaw);
    const dxL = (r[0] - A.pivL[0]) * sc, dyL = (r[1] - A.pivL[1]) * sc;
    const dxR = (r[2] - A.pivR[0]) * sc, dyR = (r[3] - A.pivR[1]) * sc;
    this.wl.style.transform = 'translate(' + dxL.toFixed(2) + 'px,' + dyL.toFixed(2)
      + 'px) rotate(' + (dyaw - this.wA[0]).toFixed(2) + 'deg) scaleY('
      + this.wK[0].toFixed(3) + ')';
    this.wr.style.transform = 'translate(' + dxR.toFixed(2) + 'px,' + dyR.toFixed(2)
      + 'px) rotate(' + (dyaw + this.wA[1]).toFixed(2) + 'deg) scaleY('
      + this.wK[1].toFixed(3) + ')';

    const L = this.lift;
    if (Math.abs(L - this.cache.lift) > .01) {
      el.style.filter = L > .01 ? 'blur(' + (L * CONFIG.flyBlur).toFixed(2) + 'px)' : '';
      this.cache.lift = L;
    }

    if (CONFIG.showTraits) {
      if (el.dataset.trait !== this.trait) el.dataset.trait = this.trait;
    } else if (el.dataset.trait !== undefined) {
      delete el.dataset.trait;
    }

    if (CONFIG.debug) {
      const st = this.grooming ? 'groom' : this.state;
      if (el.dataset.state !== st) el.dataset.state = st;
    } else if (el.dataset.state !== undefined) {
      delete el.dataset.state;
    }

    const smear = L < .01 ? 0
      : Math.min(CONFIG.smearMax,
                 (this.v / 60) / this.size * CONFIG.smearGain);
    const k = 1 + CONFIG.flyRise * L;
    const ky = k * (1 + smear);
    el.style.transform = 'translate(' + this.x.toFixed(1) + 'px,'
      + this.y.toFixed(1) + 'px) rotate('
      + (this.a + rad(CONFIG.spriteFacing)).toFixed(3) + 'rad)'
      + (L > .01 ? ' scale(' + k.toFixed(3) + ',' + ky.toFixed(3) + ')' : '');
  }
}

/* ===================================================================
   SCENE
   =================================================================== */

function resize() { view.w = innerWidth; view.h = innerHeight; }

function applySheet() {
  if (!sprite.ready) return;
  for (const f of flies) {
    if (!f.el) continue;
    f.fb.style.backgroundImage = 'url(' + sprite.url + ')';
    f.cache.s = -1;
  }
}

function sync() {
  while (flies.length < CONFIG.count) {
    const f = new Fly();
    f.create();
    if (sprite.ready)
      f.fb.style.backgroundImage = 'url(' + sprite.url + ')';
    flies.push(f);
  }
  while (flies.length > CONFIG.count) flies.pop().remove();
}

// Settings panel: only on the studio page. On a host site (CONFIG.panel
// false) an element that happens to be called #count or #size must not
// drive the flies.
const $id = id => CONFIG.panel === false ? null : document.getElementById(id);

const stat = $id('stat');
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min((t - last) / 1000, .05);
  last = t;
  if (!running) return;
  for (const f of flies) { f.update(dt); f.draw(); }
  if (stat) {
    const live = flies.filter(f => !f.dead).length;
    const air = flies.filter(f => f.lift > .05).length;
    stat.textContent = live + ' / ' + flies.length
      + (air ? ' · ' + air + ' in the air' : ' in frame');
  }
}

/* ===================================================================
   PANEL
   Every control is optional: a missing element is simply skipped.
   =================================================================== */

const bind = (id, key, fmt, onChange) => {
  const el = $id(id), out = $id('o-' + id);
  if (!el) return;
  el.value = CONFIG[key];
  const show = () => { if (out) out.textContent = fmt(+el.value); };
  el.addEventListener('input', () => { CONFIG[key] = +el.value; show(); onChange && onChange(); });
  show();
};

const bindPct = (id, key) => {
  const el = $id(id), out = $id('o-' + id);
  if (!el) return;
  el.value = Math.round(CONFIG[key] * 100);
  const show = () => { if (out) out.textContent = el.value + ' %'; };
  el.addEventListener('input', () => { CONFIG[key] = +el.value / 100; show(); });
  show();
};

/* Fly count. The slider may be replaced by a Swup transition: we listen
   on the document, and a new slider picks up the current value. */
let curseurCount = null;
function syncCount() {
  const el = $id('count'), out = $id('o-count');
  curseurCount = el;
  if (el) el.value = CONFIG.count;
  if (out) out.textContent = CONFIG.count;
}
document.addEventListener('input', e => {
  if (CONFIG.panel === false || e.target.id !== 'count') return;
  CONFIG.count = +e.target.value;
  const out = $id('o-count');
  if (out) out.textContent = CONFIG.count;
  sync();
});
if (CONFIG.panel !== false) new MutationObserver(() => {
  if ($id('count') !== curseurCount) syncCount();
}).observe(document.body, { childList: true, subtree: true });
syncCount();

bind('size',  'size',      v => v + ' px');
bind('vary',  'sizeVary',  v => v + ' %');
bind('speed', 'speedBody', v => v.toFixed(1) + ' body/s');
bind('bias',  'sizeSpeedBias', v =>
  v > -.05 && v < .05 ? 'same body/s'
  : v <= -.95 && v >= -1.05 ? 'same px/s'
  : v.toFixed(1));
bind('cad',   'cadence',   v => v + ' %');
bind('run',   'runBody',   v => v.toFixed(1) + ' bodies');
bind('acc',   'accelBody', v => v + ' body/s²');
bind('pfreq', 'pauseFreq', v => v + ' %');
bind('pdur',  'pauseDur',  v => (v / 100).toFixed(1) + ' s');
bind('pvar',  'pauseVary', v => v ? '±' + v + ' %' : 'none');
bind('turn',  'turnAmp',   v => v + ' °/s');
bind('wob',   'wobble',    v => v + ' °/s');
bind('space', 'spacing',   v => v ? v + ' px' : 'off');
bind('flee',  'fleeRadius', v => v ? v + ' px' : 'off');
bindPct('micro', 'microChance');
bindPct('fly', 'flyChance');
bind('fspeed', 'flySpeed', v => v + ' body/s');
bindPct('groom', 'groomChance');
bindPct('curve', 'curveChance');

const debugBox = $id('debug');
if (debugBox) {
  debugBox.checked = CONFIG.debug;
  debugBox.addEventListener('change', () => CONFIG.debug = debugBox.checked);
}
const traitsBox = $id('traits');
if (traitsBox) {
  traitsBox.checked = CONFIG.showTraits;
  traitsBox.addEventListener('change', () => CONFIG.showTraits = traitsBox.checked);
}

const playBtn = $id('play');
const resetBtn = $id('reset');
if (playBtn) playBtn.addEventListener('click', () => {
  running = !running;
  playBtn.textContent = running ? 'Pause' : 'Play';
});
if (resetBtn) resetBtn.addEventListener('click', () => {
  flies.forEach(f => f.remove()); flies = []; sync();
});

/* ===================================================================
   START
   =================================================================== */

resize();
sync();
addEventListener('resize', resize);

const srcLabel = $id('src');
function adopt(img, label) {
  useSheet(img);
  if (srcLabel) srcLabel.textContent = 'Sprite sheet: ' + label + ' · '
    + sprite.walk + ' walk + ' + sprite.sets + '×' + sprite.groom + ' groom + '
    + sprite.rest + ' rest + ' + sprite.shiver + ' shiver + ' + sprite.fly + ' flight';
  flies.forEach(f => {
    f.phase = Math.random() * sprite.walk;
    f.frozen = null;
    f.grooming = false;
  });
  applySheet();
}

// Embedded sheet: available at once, wherever this file sits.
const built = new Image();
built.onload = () => adopt(built, 'embedded, 192 px');
built.src = CONFIG.embedded;

// If fly_sheet.png sits next to this file, it takes over at full size.
if (CONFIG.sheetURL) {
  const auto = new Image();
  auto.onload = () => adopt(auto, CONFIG.sheetURL);
  auto.src = CONFIG.sheetURL;
}

if (CONFIG.respectReducedMotion
    && matchMedia('(prefers-reduced-motion: reduce)').matches) {
  running = false;
  if (playBtn) playBtn.textContent = 'Play';
}
requestAnimationFrame(t => { last = t; frame(t); });
/* ===================================================================
   A FLY LIKE THEE: one fly per robot
   Olivier Jonvaux, Web Residencies 22, Akademie Schloss Solitude

   Loaded after the fly script. Every few seconds it asks the site which
   robots are around this page, and keeps exactly one fly for each: a
   robot arrives, a fly walks in; it has been gone long enough, its fly
   walks off and does not come back.

   The only request it makes goes to the site itself.
   =================================================================== */

(function () {
  const cfg = window.FLY_LIKE_THEE;
  if (!cfg || typeof Fly === 'undefined' || typeof flies === 'undefined') return;

  // No fly until a robot is seen. This runs before the first frame is
  // painted, so the flies created by the fly script are never visible.
  flies.forEach(f => f.remove());
  flies = [];
  CONFIG.count = 0;
  if (CONFIG.showBots === undefined) CONFIG.showBots = false;

  // A fly whose robot has left walks off and stays gone.
  const spawn = Fly.prototype.spawn;
  Fly.prototype.spawn = function () {
    if (this.retired) { this.dead = true; this.gone = true; this.timer = 1e9; return; }
    spawn.call(this);
  };

  // With "Show robots", the label above the fly gives the robot's name
  // in place of its character.
  const draw = Fly.prototype.draw;
  Fly.prototype.draw = function () {
    if (!(CONFIG.showBots && this.bot)) return draw.call(this);
    const trait = this.trait, shown = CONFIG.showTraits;
    this.trait = this.bot.name + (this.bot.verified === 'spoofed' ? ' (false)' : '');
    CONFIG.showTraits = true;
    draw.call(this);
    this.trait = trait;
    CONFIG.showTraits = shown;
  };

  const byId = new Map();          // robot id -> its fly

  async function poll() {
    let data;
    try {
      // The address may already carry a query (WordPress without pretty
      // permalinks: index.php?rest_route=...).
      const url = cfg.endpoint + (cfg.endpoint.includes('?') ? '&' : '?')
                + 'path=' + encodeURIComponent(cfg.path || '');
      const r = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (!r.ok) return;
      data = await r.json();
    } catch (e) {
      return;                      // the site is unreachable: nothing changes
    }
    if (data.interval) cfg.interval = data.interval;

    const present = new Set();
    for (const bot of (data.active ? data.flies : [])) {
      present.add(bot.id);
      let f = byId.get(bot.id);
      if (f && !f.gone) {
        f.bot = bot;
        if (f.retired) {           // it came back before its fly had left
          f.retired = false;
          f.runsLeft = Math.max(f.runsLeft, 4);
        }
        continue;
      }
      CONFIG.count = flies.length + 1;
      sync();
      f = flies[flies.length - 1];
      f.bot = bot;
      byId.set(bot.id, f);
    }

    for (const [id, f] of byId) {
      if (!present.has(id) && !f.retired) {
        f.retired = true;
        f.runsLeft = 0;            // it finishes what it is doing, then leaves
      }
    }
  }

  // Remove the flies that have walked off for good.
  setInterval(() => {
    let changed = false;
    for (const f of flies) {
      if (f.retired && f.dead) { f.remove(); f.gone = true; changed = true; }
    }
    if (!changed) return;
    flies = flies.filter(f => !f.gone);
    for (const [id, f] of byId) if (f.gone) byId.delete(id);
    CONFIG.count = flies.length;
  }, 500);

  // Ask now, then at the set interval, only while the page is in view.
  (function loop() {
    if (!document.hidden) poll();
    setTimeout(loop, Math.max(5, cfg.interval || 20) * 1000);
  })();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });

  // Optional checkbox in the panel: <input type="checkbox" id="bots">
  const box = document.getElementById('bots');
  if (box) {
    box.checked = CONFIG.showBots;
    box.addEventListener('change', () => { CONFIG.showBots = box.checked; });
  }
})();

// For the console: FlyLikeThee.flies, FlyLikeThee.pause(), FlyLikeThee.play()
window.FlyLikeThee = {
  CONFIG,
  get flies() { return flies; },
  pause() { running = false; },
  play() { running = true; },
};
})();
