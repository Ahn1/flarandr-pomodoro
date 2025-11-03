# 🍅 Pomodoro Timer

Ein moderner, schöner Pomodoro-Timer für produktives Arbeiten.

## Features

- ⏱️ **25-5-25 Minuten Zyklus**: 3 Arbeitsphasen à 25 Minuten mit 5 Minuten Pausen, dann eine lange 25-minütige Pause
- 🎨 **Moderne UI**: Aufgeräumtes Design mit subtilen Glow-Effekten
- 🌓 **Dark/Light Mode**: Automatische Theme-Erkennung mit manuellem Toggle
- 🔔 **Benachrichtigungen**: Browser-Notifications wenn ein Timer abläuft
- 🔊 **Sound-Effekte**: Akustische Signale bei Phasenübergängen
- 📊 **Session-Tracking**: Zeigt abgeschlossene Pomodoros und aktuelle Session
- ⚙️ **Anpassbar**: Alle Timer-Dauern können in den Einstellungen angepasst werden
- 🎯 **Browser-Titel**: Zeigt verbleibende Zeit im Browser-Tab

## Tech Stack

- **Next.js 16** mit App Router
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** Komponenten
- **next-themes** für Dark Mode
- **pnpm** als Package Manager

## Installation

```bash
pnpm install
```

## Entwicklung

```bash
pnpm dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Build

```bash
pnpm build
pnpm start
```

## Verwendung

1. Klicke auf "Start", um die erste Arbeitsphase zu beginnen
2. Der Timer läuft automatisch durch die Phasen
3. Nutze "Pause" um den Timer anzuhalten
4. Nutze "Überspringen" um zur nächsten Phase zu springen
5. Passe die Timer-Dauern in den Einstellungen an (⚙️ Icon oben rechts)
6. Wechsle zwischen Dark/Light Mode mit dem Mond/Sonne Icon

## Phasen

- 🍅 **Arbeitszeit** (Standard: 25 Min) - Rot
- ☕ **Kurze Pause** (Standard: 5 Min) - Grün
- 🌴 **Lange Pause** (Standard: 25 Min) - Blau

## Lizenz

MIT
