"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Header } from "@/components/header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { type PomodoroSettings } from "@/lib/use-pomodoro";

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 25 * 60,
  sessionsUntilLongBreak: 3,
};

const SETTINGS_KEY = "pomodoro-settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-2xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Timer
        </Link>

        <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timer-Dauern</CardTitle>
              <CardDescription>
                Passe die Dauer für Arbeitsphasen und Pausen an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Arbeitszeit
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.workDuration / 60)} Min
                  </span>
                </div>
                <Slider
                  value={[settings.workDuration / 60]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, workDuration: value * 60 })
                  }
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Kurze Pause
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.shortBreakDuration / 60)} Min
                  </span>
                </div>
                <Slider
                  value={[settings.shortBreakDuration / 60]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, shortBreakDuration: value * 60 })
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Lange Pause
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(settings.longBreakDuration / 60)} Min
                  </span>
                </div>
                <Slider
                  value={[settings.longBreakDuration / 60]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, longBreakDuration: value * 60 })
                  }
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Sessions bis zur langen Pause
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {settings.sessionsUntilLongBreak}
                  </span>
                </div>
                <Slider
                  value={[settings.sessionsUntilLongBreak]}
                  onValueChange={([value]) =>
                    setSettings({ ...settings, sessionsUntilLongBreak: value })
                  }
                  min={2}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} className="flex-1">
              {saved ? "✓ Gespeichert!" : "Speichern"}
            </Button>
            <Button onClick={handleReset} variant="outline">
              Zurücksetzen
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

