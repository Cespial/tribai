"use client";

import { useState } from "react";
import Image from "next/image";
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
  { id: "more", label: "Más", icon: MoreHorizontal },
];

export function PhoneMockupSection() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  return (
    <section
      aria-labelledby="app-preview-title"
      className="border-t border-border bg-background px-6 py-10 md:px-12 md:py-24 lg:px-20"
    >
      <Reveal className="mx-auto max-w-[960px]" delay={50}>
        <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:gap-16">
          {/* Left — Copy */}
          <div className="w-full shrink-0 md:w-[45%]">
            <p className="eyebrow-label">
              Disponible en web · Próximamente en iOS y Android
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

            {/* CTA + Store badges */}
            <div className="mt-8 flex flex-col gap-4">
              <Link href="/asistente" className="btn-primary h-12 w-fit px-6">
                Probar en la web ahora
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="phone-store-badge">
                  <Image
                    src="/brand/app-store-badge.png"
                    alt="Próximamente en App Store"
                    width={135}
                    height={44}
                    className="h-[44px] w-auto"
                  />
                  <span className="phone-store-coming">Pronto</span>
                </span>
                <span className="phone-store-badge">
                  <Image
                    src="/brand/google-play-badge.png"
                    alt="Próximamente en Google Play"
                    width={135}
                    height={44}
                    className="h-[44px] w-auto"
                  />
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

              {/* Screen content — rendered directly, forced light mode */}
              <div className="phone-screen" data-theme="light">
                <div className="flex h-full flex-col bg-white text-[#1A1A1A]" style={{ colorScheme: "light" }}>
                  {/* iOS Status Bar */}
                  <div className="phone-status-bar">
                    <span className="status-time">9:41</span>
                    <div className="status-icons">
                      {/* Signal */}
                      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
                        <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.3" />
                        <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" opacity="0.5" />
                        <rect x="9" y="3" width="3" height="9" rx="0.5" opacity="0.7" />
                        <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                      </svg>
                      {/* WiFi */}
                      <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
                        <path d="M8 10.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />
                        <path d="M4.94 9.06a4.36 4.36 0 0 1 6.12 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M2.46 6.59a7.63 7.63 0 0 1 11.08 0" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M.29 4.12A10.89 10.89 0 0 1 15.71 4.12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      {/* Battery */}
                      <svg width="27" height="12" viewBox="0 0 27 12" fill="currentColor" aria-hidden="true">
                        <rect x="0" y="0.5" width="23" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
                        <rect x="24" y="3.5" width="2.5" height="4.5" rx="0.7" opacity="0.4" />
                        <rect x="1.5" y="2" width="18" height="8" rx="1.2" />
                      </svg>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="phone-scroll-area flex-1 overflow-y-auto overflow-x-hidden">
                    <div key={activeTab} className="phone-tab-content">
                      {activeTab === "home" && <AppHomeTab onNavigate={setActiveTab} />}
                      {activeTab === "chat" && <AppChatTab />}
                      {activeTab === "calculators" && <AppCalculatorsTab />}
                      {activeTab === "et" && <AppETTab />}
                      {activeTab === "more" && <AppMoreTab />}
                    </div>
                  </div>

                  {/* Tab bar */}
                  <nav className="flex shrink-0 items-end justify-around border-t border-border bg-white/90 px-1 pb-1.5 pt-1 backdrop-blur-xl">
                    {TABS.map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          aria-label={label}
                          className={`flex flex-col items-center gap-0.5 rounded-md px-2 py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
                            isActive ? "text-tribai-blue" : "text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.6} />
                          <span className="text-[10px] font-medium leading-tight">{label}</span>
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
