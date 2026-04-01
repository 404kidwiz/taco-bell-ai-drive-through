// Sound Manager — Web Audio API tone generator
// No external audio files needed. All sounds synthesized via oscillators.

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;
let volume = 0.5;
let reducedMotion = false;

if (typeof window !== "undefined") {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getCtx(): { ctx: AudioContext; gain: GainNode } {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return { ctx: audioCtx, gain: masterGain! };
}

function osc(
  ctx: AudioContext,
  dest: AudioNode,
  freq: number,
  type: OscillatorType,
  start: number,
  end: number,
  vol = 0.3,
) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.005);
  g.gain.linearRampToValueAtTime(0, end);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(end);
}

// ── Taco Bell sounds ──────────────────────────────────────────────────────────

function driveThroughDing() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  // Crackle noise burst
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.2, t);
  ng.gain.linearRampToValueAtTime(0, t + 0.08);
  noise.connect(ng).connect(gain);
  noise.start(t);
  noise.stop(t + 0.08);
  // Ding
  osc(ctx, gain, 1200, "sine", t + 0.06, t + 0.4, 0.25);
  osc(ctx, gain, 2400, "sine", t + 0.06, t + 0.2, 0.1);
}

function orderConfirmed() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 523, "sine", t, t + 0.15, 0.25);
  osc(ctx, gain, 659, "sine", t + 0.12, t + 0.27, 0.25);
  osc(ctx, gain, 784, "sine", t + 0.24, t + 0.5, 0.3);
}

function cartAdd() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 800, "square", t, t + 0.04, 0.12);
  osc(ctx, gain, 1200, "sine", t + 0.02, t + 0.06, 0.08);
}

function pullForward() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 440, "sine", t, t + 0.2, 0.2);
  osc(ctx, gain, 554, "sine", t + 0.15, t + 0.35, 0.2);
  osc(ctx, gain, 659, "sine", t + 0.3, t + 0.55, 0.25);
}

function aiTyping() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 600 + Math.random() * 200, "sine", t, t + 0.03, 0.06);
}

// ── Pizza sounds ───────────────────────────────────────────────────────────────

function phoneRing() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  const ring = (start: number) => {
    osc(ctx, gain, 440, "sine", start, start + 0.15, 0.2);
    osc(ctx, gain, 480, "sine", start, start + 0.15, 0.2);
    osc(ctx, gain, 440, "sine", start + 0.2, start + 0.35, 0.2);
    osc(ctx, gain, 480, "sine", start + 0.2, start + 0.35, 0.2);
  };
  ring(t);
  ring(t + 0.5);
}

function connected() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 480, "sine", t, t + 0.12, 0.2);
  osc(ctx, gain, 620, "sine", t + 0.1, t + 0.22, 0.2);
}

function orderPlaced() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 440, "sine", t, t + 0.2, 0.2);
  osc(ctx, gain, 554, "sine", t + 0.15, t + 0.35, 0.2);
  osc(ctx, gain, 659, "sine", t + 0.3, t + 0.5, 0.25);
  osc(ctx, gain, 880, "sine", t + 0.45, t + 0.7, 0.15);
}

function kitchenBell() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 2000, "sine", t, t + 0.5, 0.3);
  osc(ctx, gain, 4000, "sine", t, t + 0.15, 0.1);
  osc(ctx, gain, 3000, "sine", t + 0.02, t + 0.3, 0.08);
}

// ── Shared sounds ──────────────────────────────────────────────────────────────

function messageReceived() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 700, "sine", t, t + 0.08, 0.15);
  osc(ctx, gain, 900, "sine", t + 0.06, t + 0.14, 0.12);
}

function messageSent() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 900, "sine", t, t + 0.06, 0.1);
  osc(ctx, gain, 700, "sine", t + 0.05, t + 0.11, 0.08);
}

function stageTransition() {
  const { ctx, gain } = getCtx();
  const t = ctx.currentTime;
  osc(ctx, gain, 523, "sine", t, t + 0.12, 0.2);
  osc(ctx, gain, 659, "sine", t + 0.08, t + 0.2, 0.2);
  osc(ctx, gain, 784, "sine", t + 0.16, t + 0.35, 0.25);
}

// ── Sound map ──────────────────────────────────────────────────────────────────

const soundMap: Record<string, () => void> = {
  "drive-through-ding": driveThroughDing,
  "order-confirmed": orderConfirmed,
  "cart-add": cartAdd,
  "pull-forward": pullForward,
  "ai-typing": aiTyping,
  "phone-ring": phoneRing,
  connected,
  "order-placed": orderPlaced,
  "kitchen-bell": kitchenBell,
  "message-received": messageReceived,
  "message-sent": messageSent,
  "stage-transition": stageTransition,
};

export type SoundName = keyof typeof soundMap;

export function playSound(name: SoundName) {
  if (isMuted || reducedMotion) return;
  const fn = soundMap[name];
  if (fn) fn();
}

export function setSoundMuted(m: boolean) {
  isMuted = m;
}

export function setSoundVolume(v: number) {
  volume = v;
  if (masterGain) masterGain.gain.value = v;
}

export function isSoundMuted() {
  return isMuted;
}

export function MuteToggle() {
  // This is a React component — import from sounds.tsx instead
  return null;
}
