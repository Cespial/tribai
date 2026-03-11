"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/header";

const PlanesContent = dynamic(() => import("./planes-content"), {
  ssr: false,
  loading: () => (
    <main className="min-h-[calc(100vh-72px)] bg-background">
      <section className="px-4 pb-8 pt-16 text-center md:pb-12 md:pt-20">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mx-auto mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
      </section>
    </main>
  ),
});

export default function PlanesPage() {
  return (
    <>
      <Header />
      <PlanesContent />
    </>
  );
}
