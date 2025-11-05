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
  startTime: number | null;
  timeRemainingAtStart: number;
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
      startTime: null as number | null,
      timeRemainingAtStart: 0,
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
      startTime: null as number | null,
      timeRemainingAtStart: 0,
      totalTime: 0,
      completedPomodoros: 0,
      currentSession: 1,
    };
  }

  try {
    const state: SavedState = JSON.parse(savedState);

    let startTime = state.startTime;
    let timeRemainingAtStart = state.timeRemainingAtStart || 0;
    let status = state.status || "idle";

    if (
      state.status === "running" &&
      state.startTime &&
      state.timeRemainingAtStart > 0
    ) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const newTimeRemaining = Math.max(
        0,
        state.timeRemainingAtStart - elapsed
      );

      if (newTimeRemaining <= 0) {
        timeRemainingAtStart = 0;
        startTime = null;
        status = "idle";
      } else {
        startTime = Date.now();
        timeRemainingAtStart = newTimeRemaining;
      }
    } else if (state.status === "paused") {
      startTime = null;
    }

    return {
      settings,
      phase: state.phase || "idle",
      status,
      startTime,
      timeRemainingAtStart,
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
      startTime: null as number | null,
      timeRemainingAtStart: 0,
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
  const [startTime, setStartTime] = useState<number | null>(
    initialState.startTime
  );
  const [timeRemainingAtStart, setTimeRemainingAtStart] = useState(
    initialState.timeRemainingAtStart
  );
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

  const calculateTimeLeft = useCallback((): number => {
    if (startTime === null || status !== "running") {
      return timeRemainingAtStart;
    }
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, timeRemainingAtStart - elapsed);
  }, [startTime, timeRemainingAtStart, status]);

  const getInitialTimeLeft = useCallback((): number => {
    if (initialState.startTime === null || initialState.status !== "running") {
      return initialState.timeRemainingAtStart;
    }
    const elapsed = Math.floor((Date.now() - initialState.startTime) / 1000);
    return Math.max(0, initialState.timeRemainingAtStart - elapsed);
  }, [initialState]);

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  const saveState = useCallback(() => {
    if (typeof window === "undefined") return;
    if (isResettingRef.current) return;

    if (phase === "idle" && status === "idle") {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const currentTimeRemaining = calculateTimeLeft();
    const stateToSave: SavedState = {
      phase,
      status,
      startTime: status === "running" ? startTime : null,
      timeRemainingAtStart: currentTimeRemaining,
      totalTime,
      completedPomodoros,
      currentSession,
      savedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    phase,
    status,
    startTime,
    calculateTimeLeft,
    totalTime,
    completedPomodoros,
    currentSession,
  ]);

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
    startTime,
    timeRemainingAtStart,
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

    setTimeRemainingAtStart(duration);
    setTotalTime(duration);
    setTimeLeft(duration);

    if (settings.autoContinue) {
      setStartTime(Date.now());
      setStatus("running");
    } else {
      setStartTime(null);
      setStatus("idle");
    }
  }, [phase, getNextPhase, settings, sendNotification]);

  useEffect(() => {
    if (status === "running" && startTime !== null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      intervalRef.current = setInterval(() => {
        const currentTimeLeft = calculateTimeLeft();
        setTimeLeft(currentTimeLeft);
        updateTitle(currentTimeLeft, phase);

        if (currentTimeLeft <= 0) {
          transitionToNextPhase();
        }
      }, 100);
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
  }, [
    status,
    startTime,
    phase,
    calculateTimeLeft,
    updateTitle,
    transitionToNextPhase,
  ]);

  useEffect(() => {
    if (status !== "running") {
      const currentTimeLeft = calculateTimeLeft();
      setTimeout(() => {
        setTimeLeft(currentTimeLeft);
        updateTitle(currentTimeLeft, phase);
      }, 0);
    }
  }, [status, calculateTimeLeft, phase, updateTitle, timeRemainingAtStart]);

  const start = useCallback(() => {
    requestNotificationPermission();

    if (phase === "idle") {
      setPhase("work");
      setTimeRemainingAtStart(settings.workDuration);
      setTotalTime(settings.workDuration);
      setCurrentSession(1);
    }

    const currentTimeRemaining =
      phase === "idle" ? settings.workDuration : calculateTimeLeft();
    setTimeRemainingAtStart(currentTimeRemaining);
    setStartTime(Date.now());
    setStatus("running");
  }, [
    phase,
    settings.workDuration,
    calculateTimeLeft,
    requestNotificationPermission,
  ]);

  const pause = useCallback(() => {
    const currentTimeRemaining = calculateTimeLeft();
    setTimeRemainingAtStart(currentTimeRemaining);
    setStartTime(null);
    setStatus("paused");
  }, [calculateTimeLeft]);

  const resume = useCallback(() => {
    const currentTimeRemaining = calculateTimeLeft();
    setTimeRemainingAtStart(currentTimeRemaining);
    setStartTime(Date.now());
    setStatus("running");
  }, [calculateTimeLeft]);

  const skip = useCallback(() => {
    if (phase === "idle") return;
    transitionToNextPhase();
  }, [phase, transitionToNextPhase]);

  const reset = useCallback(() => {
    isResettingRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setStatus("idle");
    setPhase("idle");
    setStartTime(null);
    setTimeRemainingAtStart(0);
    setTimeLeft(0);
    setTotalTime(0);
    setCompletedPomodoros(0);
    setCurrentSession(1);
    updateTitle(0, "idle");
    setTimeout(() => {
      isResettingRef.current = false;
    }, 500);
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
