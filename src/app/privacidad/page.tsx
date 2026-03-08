import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Politica de Privacidad — tribai.co",
  description:
    "Politica de privacidad de tribai.co, la plataforma tributaria colombiana. Conozca como protegemos sus datos personales conforme a la Ley 1581 de 2012.",
  alternates: {
    canonical: "/privacidad",
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
      </div>

      <main className="space-y-8">
        <Section title="1. Informacion que Recopilamos">
          <p>
            Recopilamos la siguiente informacion cuando utiliza la Aplicacion:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Datos de cuenta (Sign in with Apple):</strong> nombre,
              correo electronico e identificador de usuario, exclusivamente para
              autenticacion.
            </li>
            <li>
              <strong>Consultas al asistente:</strong> las preguntas enviadas al
              asistente de IA se procesan en servidores externos para generar
              respuestas. No almacenamos el historial de consultas en nuestros
              servidores.
            </li>
            <li>
              <strong>Datos locales:</strong> el historial de conversaciones,
              favoritos, notas y preferencias se almacenan unicamente en su
              dispositivo.
            </li>
          </ul>
        </Section>

        <Section title="2. Uso de la Informacion">
          <p>
            Utilizamos la informacion recopilada exclusivamente para:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>Autenticar su identidad mediante Apple Sign In.</li>
            <li>
              Procesar sus consultas tributarias a traves del asistente de IA.
            </li>
            <li>Mejorar la calidad del servicio.</li>
          </ul>
        </Section>

        <Section title="3. Servicios de Terceros">
          <p>
            La Aplicacion utiliza los siguientes servicios de terceros para
            funcionar:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Anthropic (Claude):</strong> procesamiento de lenguaje
              natural para el asistente de IA. Las consultas se envian a los
              servidores de Anthropic para generar respuestas.
            </li>
            <li>
              <strong>Pinecone:</strong> busqueda semantica en la base de
              conocimiento tributaria.
            </li>
            <li>
              <strong>Apple:</strong> autenticacion mediante Sign in with Apple.
            </li>
          </ul>
          <p className="mt-3">
            Cada servicio tiene su propia politica de privacidad y tratamiento de
            datos.
          </p>
        </Section>

        <Section title="4. Almacenamiento Local">
          <p>
            Los siguientes datos se almacenan exclusivamente en su dispositivo:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Historial de conversaciones con el asistente (hasta 30
              conversaciones).
            </li>
            <li>Articulos favoritos y notas personales.</li>
            <li>Preferencias de la aplicacion.</li>
            <li>
              Credenciales de autenticacion (en el Keychain del dispositivo).
            </li>
          </ul>
          <p className="mt-3">
            Estos datos no se transmiten a ningun servidor externo.
          </p>
        </Section>

        <Section title="5. Rastreo y Analitica">
          <p>
            La Aplicacion NO realiza rastreo de usuarios (tracking). No
            utilizamos cookies, pixels de seguimiento, ni herramientas de
            analitica de terceros. No compartimos datos con redes publicitarias.
          </p>
        </Section>

        <Section title="6. Seguridad">
          <p>Implementamos las siguientes medidas de seguridad:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Autenticacion biometrica (Face ID / Touch ID) para proteger el
              acceso.
            </li>
            <li>
              Almacenamiento seguro de credenciales en el Keychain de iOS.
            </li>
            <li>
              Comunicaciones cifradas (HTTPS/TLS) con todos los servicios
              externos.
            </li>
            <li>Rate limiting para prevenir uso abusivo.</li>
          </ul>
        </Section>

        <Section title="7. Derechos del Usuario">
          <p>
            De acuerdo con la Ley 1581 de 2012 (Habeas Data) de Colombia, usted
            tiene derecho a:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Conocer, actualizar y rectificar sus datos personales.
            </li>
            <li>Solicitar la eliminacion de sus datos.</li>
            <li>
              Revocar la autorizacion para el tratamiento de datos.
            </li>
            <li>Acceder gratuitamente a sus datos personales.</li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos, contactenos a traves de los canales
            indicados en la Aplicacion.
          </p>
        </Section>

        <Section title="8. Menores de Edad">
          <p>
            La Aplicacion no esta dirigida a menores de 18 anos. No recopilamos
            intencionalmente informacion de menores.
          </p>
        </Section>

        <Section title="9. Cambios a esta Politica">
          <p>
            Nos reservamos el derecho de actualizar esta politica. Notificaremos
            cambios significativos a traves de la Aplicacion.
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
