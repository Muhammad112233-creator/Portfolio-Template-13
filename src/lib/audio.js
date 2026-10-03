let context;
let ambienceGain;
let windSource;
let highpass;
let ambienceEnabled = false;

function audioContext() {
  if (!context && typeof window !== 'undefined') {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (Context) context = new Context();
  }
  return context;
}

function startWind(ctx) {
  if (windSource) return;
  const seconds = 5;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  let slow = 0;
  for (let i = 0; i < channel.length; i += 1) {
    const white = Math.random() * 2 - 1;
    slow = slow * 0.985 + white * 0.015;
    channel[i] = slow * 3.1;
  }

  windSource = ctx.createBufferSource();
  windSource.buffer = buffer;
  windSource.loop = true;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 760;
  lowpass.Q.value = 0.35;
  highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 105;
  ambienceGain = ctx.createGain();
  ambienceGain.gain.value = 0;
  windSource.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(ambienceGain);
  ambienceGain.connect(ctx.destination);
  windSource.start();
}

export async function setAmbience(enabled) {
  const ctx = audioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') await ctx.resume();
  if (enabled) {
    startWind(ctx);
    ambienceEnabled = true;
    ambienceGain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.7);
  } else {
    ambienceEnabled = false;
    if (ambienceGain) ambienceGain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
  }
  return true;
}

export function playTap() {
  if (!ambienceEnabled || !context || context.state !== 'running' || !ambienceGain) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(520, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(310, context.currentTime + 0.055);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, context.currentTime + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.12);
}
