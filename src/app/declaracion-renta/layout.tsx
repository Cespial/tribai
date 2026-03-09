import type { Metadata } from "next";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Declaración de Renta Personas Naturales | tribai.co",
  description:
    "Calcula tu declaración de renta paso a paso con el Formulario 210 guiado. Deducciones, rentas exentas, Art. 241, cédula general, pensiones, dividendos y optimización fiscal automática.",
  openGraph: {
    title: "Declaración de Renta — Formulario 210 Guiado",
    description:
      "Wizard inteligente para calcular tu impuesto de renta como persona natural en Colombia. Gratis, sin registro, con sugerencias de optimización fiscal.",
    type: "website",
    locale: "es_CO",
    siteName: "tribai.co",
  },
};

export default function DeclaracionRentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 pb-20 sm:px-6 sm:py-12 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
