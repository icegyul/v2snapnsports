export type StadiumAudioState = "LOCKED" | "ENABLED" | "MUTED" | "UNSUPPORTED";
export type StadiumAudioCue = "HOME" | "APPROACH" | "PITCH" | "PROJECTION" | "POSITION" | "FORMATION" | "SPATIAL_HOME";

export interface StadiumAudioSnapshot {
  readonly state: StadiumAudioState;
  readonly contextState: "NONE" | AudioContextState;
  readonly lastCue: StadiumAudioCue | null;
  readonly cueCount: number;
}

type Listener = () => void;

const listeners = new Set<Listener>();
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambienceGain: GainNode | null = null;
let ambienceSource: AudioBufferSourceNode | null = null;
let state: StadiumAudioState = "LOCKED";
let lastCue: StadiumAudioCue | null = null;
let cueCount = 0;
let snapshot: StadiumAudioSnapshot = {
  state,
  contextState: "NONE",
  lastCue,
  cueCount,
};

function publish(): void {
  snapshot = {
    state,
    contextState: audioContext?.state ?? "NONE",
    lastCue,
    cueCount,
  };
  listeners.forEach((listener) => listener());
}

function audioContextConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? null;
}

function makeAmbienceBuffer(context: AudioContext): AudioBuffer {
  const durationSeconds = 1.6;
  const frameCount = Math.floor(context.sampleRate * durationSeconds);
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 0x41c64e6d;
  for (let i = 0; i < frameCount; i += 1) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = (seed / 0xffffffff) * 2 - 1;
    const slowPulse = 0.62 + Math.sin((i / context.sampleRate) * Math.PI * 2 * 0.7) * 0.12;
    data[i] = noise * slowPulse * 0.16;
  }
  return buffer;
}

function ensureAudioGraph(context: AudioContext): void {
  if (masterGain && ambienceGain && ambienceSource) return;

  masterGain = context.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(context.destination);

  ambienceGain = context.createGain();
  ambienceGain.gain.value = 0.035;

  const filter = context.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 680;
  filter.Q.value = 0.55;

  ambienceSource = context.createBufferSource();
  ambienceSource.buffer = makeAmbienceBuffer(context);
  ambienceSource.loop = true;
  ambienceSource.connect(filter);
  filter.connect(ambienceGain);
  ambienceGain.connect(masterGain);
  ambienceSource.start();
}

function cueProfile(cue: StadiumAudioCue): readonly [number, number, number] {
  switch (cue) {
    case "HOME": return [180, 260, 0.42];
    case "APPROACH": return [120, 220, 0.52];
    case "PITCH": return [160, 310, 0.48];
    case "PROJECTION": return [420, 760, 0.58];
    case "POSITION": return [330, 520, 0.40];
    case "FORMATION": return [280, 610, 0.48];
    case "SPATIAL_HOME": return [210, 440, 0.55];
  }
}

export function subscribeStadiumAudio(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStadiumAudioSnapshot(): StadiumAudioSnapshot {
  return snapshot;
}

export async function enableStadiumAudio(): Promise<StadiumAudioSnapshot> {
  const Constructor = audioContextConstructor();
  if (!Constructor) {
    state = "UNSUPPORTED";
    publish();
    return snapshot;
  }

  try {
    if (!audioContext) audioContext = new Constructor();
    ensureAudioGraph(audioContext);
    if (audioContext.state === "suspended") await audioContext.resume();
    if (masterGain) masterGain.gain.setTargetAtTime(1, audioContext.currentTime, 0.025);
    state = "ENABLED";
    publish();
    return snapshot;
  } catch {
    state = "UNSUPPORTED";
    publish();
    return snapshot;
  }
}

export function setStadiumAudioMuted(muted: boolean): StadiumAudioSnapshot {
  if (!audioContext || !masterGain || state === "LOCKED" || state === "UNSUPPORTED") return snapshot;
  const target = muted ? 0 : 1;
  masterGain.gain.setTargetAtTime(target, audioContext.currentTime, 0.025);
  state = muted ? "MUTED" : "ENABLED";
  publish();
  return snapshot;
}

export function playStadiumAudioCue(cue: StadiumAudioCue): void {
  if (!audioContext || !masterGain || state !== "ENABLED" || audioContext.state !== "running") return;
  const [fromFrequency, toFrequency, duration] = cueProfile(cue);
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const cueGain = audioContext.createGain();
  oscillator.type = cue === "PROJECTION" ? "sine" : "triangle";
  oscillator.frequency.setValueAtTime(fromFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(toFrequency, now + duration);
  cueGain.gain.setValueAtTime(0.0001, now);
  cueGain.gain.exponentialRampToValueAtTime(0.055, now + 0.045);
  cueGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(cueGain);
  cueGain.connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
  lastCue = cue;
  cueCount += 1;
  publish();
}
