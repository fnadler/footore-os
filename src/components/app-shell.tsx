import Link from "next/link";
import type { ReactNode } from "react";
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

// AppBar roxo sólido, 60px — porte de .ds-appbar-mock (design_system.html),
// a navbar real do produto Footlink.
export function AppShell({ sessao, children }: { sessao: SessaoUsuario; children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="h-[60px] shrink-0 bg-primary">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-base font-bold text-white">
              Footlink
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium">
              {LINKS_POR_PAPEL[sessao.papel].map((link) => (
                <Link key={link.href} href={link.href} className="text-white/80 transition-colors hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/70">
              {sessao.nome} · <span className="capitalize">{sessao.papel}</span>
            </span>
            <form action={sair}>
              <button
                type="submit"
                className="h-9 rounded-lg px-3 text-sm font-semibold text-white transition-colors hover:bg-white/12"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
