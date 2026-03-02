import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { ArticlePanelProvider } from "@/contexts/article-panel-context";
import { SlideOutPanel } from "@/components/article/slide-out-panel";
import { QuickAddFab } from "@/components/workspace/quick-add-fab";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0A1628",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://superapp-tributaria-colombia.vercel.app"),
  title: "tribai.co — Inteligencia tributaria colombiana",
  description:
    "Resuelva tributaria colombiana con rigor: 35 calculadoras, 1.294 artículos del Estatuto Tributario, asistente IA con citación de fuentes. Sin costo. Sin registro.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "tribai.co",
  },
  openGraph: {
    title: "tribai.co — Inteligencia tributaria colombiana",
    description:
      "35 calculadoras, Estatuto Tributario completo y asistente IA con fuentes normativas. Hecho en Colombia para contadores colombianos.",
    type: "website",
    locale: "es_CO",
    siteName: "tribai.co",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tribai.co — Inteligencia tributaria colombiana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "tribai.co — Inteligencia tributaria colombiana",
    description:
      "El Estatuto, la calculadora y el criterio. Todo en uno. Sin costo.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ArticlePanelProvider>
            {children}
            <SlideOutPanel />
            <QuickAddFab />
          </ArticlePanelProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
