"use client";

import { useEffect, useRef, useState } from "react";

/* ─── sessionStorage keys ────────────────────────────────── */
const SS_START = "tg_startTime";
const SS_TARGET = "tg_targetMinutes";

/* ─── Types ─────────────────────────────────────────────── */
type Screen = "pick" | "waiting" | "result";

interface TimeOption {
  minutes: number;
  emoji: string;
  label: string;
  gradient: string;
  shadow: string;
  numberColor: string;
  /** Full-screen wash for the waiting screen */
  waitBg: string;
  /** Drifting cloud tints */
  cloudColors: string[];
}

const TIME_OPTIONS: TimeOption[] = [
  {
    minutes: 1,
    emoji: "🌟",
    label: "Warm-up!",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    shadow: "0 8px 32px rgba(251,191,36,0.45)",
    numberColor: "#78350f",
    waitBg: "linear-gradient(160deg, #2d1a00 0%, #4a2c00 50%, #1a0d00 100%)",
    cloudColors: ["#f59e0b", "#fbbf24", "#fde68a", "#f97316"],
  },
  {
    minutes: 2,
    emoji: "🚀",
    label: "Getting good!",
    gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
    shadow: "0 8px 32px rgba(251,146,60,0.45)",
    numberColor: "#7c2d12",
    waitBg: "linear-gradient(160deg, #2d0a0a 0%, #4a1500 50%, #1a0000 100%)",
    cloudColors: ["#ea580c", "#fb923c", "#fca5a5", "#dc2626"],
  },
  {
    minutes: 5,
    emoji: "🪐",
    label: "Space explorer!",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    shadow: "0 8px 32px rgba(56,189,248,0.45)",
    numberColor: "#0c4a6e",
    waitBg: "linear-gradient(160deg, #00101a 0%, #002a40 50%, #000d1a 100%)",
    cloudColors: ["#0ea5e9", "#38bdf8", "#7dd3fc", "#6366f1"],
  },
];

/* ─── Stars canvas ───────────────────────────────────────── */
function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < 120; i++) {
      const s = document.createElement("div");
      s.className = "star";
      const size = Math.random() * 2.5 + 0.5;
      s.style.cssText = `
        width:${size}px; height:${size}px;
        top:${Math.random() * 100}%;
        left:${Math.random() * 100}%;
        --dur:${(Math.random() * 3 + 1.5).toFixed(1)}s;
        --max-op:${(Math.random() * 0.7 + 0.3).toFixed(2)};
        animation-delay:${(Math.random() * 4).toFixed(1)}s;
      `;
      container.appendChild(s);
      stars.push(s);
    }
    return () => stars.forEach((s) => s.remove());
  }, []);

  return <div className="stars" ref={containerRef} />;
}

