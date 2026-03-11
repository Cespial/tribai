import { Header } from "@/components/layout/header";

export default function PlanificacionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
