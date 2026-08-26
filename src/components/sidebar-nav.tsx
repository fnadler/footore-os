"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Ativo também quando a rota atual é uma sub-rota deste link (ex.: /vendedor/novo). */
  exact?: boolean;
}

export interface SidebarGroup {
  label: string;
  links: SidebarLink[];
}

// Porte de .ds-sidenav (design_system.html) — fundo roxo quase-preto,
// indicador de item ativo com borda + fundo translúcido roxo.
export function SidebarNav({ groups }: { groups: SidebarGroup[] }) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[230px] shrink-0 flex-col overflow-y-auto border-r border-white/6 bg-[#09001a]">
      <div className="flex items-center border-b border-white/6 px-5 py-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático, sem otimização necessária */}
          <img src="/logo.svg" alt="Footlink" height={28} className="h-7 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 py-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-5 pt-4 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-white/25 uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5 px-3">
              {group.links.map((link) => {
                const ativo = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2 text-[13px] font-medium text-white/55 transition-all hover:bg-white/5 hover:text-white",
                        ativo && "border-primary bg-primary/20 font-bold text-white",
                      )}
                    >
                      <Icon className="size-[18px] shrink-0" strokeWidth={2} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
