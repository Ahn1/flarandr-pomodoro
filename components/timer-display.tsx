"use client";

import { useState } from "react";
import { type TimerPhase, type TimerStatus } from "@/lib/use-pomodoro";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  phase: TimerPhase;
  status: TimerStatus;
  onJumpToTime: (newTimeLeft: number) => void;
}

export function TimerDisplay({
  timeLeft,
  totalTime,
  phase,
  status,
  onJumpToTime,
}: TimerDisplayProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingTime, setPendingTime] = useState(0);

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

  const handleCircleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();

    if (status === "idle" || phase === "idle" || totalTime === 0) {
      return;
    }

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const dx = clickX - centerX;
    const dy = clickY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < radius - 20 || distance > radius + 20) {
      return;
    }

    let angle = Math.atan2(dy, dx);
    angle = (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);

    const progressPercent = angle / (2 * Math.PI);
    const newTimeLeft = Math.round(totalTime * progressPercent);

    if (
      newTimeLeft >= 0 &&
      newTimeLeft <= totalTime &&
      newTimeLeft !== timeLeft
    ) {
      setPendingTime(newTimeLeft);
      setDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    onJumpToTime(pendingTime);
    setDialogOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative p-8">
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className={`transform -rotate-90 overflow-visible ${
            status !== "idle" && phase !== "idle" ? "cursor-pointer" : ""
          }`}
          onClick={handleCircleClick}
        >
          <circle
            cx="160"
            cy="160"
            r={radius + 20}
            fill="transparent"
            className="pointer-events-auto"
          />
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-muted/20 pointer-events-none"
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
            className={`${phaseColors[phase]} ${phaseGlows[phase]} transition-all duration-1000 pointer-events-none`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-7xl font-bold tabular-nums">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-lg text-muted-foreground mt-2">
            {phaseLabels[phase]}
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zur Restzeit springen?</DialogTitle>
            <DialogDescription>
              Möchtest du zur Restzeit {formatTime(pendingTime)} springen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirm}>Bestätigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
