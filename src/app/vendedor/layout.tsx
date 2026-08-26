import type { ReactNode } from "react";
import { exigirPapel } from "@/lib/auth/session";
import { AppShell } from "@/components/app-shell";

export default async function VendedorLayout({ children }: { children: ReactNode }) {
  const sessao = await exigirPapel("vendedor");
  return <AppShell sessao={sessao}>{children}</AppShell>;
}
