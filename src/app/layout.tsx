import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// DESIGN-airbnb.md roda em Airbnb Cereal VF (proprietária) com Circular como
// fallback; Inter é o substituto open-source que o próprio guia recomenda
// (ver seção "Note on Font Substitutes").
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Footlink — Fechamento de Venda",
  description: "Sistema interno de pedidos, aprovação e contratos Footlink",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
