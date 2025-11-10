"use client";

import { Header } from "@/components/header";
import { TimerDisplay } from "@/components/timer-display";
import { TimerControls } from "@/components/timer-controls";
import { SessionStats } from "@/components/session-stats";
import { DotMatrixBackground } from "@/components/dot-matrix-background";
import { usePomodoro } from "@/lib/use-pomodoro";

export default function Home() {
  const {
    phase,
    status,
    timeLeft,
    totalTime,
    completedPomodoros,
    currentSession,
    settings,
    start,
    pause,
    resume,
    skip,
    reset,
    jumpToTime,
  } = usePomodoro();

  return (
    <div className="min-h-screen relative">
      <DotMatrixBackground />
      <div 
        className="ambient-glow" 
        data-phase={status === "idle" ? "idle" : phase}
      />
      
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-12 max-w-2xl w-full">
          <TimerDisplay
            timeLeft={timeLeft}
            totalTime={totalTime}
            phase={phase}
            status={status}
            onJumpToTime={jumpToTime}
          />
          
          <TimerControls
            status={status}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onSkip={skip}
            onReset={reset}
          />
          
          <SessionStats
            completedPomodoros={completedPomodoros}
            currentSession={currentSession}
            totalSessions={settings.sessionsUntilLongBreak}
            phase={phase}
          />
        </div>
      </main>
    </div>
  );
}
