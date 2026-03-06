"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { AppHomeTab } from "@/components/app-preview/app-home-tab";
import { AppChatTab } from "@/components/app-preview/app-chat-tab";
import { AppCalculatorsTab } from "@/components/app-preview/app-calculators-tab";
import { AppETTab } from "@/components/app-preview/app-et-tab";
import { AppMoreTab } from "@/components/app-preview/app-more-tab";
import {
  Home,
  MessageCircle,
  Calculator,
  BookOpen,
  MoreHorizontal,
} from "lucide-react";

type AppTab = "home" | "chat" | "calculators" | "et" | "more";

const TABS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "chat", label: "Asistente", icon: MessageCircle },
  { id: "calculators", label: "Calc.", icon: Calculator },
  { id: "et", label: "ET", icon: BookOpen },
  { id: "more", label: "Mas", icon: MoreHorizontal },
];

/* ── App Store badge SVG (official proportions) ── */
function AppStoreBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Download on the App Store">
      <rect width="120" height="40" rx="6" fill="#000" />
      <text x="60" y="13" textAnchor="middle" fill="#fff" fontSize="6.5" fontFamily="system-ui, sans-serif" fontWeight="400">Disponible en</text>
      <text x="60" y="28" textAnchor="middle" fill="#fff" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="600">App Store</text>
      {/* Apple logo simplified */}
      <g transform="translate(15, 13)" fill="#fff">
        <path d="M7.5 0C7.5 0 8.1 1.1 8.1 2.3c0 1.5-1.2 2.3-1.2 2.3s-.9-.8-.9-2.2C6 1.1 7.5 0 7.5 0zm-2.3 3.5c-.5 0-1.4.6-2.3.6C1.8 4.1.8 3 .8 3s-.8.9-.8 2.5c0 2.6 2.3 5.5 3.3 5.5.5 0 1.1-.5 1.8-.5.7 0 1.1.5 1.7.5 1.1 0 2.4-2 2.9-3.2 0 0-1.8-.7-1.8-2.6 0-1.6 1.3-2.3 1.3-2.3S8.3 1.4 7 1.4c-.9 0-1.3.6-1.8.6z" transform="scale(0.85)" />
      </g>
    </svg>
  );
}

/* ── Google Play badge SVG (official proportions) ── */
function GooglePlayBadge({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 135 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Get it on Google Play">
      <rect width="135" height="40" rx="6" fill="#000" />
      <text x="72" y="13" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="system-ui, sans-serif" fontWeight="400">DISPONIBLE EN</text>
      <text x="72" y="28" textAnchor="middle" fill="#fff" fontSize="11.5" fontFamily="system-ui, sans-serif" fontWeight="600">Google Play</text>
      {/* Play triangle */}
      <g transform="translate(12, 10)">
        <path d="M0 0l12 10L0 20V0z" fill="#48B9A7" />
        <path d="M0 0l8 7-8 7V0z" fill="#34A853" />
        <path d="M0 0l12 10-4 3L0 7V0z" fill="#FBBC04" />
        <path d="M0 20l8-6 4 3-12 3z" fill="#EA4335" />
      </g>
    </svg>
  );
}

export function PhoneMockupSection() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  return (
    <section
      aria-labelledby="app-preview-title"
      className="border-t border-border bg-background px-6 py-16 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]" delay={50}>
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          {/* Left — Copy */}
          <div className="w-full shrink-0 md:w-[45%]">
            <p className="eyebrow-label">
              Proximamente en iOS y Android
            </p>
            <h2
              id="app-preview-title"
              className="heading-serif mt-4 text-2xl text-foreground md:text-4xl"
            >
              Todo el poder tributario. En su bolsillo.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-foreground-body">
              La misma inteligencia de tribai.co — asistente IA con fuentes,
              calculadoras de precisión y el Estatuto completo — en una app nativa.
              Diseñada para contadores en movimiento.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Asistente IA con artículos del ET en tiempo real",
                "35 calculadoras offline, actualizadas a 2026",
                "1.294 artículos navegables con historial de reformas",
                "Calendario DIAN con notificaciones push",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px] text-foreground-body">
                  <span className="mt-1.5 flex h-1.5 w-1.5 shrink-0 rounded-full bg-tribai-blue" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Store badges */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/asistente" className="btn-primary h-12 px-6">
                Probar el asistente
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-2">
                <span className="phone-store-badge" aria-label="Proximamente en App Store">
                  <AppStoreBadge className="h-[40px] w-auto" />
                  <span className="phone-store-coming">Pronto</span>
                </span>
                <span className="phone-store-badge" aria-label="Proximamente en Google Play">
                  <GooglePlayBadge className="h-[40px] w-auto" />
                  <span className="phone-store-coming">Pronto</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right — iPhone Mockup with inline app */}
          <div className="flex flex-1 justify-center">
            <div className="phone-mockup">
              {/* Dynamic Island */}
              <div className="phone-dynamic-island" />

              {/* Screen content — rendered directly */}
              <div className="phone-screen">
                <div className="flex h-full flex-col bg-background text-foreground">
                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {activeTab === "home" && <AppHomeTab onNavigate={setActiveTab} />}
                    {activeTab === "chat" && <AppChatTab />}
                    {activeTab === "calculators" && <AppCalculatorsTab />}
                    {activeTab === "et" && <AppETTab />}
                    {activeTab === "more" && <AppMoreTab />}
                  </div>

                  {/* Tab bar */}
                  <nav className="flex shrink-0 items-end justify-around border-t border-border bg-card/90 px-1 pb-1 pt-1 backdrop-blur-xl">
                    {TABS.map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`flex flex-col items-center gap-0.5 px-2 py-0.5 transition-colors ${
                            isActive ? "text-tribai-blue" : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.2 : 1.6} />
                          <span className="text-[8px] font-medium leading-tight">{label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Home indicator */}
              <div className="phone-home-indicator" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
