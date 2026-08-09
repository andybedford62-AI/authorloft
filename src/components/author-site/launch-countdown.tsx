"use client";

import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";

interface Props {
  launchDate: string;
  accentColor?: string;
}

function timeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    d: Math.floor(totalSeconds / 86400),
    h: Math.floor((totalSeconds % 86400) / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

export function LaunchCountdown({ launchDate, accentColor = "#6366f1" }: Props) {
  const target = new Date(launchDate);
  const [left, setLeft] = useState(() => timeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(timeLeft(new Date(launchDate))), 1000);
    return () => clearInterval(id);
  }, [launchDate]);

  if (!left) return null;

  const units = [
    { label: "Days",    value: left.d },
    { label: "Hours",   value: left.h },
    { label: "Minutes", value: left.m },
    { label: "Seconds", value: left.s },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Rocket className="h-4 w-4" style={{ color: accentColor }} />
        <p className="text-sm font-semibold text-gray-800">Launching In</p>
      </div>
      <div className="flex justify-center gap-3 sm:gap-8">
        {units.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center min-w-[3rem]">
            <span
              className="text-3xl sm:text-4xl font-bold tabular-nums"
              style={{ color: accentColor }}
            >
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
