import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { SessaoUsuario } from "@/lib/auth/session";
import { sair } from "@/lib/auth/actions";

const LINKS_POR_PAPEL: Record<SessaoUsuario["papel"], { href: string; label: string }[]> = {
  vendedor: [{ href: "/vendedor", label: "Meus pedidos" }],
  juridico: [{ href: "/juridico", label: "Contratos para revisão" }],
  admin: [
    { href: "/admin", label: "Aprovação" },
    { href: "/admin/usuarios", label: "Usuários" },
    { href: "/admin/configuracoes", label: "Configurações" },
  ],
};

export function AppShell({ sessao, children }: { sessao: SessaoUsuario; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-white dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Footlink
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              {LINKS_POR_PAPEL[sessao.papel].map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {sessao.nome} · <span className="capitalize">{sessao.papel}</span>
            </span>
            <form action={sair}>
              <Button type="submit" variant="ghost" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
