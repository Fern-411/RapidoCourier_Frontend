import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rápido Courier — Sistema de Envíos",
  description:
    "Sistema logístico profesional para registro de clientes, paquetes y envíos entre agencias.",
  keywords: ["courier", "envíos", "logística", "paquetes", "rastreo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
