"use client";
import { useState, useEffect } from "react";

const USE_CASES = [
  "Declaración de Renta",
  "Retención en la Fuente",
  "Régimen SIMPLE",
  "Liquidación Laboral",
  "Consulta del Estatuto",
  "Calendario Fiscal",
  "Comparación de Regímenes",
];

export function UseCaseTicker() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % USE_CASES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4">
      {USE_CASES.map((useCase, i) => (
        <span
          key={useCase}
          className={`heading-serif text-3xl md:text-5xl lg:text-6xl transition-all duration-500 cursor-default ${
            i === activeIndex
              ? "text-foreground scale-100 opacity-100"
              : "text-foreground/15 scale-95 opacity-100"
          }`}
        >
          {useCase}
        </span>
      ))}
    </div>
  );
}
