import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terminos de Uso — tribai.co",
  description:
    "Terminos y condiciones de uso de tribai.co, la plataforma tributaria colombiana. Conozca las condiciones del servicio, exclusion de asesoria profesional y uso de inteligencia artificial.",
  alternates: {
    canonical: "/terminos",
  },
  openGraph: {
    title: "Terminos de Uso — tribai.co",
    description:
      "Terminos y condiciones de uso de tribai.co, plataforma tributaria colombiana.",
    type: "website",
    locale: "es_CO",
  },
};

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 animate-in fade-in duration-500">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Inicio
      </Link>

      <div className="mb-12 pb-6 border-b border-border/60">
        <h1 className="flex items-center gap-3 heading-serif text-2xl sm:text-3xl text-foreground">
          <div className="rounded-lg bg-muted p-2.5 text-foreground/70">
            <FileText className="h-7 w-7" />
          </div>
          Terminos y Condiciones de Uso
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultima actualizacion: marzo 2026
        </p>
      </div>

      <main className="space-y-8">
        <Section title="1. Aceptacion de los Terminos">
          <p>
            Al descargar, instalar o utilizar SuperApp Tributaria Colombia (en
            adelante &ldquo;la Aplicacion&rdquo;), usted acepta estos Terminos
            de Uso en su totalidad. Si no esta de acuerdo, no utilice la
            Aplicacion.
          </p>
        </Section>

        <Section title="2. Naturaleza del Servicio">
          <p>
            La Aplicacion es una herramienta informativa y de referencia
            tributaria. Proporciona acceso al Estatuto Tributario de Colombia,
            calculadoras fiscales, calendario de obligaciones tributarias y un
            asistente basado en inteligencia artificial generativa.
          </p>
        </Section>

        <Section title="3. Exclusion de Asesoria Profesional">
          <div className="rounded-lg bg-muted/60 border border-border/40 p-4 mb-4">
            <p className="font-semibold text-foreground text-sm">
              IMPORTANTE
            </p>
            <p className="mt-1">
              La informacion proporcionada por esta Aplicacion, incluyendo las
              respuestas del asistente de inteligencia artificial, los resultados
              de las calculadoras y cualquier otro contenido, tiene caracter
              exclusivamente informativo y educativo.
            </p>
          </div>
          <p>
            Esta Aplicacion NO constituye asesoria tributaria, contable,
            financiera ni legal profesional. Los resultados son aproximados y
            pueden no reflejar su situacion particular.
          </p>
          <p className="mt-3">
            Para decisiones tributarias, consulte siempre con un contador publico
            certificado o un abogado tributarista debidamente autorizado en
            Colombia.
          </p>
        </Section>

        <Section title="4. Inteligencia Artificial Generativa">
          <p>
            El asistente tributario utiliza modelos de inteligencia artificial
            generativa (IA) para procesar consultas. Las respuestas son generadas
            automaticamente a partir de fuentes como el Estatuto Tributario,
            doctrina DIAN y jurisprudencia, pero pueden contener imprecisiones o
            estar desactualizadas.
          </p>
          <p className="mt-3">El usuario reconoce que:</p>
          <ul className="mt-2 list-disc pl-5 space-y-1.5">
            <li>
              Las respuestas de la IA no son infalibles y deben verificarse.
            </li>
            <li>
              La IA puede generar contenido que no refleje la normatividad
              vigente.
            </li>
            <li>
              tribai.co no garantiza la exactitud, integridad ni vigencia de las
              respuestas generadas.
            </li>
          </ul>
        </Section>

        <Section title="5. Precision de los Calculos">
          <p>
            Las calculadoras tributarias utilizan las tarifas, topes y valores
            vigentes para el ano gravable 2026 (UVT $52.374, SMLMV $1.750.905).
            Los resultados son estimaciones y pueden diferir de los calculos
            definitivos segun la situacion particular de cada contribuyente.
          </p>
        </Section>

        <Section title="6. Propiedad Intelectual">
          <p>
            El contenido del Estatuto Tributario es de dominio publico. El
            diseno, codigo fuente, marca tribai.co, las herramientas de analisis
            y la capa de inteligencia artificial son propiedad de sus creadores y
            estan protegidos por las leyes de propiedad intelectual aplicables.
          </p>
        </Section>

        <Section title="7. Limitacion de Responsabilidad">
          <p>
            En la maxima medida permitida por la ley colombiana, tribai.co y sus
            creadores no seran responsables por danos directos, indirectos,
            incidentales o consecuentes derivados del uso de la Aplicacion,
            incluyendo pero no limitado a: errores en calculos, interpretaciones
            incorrectas de la IA, decisiones tributarias basadas en la
            informacion proporcionada, o sanciones de la DIAN.
          </p>
        </Section>

        <Section title="8. Modificaciones">
          <p>
            Nos reservamos el derecho de modificar estos Terminos en cualquier
            momento. Las modificaciones entraran en vigor al publicarse en la
            Aplicacion. El uso continuado implica la aceptacion de los terminos
            modificados.
          </p>
        </Section>

        <Section title="9. Legislacion Aplicable">
          <p>
            Estos Terminos se rigen por las leyes de la Republica de Colombia.
          </p>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card rounded-xl p-6">
      <h2 className="heading-serif text-lg text-foreground mb-3">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
