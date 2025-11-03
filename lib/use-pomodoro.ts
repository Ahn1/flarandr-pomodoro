"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type TimerPhase = "work" | "short-break" | "long-break" | "idle";
export type TimerStatus = "idle" | "running" | "paused";

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoContinue: boolean;
}

export interface PomodoroState {
  phase: TimerPhase;
  status: TimerStatus;
  timeLeft: number;
  totalTime: number;
  completedPomodoros: number;
  currentSession: number;
  settings: PomodoroSettings;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 25 * 60,
  sessionsUntilLongBreak: 3,
  autoContinue: false,
};

const STORAGE_KEY = "pomodoro-state";
const SETTINGS_KEY = "pomodoro-settings";

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = useState<TimerPhase>("idle");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentSession, setCurrentSession] = useState(1);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }

      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const state = JSON.parse(savedState);
        setCompletedPomodoros(state.completedPomodoros || 0);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedPomodoros }));
    }
  }, [completedPomodoros]);

  const playSound = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }, []);

  const sendNotification = useCallback(
    (message: string) => {
      if (typeof window === "undefined") return;

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: message,
          icon: "/favicon.ico",
        });
      }
      playSound();
    },
    [playSound]
  );

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === "undefined") return;

    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  const updateTitle = useCallback((time: number, currentPhase: TimerPhase) => {
    if (typeof window === "undefined") return;

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    const phaseNames = {
      work: "🍅 Arbeit",
      "short-break": "☕ Kurze Pause",
      "long-break": "🌴 Lange Pause",
      idle: "Pomodoro Timer",
    };

    document.title =
      currentPhase === "idle"
        ? "Pomodoro Timer"
        : `${timeString} - ${phaseNames[currentPhase]}`;
  }, []);

  const getNextPhase = useCallback((): Exclude<TimerPhase, "idle"> => {
    if (phase === "work") {
      if (currentSession >= settings.sessionsUntilLongBreak) {
        return "long-break";
      }
      return "short-break";
    }
    return "work";
  }, [phase, currentSession, settings.sessionsUntilLongBreak]);

  const transitionToNextPhase = useCallback(() => {
    const nextPhase = getNextPhase();

    const phaseMessages: Record<Exclude<TimerPhase, "idle">, string> = {
      work: "Pause vorbei! Zeit zu arbeiten! 🍅",
      "short-break": "Tolle Arbeit! Zeit für eine kurze Pause ☕",
      "long-break": "Großartig! Zeit für eine lange Pause 🌴",
    };

    sendNotification(phaseMessages[nextPhase]);

    if (phase === "work") {
      setCompletedPomodoros((prev) => prev + 1);
    }

    if (phase === "long-break") {
      setCurrentSession(1);
    } else if (nextPhase === "work" && phase !== "idle") {
      setCurrentSession((prev) => prev + 1);
    }

    setPhase(nextPhase);
    const duration =
      nextPhase === "work"
        ? settings.workDuration
        : nextPhase === "short-break"
        ? settings.shortBreakDuration
        : settings.longBreakDuration;

    setTimeLeft(duration);
    setTotalTime(duration);

    if (settings.autoContinue) {
      setStatus("running");
    } else {
      setStatus("idle");
    }
  }, [phase, getNextPhase, settings, sendNotification]);

  useEffect(() => {
    if (status === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          updateTitle(newTime, phase);

          if (newTime <= 0) {
            transitionToNextPhase();
            return 0;
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeLeft, phase, updateTitle, transitionToNextPhase]);

  const start = useCallback(() => {
    requestNotificationPermission();

    if (phase === "idle") {
      setPhase("work");
      setTimeLeft(settings.workDuration);
      setTotalTime(settings.workDuration);
      setCurrentSession(1);
    }

    setStatus("running");
  }, [phase, settings.workDuration, requestNotificationPermission]);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
  }, []);

  const skip = useCallback(() => {
    if (phase === "idle") return;
    transitionToNextPhase();
  }, [phase, transitionToNextPhase]);

  const reset = useCallback(() => {
    setStatus("idle");
    setPhase("idle");
    setTimeLeft(0);
    setTotalTime(0);
    setCurrentSession(1);
    updateTitle(0, "idle");
  }, [updateTitle]);

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    []
  );

  const resetStats = useCallback(() => {
    setCompletedPomodoros(0);
  }, []);

  return {
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
    updateSettings,
    resetStats,
  };
}
