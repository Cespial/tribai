"use client";

import { useState } from "react";
import { Home, MessageCircle, Calculator, BookOpen, MoreHorizontal } from "lucide-react";
import { AppHomeTab } from "@/components/app-preview/app-home-tab";
import { AppChatTab } from "@/components/app-preview/app-chat-tab";
import { AppCalculatorsTab } from "@/components/app-preview/app-calculators-tab";
import { AppETTab } from "@/components/app-preview/app-et-tab";
import { AppMoreTab } from "@/components/app-preview/app-more-tab";

type AppTab = "home" | "chat" | "calculators" | "et" | "more";

const TABS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "chat", label: "Asistente", icon: MessageCircle },
  { id: "calculators", label: "Calculadoras", icon: Calculator },
  { id: "et", label: "ET", icon: BookOpen },
  { id: "more", label: "Mas", icon: MoreHorizontal },
];

export default function AppPreview() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === "home" && <AppHomeTab onNavigate={setActiveTab} />}
        {activeTab === "chat" && <AppChatTab />}
        {activeTab === "calculators" && <AppCalculatorsTab />}
        {activeTab === "et" && <AppETTab />}
        {activeTab === "more" && <AppMoreTab />}
      </div>

      {/* iOS-style tab bar */}
      <nav className="app-tab-bar flex shrink-0 items-end justify-around border-t border-border bg-card/80 px-2 pb-1 pt-1.5 backdrop-blur-xl">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-tribai-blue" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.2 : 1.6} />
              <span className="text-[10px] font-medium leading-tight">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
