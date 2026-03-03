import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ArticlePanelProvider } from "@/contexts/article-panel-context";
import { SlideOutPanel } from "@/components/article/slide-out-panel";
import { QuickAddFab } from "@/components/workspace/quick-add-fab";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
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
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-tribai-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Ir al contenido principal
        </a>
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
