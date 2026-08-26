"use client";

import Link from "next/link";
import { ChevronDown, UserRound, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sair } from "@/lib/auth/actions";
import type { SessaoUsuario } from "@/lib/auth/session";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function UserMenu({ sessao }: { sessao: SessaoUsuario }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg py-1.5 pr-2 pl-1.5 outline-none hover:bg-accent">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[13px] font-bold text-primary">
          {iniciais(sessao.nome)}
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="text-sm font-semibold text-foreground">{sessao.nome}</span>
          <span className="text-xs text-muted-foreground capitalize">{sessao.papel}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLinkItem render={<Link href="/perfil" />}>
          <UserRound className="size-4" />
          Ver perfil
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => sair()}>
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
