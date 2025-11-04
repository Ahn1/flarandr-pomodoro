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

interface SavedState {
  phase: TimerPhase;
  status: TimerStatus;
  timeLeft: number;
  totalTime: number;
  completedPomodoros: number;
  currentSession: number;
  savedAt: number;
}

function loadInitialState() {
  if (typeof window === "undefined") {
    return {
      settings: DEFAULT_SETTINGS,
      phase: "idle" as TimerPhase,
      status: "idle" as TimerStatus,
      timeLeft: 0,
      totalTime: 0,
      completedPomodoros: 0,
      currentSession: 1,
    };
  }

  let settings = DEFAULT_SETTINGS;
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      settings = { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }

  const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return {
      settings,
      phase: "idle" as TimerPhase,
      status: "idle" as TimerStatus,
      timeLeft: 0,
      totalTime: 0,
      completedPomodoros: 0,
      currentSession: 1,
    };
  }

  try {
    const state: SavedState = JSON.parse(savedState);

    let timeLeft = state.timeLeft || 0;
    let status = state.status || "idle";

    if (state.status === "running" && state.savedAt && state.timeLeft > 0) {
      const elapsed = Math.floor((Date.now() - state.savedAt) / 1000);
      const newTimeLeft = Math.max(0, state.timeLeft - elapsed);

      if (newTimeLeft <= 0) {
        timeLeft = 0;
        status = "idle";
      } else {
        timeLeft = newTimeLeft;
      }
    }

    return {
      settings,
      phase: state.phase || "idle",
      status,
      timeLeft,
      totalTime: state.totalTime || 0,
      completedPomodoros: state.completedPomodoros || 0,
      currentSession: state.currentSession || 1,
    };
  } catch (e) {
    console.error("Failed to load saved state:", e);
    return {
      settings,
      phase: "idle" as TimerPhase,
      status: "idle" as TimerStatus,
      timeLeft: 0,
      totalTime: 0,
      completedPomodoros: 0,
      currentSession: 1,
    };
  }
}

export function usePomodoro() {
  const initialState = loadInitialState();
  const [settings, setSettings] = useState<PomodoroSettings>(
    initialState.settings
  );
  const [phase, setPhase] = useState<TimerPhase>(initialState.phase);
  const [status, setStatus] = useState<TimerStatus>(initialState.status);
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [totalTime, setTotalTime] = useState(initialState.totalTime);
  const [completedPomodoros, setCompletedPomodoros] = useState(
    initialState.completedPomodoros
  );
  const [currentSession, setCurrentSession] = useState(
    initialState.currentSession
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasLoadedRef = useRef(true);
  const isResettingRef = useRef(false);

  const saveState = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isResettingRef.current) return;

    if (phase === "idle" && status === "idle" && timeLeft === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const stateToSave: SavedState = {
      phase,
      status,
      timeLeft,
      totalTime,
      completedPomodoros,
      currentSession,
      savedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [phase, status, timeLeft, totalTime, completedPomodoros, currentSession]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (hasLoadedRef.current) {
      saveState();
    }
  }, [
    phase,
    status,
    timeLeft,
    totalTime,
    completedPomodoros,
    currentSession,
    saveState,
  ]);

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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isResettingRef.current = true;
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStatus("idle");
    setPhase("idle");
    setTimeLeft(0);
    setTotalTime(0);
    setCompletedPomodoros(0);
    setCurrentSession(1);
    updateTitle(0, "idle");
    setTimeout(() => {
      isResettingRef.current = false;
    }, 100);
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
