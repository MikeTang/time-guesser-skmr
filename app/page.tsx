"use client";

import { useEffect, useRef, useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
type Screen = "pick" | "waiting";

interface TimeOption {
  minutes: number;
  emoji: string;
  label: string;
  gradient: string;
  shadow: string;
  numberColor: string;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    minutes: 1,
    emoji: "🌟",
    label: "Warm-up!",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    shadow: "0 8px 32px rgba(251,191,36,0.45)",
    numberColor: "#78350f",
  },
  {
    minutes: 2,
    emoji: "🚀",
    label: "Getting good!",
    gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
    shadow: "0 8px 32px rgba(251,146,60,0.45)",
    numberColor: "#7c2d12",
  },
  {
    minutes: 5,
    emoji: "🪐",
    label: "Space explorer!",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
    shadow: "0 8px 32px rgba(56,189,248,0.45)",
    numberColor: "#0c4a6e",
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
    // navigate after animation completes
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

/* ─── Waiting screen (stub) ──────────────────────────────── */
function WaitingScreen({ minutes }: { minutes: number }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
      <div className="text-6xl">🚀</div>
      <h2 className="text-4xl font-black text-white drop-shadow-lg">
        {minutes} {minutes === 1 ? "Minute" : "Minutes"}
      </h2>
      <p className="text-xl font-bold text-purple-200">
        The clock is ticking… no peeking! 🌟
      </p>
      <p className="text-sm font-bold text-purple-400">
        (Waiting screen coming soon!)
      </p>
    </div>
  );
}

/* ─── Root page ──────────────────────────────────────────── */
export default function Home() {
  const [screen, setScreen] = useState<Screen>("pick");
  const [chosenMinutes, setChosenMinutes] = useState<number | null>(null);

  function handleSelect(minutes: number) {
    setChosenMinutes(minutes);
    setScreen("waiting");
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

          <p
            className="text-sm font-bold text-purple-300"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            No peeking at the clock! 🌟
          </p>
        </div>
      )}

      {/* ── Waiting screen ── */}
      {screen === "waiting" && chosenMinutes !== null && (
        <WaitingScreen minutes={chosenMinutes} />
      )}
    </div>
  );
}
