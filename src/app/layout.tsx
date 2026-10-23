import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgendaZen | Fisioterapia & Acupuntura",
  description:
    "Sistema de gestão completo para clínicas e profissionais autônomos de fisioterapia e acupuntura.",
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F4C5C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-brand-surface font-sans antialiased selection:bg-brand-light selection:text-white">
        {children}
      </body>
    </html>
  );
}
