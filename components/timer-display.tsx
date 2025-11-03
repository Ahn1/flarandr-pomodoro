"use client";

import { type TimerPhase } from "@/lib/use-pomodoro";

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  phase: TimerPhase;
}

export function TimerDisplay({ timeLeft, totalTime, phase }: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  
  const phaseColors = {
    work: "stroke-red-500",
    "short-break": "stroke-emerald-500",
    "long-break": "stroke-blue-500",
    idle: "stroke-gray-400",
  };

  const phaseGlows = {
    work: "drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    "short-break": "drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    "long-break": "drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    idle: "",
  };
  
  const phaseLabels = {
    work: "🍅 Arbeitszeit",
    "short-break": "☕ Kurze Pause",
    "long-break": "🌴 Lange Pause",
    idle: "Bereit?",
  };

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className="transform -rotate-90"
        >
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/20"
          />
          
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${phaseColors[phase]} ${phaseGlows[phase]} transition-all duration-1000`}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-7xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          <div className="text-lg text-muted-foreground mt-2">
            {phaseLabels[phase]}
          </div>
        </div>
      </div>
    </div>
  );
}

