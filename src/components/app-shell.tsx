import type { ReactNode } from "react";
import type { SessaoUsuario } from "@/lib/auth/session";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserMenu } from "@/components/user-menu";

// Layout com nav lateral fixa (porte de .ds-sidenav) + barra superior só com
// identidade do usuário — pensado pra crescer com mais seções/grupos na
// lateral conforme a plataforma ganha funcionalidades.
export function AppShell({ sessao, children }: { sessao: SessaoUsuario; children: ReactNode }) {
  return (
    <div className="min-h-full bg-background">
      <SidebarNav papel={sessao.papel} />
      <div className="flex min-h-full flex-col pl-[230px]">
        <header className="flex h-16 shrink-0 items-center justify-end border-b border-border bg-card px-8">
          <UserMenu sessao={sessao} />
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
