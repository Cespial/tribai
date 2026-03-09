import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Declaración de Renta Personas Jurídicas | tribai.co",
  description:
    "Calcula la declaración de renta de tu empresa con el Formulario 110 guiado. Art. 240, tarifa 35%, zonas francas, ZESE, ZOMAC, TTD, descuentos tributarios y optimización fiscal automática.",
  openGraph: {
    title: "Declaración de Renta Jurídicas — Formulario 110 Guiado",
    description:
      "Wizard inteligente para calcular el impuesto de renta de personas jurídicas en Colombia. Gratis, sin registro, con todos los regímenes especiales.",
    type: "website",
    locale: "es_CO",
    siteName: "tribai.co",
  },
};

export default function DeclaracionJuridicasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-20 sm:px-6 sm:py-12 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
