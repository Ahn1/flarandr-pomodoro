"use client";

import { Settings, Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold hover:opacity-80 transition-opacity"
        >
          🍅 Pomodoro
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://github.com/Ahn1/flarandr-pomodoro"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub Repository</span>
            </Button>
          </a>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </Link>
          <Link href="/impressum">
            <Button variant="ghost" size="sm" className="text-xs">
              Impressum
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
