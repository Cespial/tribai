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
  { id: "more", label: "Mas", icon: MoreHorizontal },
];

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

            {/* CTA + Store badges */}
            <div className="mt-8 flex flex-col gap-4">
              <Link href="/asistente" className="btn-primary h-12 w-fit px-6">
                Probar el asistente
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-3">
                <span className="phone-store-badge" aria-label="Proximamente en App Store">
                  <Image
                    src="/brand/app-store-badge.png"
                    alt="Download on the App Store"
                    width={135}
                    height={44}
                    className="h-[44px] w-auto"
                  />
                  <span className="phone-store-coming">Pronto</span>
                </span>
                <span className="phone-store-badge" aria-label="Proximamente en Google Play">
                  <Image
                    src="/brand/google-play-badge.png"
                    alt="Get it on Google Play"
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
