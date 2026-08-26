import type { ReactNode } from "react";
import { ClipboardList, FileCheck2, CheckSquare, Users, Settings } from "lucide-react";
import type { SessaoUsuario } from "@/lib/auth/session";
import { SidebarNav, type SidebarGroup } from "@/components/sidebar-nav";
import { UserMenu } from "@/components/user-menu";

const GRUPOS_POR_PAPEL: Record<SessaoUsuario["papel"], SidebarGroup[]> = {
  vendedor: [
    {
      label: "Vendas",
      links: [{ href: "/vendedor", label: "Meus pedidos", icon: ClipboardList, exact: true }],
    },
  ],
  juridico: [
    {
      label: "Jurídico",
      links: [{ href: "/juridico", label: "Contratos para revisão", icon: FileCheck2, exact: true }],
    },
  ],
  admin: [
    {
      label: "Administração",
      links: [
        { href: "/admin", label: "Aprovação", icon: CheckSquare, exact: true },
        { href: "/admin/usuarios", label: "Usuários", icon: Users, exact: true },
        { href: "/admin/configuracoes", label: "Configurações", icon: Settings, exact: true },
      ],
    },
  ],
};

// Layout com nav lateral fixa (porte de .ds-sidenav) + barra superior só com
// identidade do usuário — pensado pra crescer com mais seções/grupos na
// lateral conforme a plataforma ganha funcionalidades.
export function AppShell({ sessao, children }: { sessao: SessaoUsuario; children: ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <SidebarNav groups={GRUPOS_POR_PAPEL[sessao.papel]} />
      <div className="flex min-h-full flex-col pl-[230px]">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-card px-8">
          <UserMenu sessao={sessao} />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
