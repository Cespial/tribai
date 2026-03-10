import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Politica de Privacidad — tribai.co",
  description:
    "Politica de privacidad de TribAI - Super App Tributaria. Conozca como protegemos sus datos personales conforme a la Ley 1581 de 2012 (Habeas Data).",
  alternates: {
    canonical: "/privacidad",
    languages: {
      en: "/privacy",
    },
  },
  openGraph: {
    title: "Politica de Privacidad — tribai.co",
    description:
      "Conozca como tribai.co protege sus datos personales y su privacidad.",
    type: "website",
    locale: "es_CO",
  },
};

export default function PrivacidadPage() {
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
            <Shield className="h-7 w-7" />
          </div>
          Politica de Privacidad
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultima actualizacion: marzo 2026
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className="underline hover:text-foreground transition-colors"
          >
            Read in English
          </Link>
        </p>
      </div>

      <main className="space-y-8">
        <div className="surface-card rounded-xl p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            En TribAI (tribai.co), nos comprometemos a proteger la privacidad y
            los datos personales de nuestros usuarios. Esta politica describe
            como recopilamos, usamos y protegemos su informacion al utilizar
            TribAI &mdash; Super App Tributaria (en adelante &ldquo;la
            Aplicacion&rdquo;).
          </p>
        </div>

        <Section title="1. Informacion que Recopilamos">
          <p>
            Recopilamos la minima informacion necesaria para el funcionamiento
            de la Aplicacion:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Datos de cuenta:</strong> nombre, correo electronico e
              identificador de usuario, exclusivamente para autenticacion y
              funcionamiento de la Aplicacion.
            </li>
            <li>
              <strong>Consultas al asistente:</strong> las preguntas enviadas al
              asistente de IA se procesan en servidores externos para generar
              respuestas. Las conversaciones no se almacenan permanentemente en
              nuestros servidores.
            </li>
            <li>
              <strong>Datos locales:</strong> el historial de conversaciones,
              favoritos, notas y preferencias se almacenan unicamente en su
              dispositivo (almacenamiento local del navegador o la aplicacion).
            </li>
          </ul>
        </Section>

        <Section title="2. Como Usamos la Informacion">
          <p>
            Utilizamos la informacion recopilada exclusivamente para:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>Autenticar su identidad y gestionar su cuenta.</li>
            <li>
              Procesar sus consultas tributarias a traves del asistente de IA.
            </li>
            <li>Mejorar la calidad y funcionalidad del servicio.</li>
          </ul>
          <p className="mt-3">
            No vendemos, alquilamos ni compartimos sus datos personales con
            terceros para fines publicitarios o de marketing.
          </p>
        </Section>

        <Section title="3. Almacenamiento de Datos">
          <p>
            Los siguientes datos se almacenan exclusivamente en su dispositivo:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Historial de conversaciones con el asistente (hasta 30
              conversaciones).
            </li>
            <li>Articulos favoritos y notas personales (bookmarks).</li>
            <li>Preferencias de la aplicacion (tema, configuraciones).</li>
          </ul>
          <p className="mt-3">
            Estos datos no se transmiten a ningun servidor externo y permanecen
            bajo su control total. Usted puede eliminar estos datos en
            cualquier momento desde la Aplicacion.
          </p>
        </Section>

        <Section title="4. Servicios de Terceros">
          <p>
            La Aplicacion utiliza los siguientes servicios de terceros
            exclusivamente para su funcionamiento:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Anthropic (Claude):</strong> procesamiento de lenguaje
              natural para el asistente de IA. Las consultas se envian a los
              servidores de Anthropic para generar respuestas tributarias.
            </li>
            <li>
              <strong>Pinecone:</strong> busqueda semantica en la base de
              conocimiento tributaria (Estatuto Tributario, doctrina DIAN,
              jurisprudencia).
            </li>
          </ul>
          <p className="mt-3">
            Estos servicios procesan las consultas unicamente para generar
            respuestas y no almacenan datos personales de los usuarios. Cada
            servicio tiene su propia politica de privacidad.
          </p>
        </Section>

        <Section title="5. Rastreo y Cookies">
          <p>
            La Aplicacion NO realiza rastreo de usuarios (tracking). No
            utilizamos:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>Cookies de seguimiento o publicitarias.</li>
            <li>Pixels de rastreo.</li>
            <li>Herramientas de analitica de terceros.</li>
            <li>Redes publicitarias ni servicios de retargeting.</li>
          </ul>
          <p className="mt-3">
            No compartimos datos con terceros para fines de publicidad o
            seguimiento.
          </p>
        </Section>

        <Section title="6. Tus Derechos">
          <p>
            De acuerdo con la Ley 1581 de 2012 (Ley de Proteccion de Datos
            Personales &mdash; Habeas Data) de la Republica de Colombia, usted
            tiene derecho a:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Conocer:</strong> acceder gratuitamente a sus datos
              personales que hayan sido objeto de tratamiento.
            </li>
            <li>
              <strong>Actualizar y rectificar:</strong> solicitar la
              actualizacion o correccion de sus datos personales.
            </li>
            <li>
              <strong>Eliminar:</strong> solicitar la supresion de sus datos
              cuando lo considere pertinente. Puede eliminar sus datos en
              cualquier momento directamente desde la Aplicacion.
            </li>
            <li>
              <strong>Revocar:</strong> revocar la autorizacion para el
              tratamiento de sus datos personales.
            </li>
            <li>
              <strong>Presentar quejas:</strong> ante la Superintendencia de
              Industria y Comercio (SIC) por infracciones a la ley de
              proteccion de datos.
            </li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos, contactenos a{" "}
            <a
              href="mailto:privacidad@tribai.co"
              className="text-[var(--tribai-blue)] underline hover:no-underline"
            >
              privacidad@tribai.co
            </a>
            .
          </p>
        </Section>

        <Section title="7. Seguridad">
          <p>Implementamos las siguientes medidas de seguridad:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Comunicaciones cifradas (HTTPS/TLS) con todos los servicios
              externos.
            </li>
            <li>
              Almacenamiento local de datos sensibles (las conversaciones nunca
              salen de su dispositivo).
            </li>
            <li>Rate limiting para prevenir uso abusivo de la plataforma.</li>
            <li>
              Minima recoleccion de datos: solo recopilamos lo estrictamente
              necesario.
            </li>
          </ul>
        </Section>

        <Section title="8. Menores de Edad">
          <p>
            La Aplicacion no esta dirigida a menores de 18 anos. No recopilamos
            intencionalmente informacion de menores de edad.
          </p>
        </Section>

        <Section title="9. Cambios a esta Politica">
          <p>
            Nos reservamos el derecho de actualizar esta politica de privacidad.
            Notificaremos cambios significativos a traves de la Aplicacion. La
            fecha de ultima actualizacion se reflejara al inicio de este
            documento.
          </p>
        </Section>

        <Section title="10. Marco Legal">
          <p>
            Esta politica de privacidad se rige por la legislacion colombiana
            aplicable en materia de proteccion de datos personales,
            incluyendo:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Ley 1581 de 2012:</strong> Ley Estatutaria de Proteccion
              de Datos Personales (Habeas Data).
            </li>
            <li>
              <strong>Decreto 1377 de 2013:</strong> reglamentario de la Ley
              1581 de 2012.
            </li>
          </ul>
        </Section>

        <Section title="11. Contacto">
          <p>
            Para preguntas, solicitudes o inquietudes sobre esta politica de
            privacidad o el tratamiento de sus datos personales, puede
            contactarnos en:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Correo electronico:</strong>{" "}
              <a
                href="mailto:privacidad@tribai.co"
                className="text-[var(--tribai-blue)] underline hover:no-underline"
              >
                privacidad@tribai.co
              </a>
            </li>
            <li>
              <strong>Sitio web:</strong>{" "}
              <a
                href="https://tribai.co"
                className="text-[var(--tribai-blue)] underline hover:no-underline"
              >
                tribai.co
              </a>
            </li>
          </ul>
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
