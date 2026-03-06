import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tribai.co — App Preview",
  robots: { index: false, follow: false },
};

export default function AppPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-preview-root">
      {children}
    </div>
  );
}
