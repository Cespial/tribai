import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — tribai.co",
  description:
    "Privacy policy for TribAI - Super App Tributaria. Learn how we protect your personal data in compliance with Colombian data protection law (Ley 1581 de 2012).",
  alternates: {
    canonical: "/privacy",
    languages: {
      es: "/privacidad",
    },
  },
  openGraph: {
    title: "Privacy Policy — tribai.co",
    description:
      "Learn how tribai.co protects your personal data and privacy.",
    type: "website",
    locale: "en_US",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 animate-in fade-in duration-500">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="mb-12 pb-6 border-b border-border/60">
        <h1 className="flex items-center gap-3 heading-serif text-2xl sm:text-3xl text-foreground">
          <div className="rounded-lg bg-muted p-2.5 text-foreground/70">
            <Shield className="h-7 w-7" />
          </div>
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: March 2026
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          <Link
            href="/privacidad"
            className="underline hover:text-foreground transition-colors"
          >
            Leer en Espanol
          </Link>
        </p>
      </div>

      <main className="space-y-8">
        <div className="surface-card rounded-xl p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            At TribAI (tribai.co), we are committed to protecting the privacy
            and personal data of our users. This policy describes how we
            collect, use, and protect your information when you use TribAI
            &mdash; Super App Tributaria (hereinafter &ldquo;the
            App&rdquo;).
          </p>
        </div>

        <Section title="1. Information We Collect">
          <p>
            We collect the minimum information necessary for the App to
            function:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account data:</strong> name, email address, and user ID,
              solely for authentication and App functionality.
            </li>
            <li>
              <strong>Assistant queries:</strong> questions sent to the AI
              assistant are processed on external servers to generate responses.
              Conversations are not permanently stored on our servers.
            </li>
            <li>
              <strong>Local data:</strong> conversation history, bookmarks,
              notes, and preferences are stored exclusively on your device
              (local browser or app storage).
            </li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            We use the information collected exclusively to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>Authenticate your identity and manage your account.</li>
            <li>
              Process your tax questions through the AI assistant.
            </li>
            <li>Improve service quality and functionality.</li>
          </ul>
          <p className="mt-3">
            We do not sell, rent, or share your personal data with third parties
            for advertising or marketing purposes.
          </p>
        </Section>

        <Section title="3. Data Storage">
          <p>
            The following data is stored exclusively on your device:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Conversation history with the assistant (up to 30 conversations).
            </li>
            <li>Bookmarked articles and personal notes.</li>
            <li>App preferences (theme, settings).</li>
          </ul>
          <p className="mt-3">
            This data is not transmitted to any external server and remains
            under your full control. You can delete this data at any time
            directly from the App.
          </p>
        </Section>

        <Section title="4. Third-Party Services">
          <p>
            The App uses the following third-party services exclusively for its
            operation:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Anthropic (Claude):</strong> natural language processing
              for the AI assistant. Queries are sent to Anthropic&apos;s servers
              to generate tax-related responses.
            </li>
            <li>
              <strong>Pinecone:</strong> semantic search across the tax
              knowledge base (Colombian Tax Code, DIAN doctrine,
              jurisprudence).
            </li>
          </ul>
          <p className="mt-3">
            These services process queries solely to generate responses and do
            not store users&apos; personal data. Each service has its own
            privacy policy.
          </p>
        </Section>

        <Section title="5. Tracking and Cookies">
          <p>
            The App does NOT track users. We do not use:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>Tracking or advertising cookies.</li>
            <li>Tracking pixels.</li>
            <li>Third-party analytics tools.</li>
            <li>Advertising networks or retargeting services.</li>
          </ul>
          <p className="mt-3">
            We do not share data with third parties for advertising or tracking
            purposes.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            In accordance with Colombian Law 1581 of 2012 (Personal Data
            Protection Act &mdash; Habeas Data), you have the right to:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Access:</strong> freely access your personal data that has
              been processed.
            </li>
            <li>
              <strong>Update and rectify:</strong> request the update or
              correction of your personal data.
            </li>
            <li>
              <strong>Delete:</strong> request the deletion of your data when
              you deem it appropriate. You can delete your data at any time
              directly from the App.
            </li>
            <li>
              <strong>Revoke:</strong> revoke authorization for the processing
              of your personal data.
            </li>
            <li>
              <strong>File complaints:</strong> with the Superintendence of
              Industry and Commerce (SIC) for violations of data protection
              law.
            </li>
          </ul>
          <p className="mt-3">
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:privacidad@tribai.co"
              className="text-[var(--tribai-blue)] underline hover:no-underline"
            >
              privacidad@tribai.co
            </a>
            .
          </p>
        </Section>

        <Section title="7. Security">
          <p>We implement the following security measures:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              Encrypted communications (HTTPS/TLS) with all external services.
            </li>
            <li>
              Local storage of sensitive data (conversations never leave your
              device).
            </li>
            <li>Rate limiting to prevent platform abuse.</li>
            <li>
              Minimal data collection: we only collect what is strictly
              necessary.
            </li>
          </ul>
        </Section>

        <Section title="8. Minors">
          <p>
            The App is not intended for individuals under 18 years of age. We do
            not knowingly collect information from minors.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We reserve the right to update this privacy policy. Significant
            changes will be communicated through the App. The last updated date
            will be reflected at the top of this document.
          </p>
        </Section>

        <Section title="10. Legal Framework">
          <p>
            This privacy policy is governed by applicable Colombian legislation
            on personal data protection, including:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Law 1581 of 2012:</strong> Statutory Law on Personal Data
              Protection (Habeas Data).
            </li>
            <li>
              <strong>Decree 1377 of 2013:</strong> regulatory decree for Law
              1581 of 2012.
            </li>
          </ul>
        </Section>

        <Section title="11. Contact">
          <p>
            For questions, requests, or concerns regarding this privacy policy
            or the processing of your personal data, you may contact us at:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5">
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:privacidad@tribai.co"
                className="text-[var(--tribai-blue)] underline hover:no-underline"
              >
                privacidad@tribai.co
              </a>
            </li>
            <li>
              <strong>Website:</strong>{" "}
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
