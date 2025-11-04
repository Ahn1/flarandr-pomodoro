"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-24 max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Timer
        </Link>

        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <Card>
          <CardHeader>
            <CardTitle>Rechtliche Hinweise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Diese Website verfolgt keinen kommerziellen Zweck, enthält keine
              entgeltlichen Angebote, keine werblichen Inhalte und dient
              ausschließlich privaten bzw. persönlichen Interessen. Sie richtet
              sich nicht auf eine nachhaltige Gewinnerzielung oder Teilnahme am
              geschäftlichen Verkehr. Nach § 5 TMG besteht daher keine
              Verpflichtung zur Anbieterkennzeichnung (Impressumspflicht).
              Ebenso liegt kein journalistisch-redaktionell gestaltetes Angebot
              im Sinne des § 18 MStV vor.
            </p>
            <h5 className="text-lg font-semibold mt-6 mb-2">
              Kontakt und Anfragen
            </h5>
            <p className="text-muted-foreground">
              Für Hinweise, Fragen, Anregungen oder Mitteilungen zur Website
              nutzen Sie bitte das{" "}
              <Link
                href="https://github.com/Ahn1/flarandr-pomodoro"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
