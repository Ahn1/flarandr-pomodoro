"use client";

import { Card } from "@/components/ui/card";
import { type TimerPhase } from "@/lib/use-pomodoro";

interface SessionStatsProps {
  completedPomodoros: number;
  currentSession: number;
  totalSessions: number;
  phase: TimerPhase;
}

export function SessionStats({
  completedPomodoros,
  currentSession,
  totalSessions,
  phase,
}: SessionStatsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <Card className="px-6 py-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="text-center">
          <div className="text-3xl font-bold">{completedPomodoros}</div>
          <div className="text-sm text-muted-foreground mt-1">
            Pomodoros heute
          </div>
        </div>
      </Card>
      
      {phase !== "idle" && (
        <Card className="px-6 py-4 bg-card/50 backdrop-blur-sm border-border/50">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {currentSession}/{totalSessions}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Aktuelle Session
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