/* ─── Time card ──────────────────────────────────────────── */
function TimeCard({
  option,
  onSelect,
}: {
  option: TimeOption;
  onSelect: (minutes: number) => void;
}) {
  const [bouncing, setBouncing] = useState(false);

  function handleClick() {
    if (bouncing) return;
    setBouncing(true);
    setTimeout(() => onSelect(option.minutes), 420);
  }

  return (
    <button
      onClick={handleClick}
      onAnimationEnd={() => setBouncing(false)}
      className={`time-card w-full rounded-3xl px-6 py-8 text-center shadow-2xl focus:outline-none${
        bouncing ? " card-bounce" : ""
      }`}
      style={{
        background: option.gradient,
        boxShadow: option.shadow,
        fontFamily: "'Nunito', sans-serif",
      }}
      aria-label={`${option.minutes} ${option.minutes === 1 ? "minute" : "minutes"}`}
    >
      {/* Big number */}
      <div
        className="text-8xl font-black leading-none"
        style={{ color: option.numberColor }}
      >
        {option.minutes}
      </div>

      {/* Word */}
      <div
        className="mt-1 text-2xl font-black uppercase tracking-widest"
        style={{ color: option.numberColor, opacity: 0.75 }}
      >
        {option.minutes === 1 ? "minute" : "minutes"}
      </div>

      {/* Emoji hint + flavour label */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="text-3xl">{option.emoji}</span>
        <span
          className="text-base font-bold"
          style={{ color: option.numberColor, opacity: 0.65 }}
        >
          {option.label}
        </span>
      </div>
    </button>
  );
}

/* ─── Cloud specs (stable across renders) ────────────────── */
interface CloudSpec {
  color: string;
  width: number;
  height: number;
  top: string;
  left: string;
  dur: string;
  op: string;
  dx: string;
  dy: string;
  delay: string;
}

function makeCloudSpecs(colors: string[]): CloudSpec[] {
  // 8 clouds, seeded deterministically so SSR and client match
  const specs: CloudSpec[] = [];
  const positions = [
    { top: "5%",  left: "10%" },
    { top: "20%", left: "55%" },
    { top: "38%", left: "5%"  },
    { top: "55%", left: "65%" },
    { top: "70%", left: "20%" },
    { top: "80%", left: "50%" },
    { top: "15%", left: "80%" },
    { top: "60%", left: "40%" },
  ];
  const durs   = [8, 11, 9, 13, 10, 7, 12, 9];
  const dxs    = [30, -25, 40, -35, 20, -30, 25, -20];
  const dys    = [20, -15, 25, -20, 30, -10, -25, 15];
  const ops    = [0.18, 0.14, 0.22, 0.16, 0.20, 0.12, 0.18, 0.15];
  const delays = [0, 1.5, 0.8, 2.2, 0.4, 1.9, 0.6, 2.8];
  const sizes  = [260, 200, 320, 180, 240, 300, 220, 190];

  for (let i = 0; i < 8; i++) {
    specs.push({
      color: colors[i % colors.length],
      width: sizes[i],
      height: Math.round(sizes[i] * 0.65),
      top: positions[i].top,
      left: positions[i].left,
      dur: `${durs[i]}s`,
      op: String(ops[i]),
      dx: `${dxs[i]}px`,
      dy: `${dys[i]}px`,
      delay: `${delays[i]}s`,
    });
  }
  return specs;
}

/* ─── Waiting screen ─────────────────────────────────────── */
function WaitingScreen({
  option,
  onStop,
}: {
  option: TimeOption;
  onStop: (secondsOff: number) => void;
}) {
  const clouds = useRef<CloudSpec[]>(makeCloudSpecs(option.cloudColors));

  // Record start time in sessionStorage on mount.
  // If we somehow already have a start (e.g. hot reload), respect it so
  // the timer isn't reset. Edge case: stale key from a prior session —
  // guard by checking that the stored target matches.
  useEffect(() => {
    const storedTarget = sessionStorage.getItem(SS_TARGET);
    if (storedTarget !== String(option.minutes)) {
      // Fresh game — write a new start time
      sessionStorage.setItem(SS_START, String(Date.now()));
      sessionStorage.setItem(SS_TARGET, String(option.minutes));
    } else if (!sessionStorage.getItem(SS_START)) {
      sessionStorage.setItem(SS_START, String(Date.now()));
    }
  }, [option.minutes]);

  function handleStop() {
    const raw = sessionStorage.getItem(SS_START);
    const startTime = raw ? parseInt(raw, 10) : Date.now();
    const elapsedMs = Date.now() - startTime;
    const targetMs = option.minutes * 60 * 1000;
    const secondsOff = Math.round(Math.abs(elapsedMs - targetMs) / 1000);

    // Clean up so a future game starts fresh
    sessionStorage.removeItem(SS_START);
    sessionStorage.removeItem(SS_TARGET);

    onStop(secondsOff);
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between py-16 overflow-hidden relative"
      style={{ background: option.waitBg, fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Drifting cloud blobs */}
      {clouds.current.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            backgroundColor: c.color,
            width: c.width,
            height: c.height,
            top: c.top,
            left: c.left,
            "--cloud-dur": c.dur,
            "--cloud-op": c.op,
            "--dx": c.dx,
            "--dy": c.dy,
            animationDelay: c.delay,
          } as React.CSSProperties}
        />
      ))}

      {/* Top: prompt */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-6">
        <div className="text-6xl">{option.emoji}</div>
        <h2
          className="text-4xl font-black text-white drop-shadow-lg"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
        >
          {option.minutes} {option.minutes === 1 ? "Minute" : "Minutes"}
        </h2>
        <p
          className="text-xl font-bold mt-1"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          No peeking at the clock! 🌟
        </p>
        <p
          className="text-base font-bold"
          style={{ color: "rgba(255,255,255,0.50)" }}
        >
          Hit STOP when you think time&apos;s up.
        </p>
      </div>

      {/* Bottom: STOP button */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 w-full max-w-xs">
        <button
          onClick={handleStop}
          className="stop-btn w-full rounded-full py-6 text-3xl font-black text-white focus:outline-none shadow-2xl"
          style={{
            background: option.gradient,
            boxShadow: option.shadow,
            letterSpacing: "0.08em",
          }}
          aria-label="Stop the timer"
        >
          ⏹ STOP
        </button>
        <p
          className="text-sm font-bold"
          style={{ color: "rgba(255,255,255,0.40)" }}
        >
          Trust your instincts! 🧠
        </p>
      </div>
    </div>
  );
}

