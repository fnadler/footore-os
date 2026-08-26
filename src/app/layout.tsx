import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Design system real do Footlink (design_system.html) roda em Barlow.
const barlow = Barlow({
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Footlink — Fechamento de Venda",
  description: "Sistema interno de pedidos, aprovação e contratos Footlink",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${barlow.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
