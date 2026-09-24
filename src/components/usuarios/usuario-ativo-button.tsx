"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { definirAtivoUsuario } from "@/lib/usuarios/serverActions";

export function UsuarioAtivoButton({ userId, ativo }: { userId: string; ativo: boolean }) {
  const [pendente, iniciar] = useTransition();
  const router = useRouter();

  function alternar() {
    iniciar(async () => {
      try {
        await definirAtivoUsuario(userId, !ativo);
        toast.success(ativo ? "Usuário inativado." : "Usuário ativado.");
        router.refresh();
      } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : "Falha ao atualizar usuário.");
      }
    });
  }

  return (
    <Button type="button" variant={ativo ? "destructive" : "secondary"} size="sm" disabled={pendente} onClick={alternar}>
      {ativo ? <UserX className="size-4" /> : <UserCheck className="size-4" />}
      {ativo ? "Inativar" : "Ativar"}
    </Button>
  );
}
