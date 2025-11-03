"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { type TimerStatus } from "@/lib/use-pomodoro";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onResume,
  onSkip,
  onReset,
}: TimerControlsProps) {
  return (
    <div className="flex items-center gap-4">
      {status === "idle" && (
        <Button
          size="lg"
          onClick={onStart}
          className="min-w-32 text-lg h-14"
        >
          <Play className="w-5 h-5 mr-2" />
          Start
        </Button>
      )}
      
      {status === "running" && (
        <>
          <Button
            size="lg"
            variant="secondary"
            onClick={onPause}
            className="min-w-32 text-lg h-14"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onSkip}
            className="h-14"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Überspringen
          </Button>
        </>
      )}
      
      {status === "paused" && (
        <>
          <Button
            size="lg"
            onClick={onResume}
            className="min-w-32 text-lg h-14"
          >
            <Play className="w-5 h-5 mr-2" />
            Fortsetzen
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onSkip}
            className="h-14"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            Überspringen
          </Button>
        </>
      )}
      
      {status !== "idle" && (
        <Button
          size="lg"
          variant="ghost"
          onClick={onReset}
          className="h-14"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}

