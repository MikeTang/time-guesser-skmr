/**
 * useSounds — browser-native sound effects via Web Audio API.
 * No external files, no API keys.
 */
"use client";

import { useCallback, useRef } from "react";

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // Safari requires webkit prefix on older versions
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  return new Ctx();
}

/**
 * "Thunk/pop" — a short percussive hit for the STOP button.
 * Rationale: a fast pitch-drop on a sine+noise blend feels like a
 * satisfying button thump without being jarring for kids.
 */
function playStopSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // --- low thud tone (sine, fast pitch drop) ---
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);
  oscGain.gain.setValueAtTime(0.7, now);
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);

  // --- click transient (short noise burst) ---
  const bufLen = ctx.sampleRate * 0.04;
  const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
  }
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuf;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  noiseSource.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start(now);
  noiseSource.stop(now + 0.04);
}

/**
 * Celebratory fanfare — plays for under-10s results.
 * Rationale: a quick ascending arpeggio + sparkle shimmer gives
 * a "you did it!" feeling without being overwhelming.
 */
function playCelebrationSound(ctx: AudioContext) {
  const now = ctx.currentTime;

  // Ascending major arpeggio: C5-E5-G5-C6
  const freqs = [523.25, 659.25, 783.99, 1046.5];
  const spacing = 0.12; // seconds between each note

  freqs.forEach((freq, i) => {
    const t = now + i * spacing;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);

    // Add a gentle harmonic overtone for sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, t);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.18);
  });

  // Shimmer: high-frequency noise burst at the end
  const shStart = now + freqs.length * spacing;
  const bufLen = Math.floor(ctx.sampleRate * 0.15);
  const shimmerBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const shimData = shimmerBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    shimData[i] = (Math.random() * 2 - 1) * (1 - i / bufLen) * 0.3;
  }
  const shimFilter = ctx.createBiquadFilter();
  shimFilter.type = "highpass";
  shimFilter.frequency.value = 4000;
  const shimSource = ctx.createBufferSource();
  shimSource.buffer = shimmerBuf;
  const shimGain = ctx.createGain();
  shimGain.gain.setValueAtTime(0.25, shStart);
  shimGain.gain.exponentialRampToValueAtTime(0.001, shStart + 0.15);
  shimSource.connect(shimFilter);
  shimFilter.connect(shimGain);
  shimGain.connect(ctx.destination);
  shimSource.start(shStart);
  shimSource.stop(shStart + 0.15);
}

/**
 * Hook: returns stable `playStop` and `playCelebration` callbacks.
 *
 * AudioContext is created lazily on first use and reused thereafter
 * (one context per hook instance, lives as long as the component).
 * We create a fresh context each time because Safari and some mobile
 * browsers suspend contexts that aren't started from a user gesture
 * — creating on demand inside the gesture handler is the safest approach.
 */
export function useSounds() {
  // We keep a ref so the context survives re-renders without recreating.
  const ctxRef = useRef<AudioContext | null>(null);

  function ensureCtx(): AudioContext | null {
    if (ctxRef.current && ctxRef.current.state !== "closed") {
      // Resume if suspended (autoplay policy)
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {});
      }
      return ctxRef.current;
    }
    const ctx = getCtx();
    ctxRef.current = ctx;
    return ctx;
  }

  const playStop = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    try {
      playStopSound(ctx);
    } catch {
      // Silently swallow — audio is enhancement, not core feature
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playCelebration = useCallback(() => {
    const ctx = ensureCtx();
    if (!ctx) return;
    try {
      playCelebrationSound(ctx);
    } catch {
      // Silently swallow
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { playStop, playCelebration };
}
