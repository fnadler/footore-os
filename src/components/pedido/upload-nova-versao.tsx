"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { subirNovaVersaoAction, type SubirVersaoState } from "@/lib/pedidos/serverActions";

const ESTADO_INICIAL: SubirVersaoState = {};

export function UploadNovaVersao({ pedidoId, onSucesso }: { pedidoId: string; onSucesso?: () => void }) {
  const [estado, formAction, pendente] = useActionState(subirNovaVersaoAction, ESTADO_INICIAL);

  useEffect(() => {
    if (estado.sucesso) {
      toast.success("Nova versão do contrato enviada.");
      onSucesso?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só reage a sucesso vindo do server action
  }, [estado.sucesso]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="pedidoId" value={pedidoId} />
      <div className="flex flex-col gap-2">
        <Label>Arquivo (.docx editado)</Label>
        <Input type="file" name="arquivo" accept=".docx" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label>O que mudou nessa versão? (opcional)</Label>
        <Textarea name="motivo" placeholder="Ajuda no histórico" rows={2} />
      </div>
      {estado.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Enviando…" : "Subir versão"}
        </Button>
      </DialogFooter>
    </form>
  );
}