/* ─── Result screen (stub for wiring) ───────────────────── */
function ResultScreen({
  minutes,
  secondsOff,
  onPlayAgain,
}: {
  minutes: number;
  secondsOff: number;
  onPlayAgain: () => void;
}) {
  const { emoji, message, sub } = getResultFeedback(secondsOff);

  return (
    <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center w-full max-w-sm">
      <div className="text-6xl mb-1">🏁</div>
      <h2 className="text-4xl font-black text-white drop-shadow-lg">
        {minutes} {minutes === 1 ? "Minute" : "Minutes"}
      </h2>

      <div
        className="rounded-3xl p-6 text-center shadow-2xl w-full"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="text-5xl mb-3">{emoji}</div>
        <p className="text-white text-2xl font-black">{message}</p>
        <p className="text-purple-200 text-base font-bold mt-1">
          You were{" "}
          <span className="text-yellow-300 text-xl">{secondsOff} second{secondsOff !== 1 ? "s" : ""}</span>{" "}
          off!
        </p>
        <p className="text-purple-300 text-sm mt-3">{sub}</p>
        <button
          onClick={onPlayAgain}
          className="mt-5 stop-btn rounded-2xl px-8 py-3 text-lg font-black text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg,#a855f7,#6366f1)",
          }}
        >
          Play Again 🚀
        </button>
      </div>
    </div>
  );
}

function getResultFeedback(secondsOff: number): {
  emoji: string;
  message: string;
  sub: string;
} {
  if (secondsOff <= 3)
    return {
      emoji: "🌟",
      message: "Perfect!",
      sub: "You're basically a human clock! ⏰",
    };
  if (secondsOff <= 10)
    return {
      emoji: "🚀",
      message: "So close!",
      sub: "Amazing time sense — keep it up! 🎉",
    };
  if (secondsOff <= 30)
    return {
      emoji: "😊",
      message: "Pretty good!",
      sub: "A little more practice and you'll nail it! 💪",
    };
  if (secondsOff <= 60)
    return {
      emoji: "🌈",
      message: "Getting there!",
      sub: "Time is tricky — give it another go! ✨",
    };
  return {
    emoji: "🪐",
    message: "Keep trying!",
    sub: "Even astronauts need practice! 🛸",
  };
}

/* ─── Root page ──────────────────────────────────────────── */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("pick");
  const [chosenMinutes, setChosenMinutes] = useState<number | null>(null);
  const [secondsOff, setSecondsOff] = useState<number | null>(null);

  const chosenOption =
    chosenMinutes !== null
      ? TIME_OPTIONS.find((o) => o.minutes === chosenMinutes) ?? null
      : null;

  function handleSelect(minutes: number) {
    setChosenMinutes(minutes);
    setScreen("waiting");
  }

  function handleStop(off: number) {
    setSecondsOff(off);
    setScreen("result");
  }

  function handlePlayAgain() {
    setChosenMinutes(null);
    setSecondsOff(null);
    setScreen("pick");
  }

  // Waiting screen gets its own full-page background — skip the galaxy wrapper
  if (screen === "waiting" && chosenOption) {
    return <WaitingScreen option={chosenOption} onStop={handleStop} />;
  }

  return (
    <div className="galaxy min-h-screen flex flex-col items-center justify-center">
      {/* Decorative nebula blobs */}
      <div
        className="nebula w-96 h-96 bg-purple-500"
        style={{ top: "-80px", left: "-80px" }}
      />
      <div
        className="nebula w-80 h-80 bg-blue-500"
        style={{ bottom: "-60px", right: "-40px", opacity: 0.15 }}
      />
      <div
        className="nebula w-64 h-64 bg-pink-400"
        style={{ top: "40%", left: "60%", opacity: 0.12 }}
      />

      {/* Shooting star */}
      <div className="shooting" />

      {/* Twinkling stars */}
      <StarField />

      {/* ── Pick screen ── */}
      {screen === "pick" && (
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center w-full max-w-sm">
          {/* Title */}
          <div>
            <div className="text-5xl mb-1">🚀</div>
            <h1
              className="text-4xl font-black tracking-tight text-white drop-shadow-lg"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Time Guesser
            </h1>
            <p
              className="mt-2 text-lg font-bold text-purple-200"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              How long can you wait?
            </p>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-5 w-full">
            {TIME_OPTIONS.map((opt) => (
              <TimeCard key={opt.minutes} option={opt} onSelect={handleSelect} />
            ))}
          </div>

          <p className="text-purple-300 text-sm font-bold mt-2">
            No peeking at the clock! 🌟
          </p>
        </div>
      )}

      {/* ── Result screen ── */}
      {screen === "result" &&
        chosenOption &&
        secondsOff !== null && (
          <ResultScreen
            minutes={chosenOption.minutes}
            secondsOff={secondsOff}
            onPlayAgain={handlePlayAgain}
          />
        )}
    </div>
  );
}
