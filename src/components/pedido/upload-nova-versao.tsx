"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { subirNovaVersaoAction, type SubirVersaoState } from "@/lib/pedidos/serverActions";

const ESTADO_INICIAL: SubirVersaoState = {};

export function UploadNovaVersao({ pedidoId }: { pedidoId: string }) {
  const [estado, formAction, pendente] = useActionState(subirNovaVersaoAction, ESTADO_INICIAL);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border p-3">
      <input type="hidden" name="pedidoId" value={pedidoId} />
      <Label>Subir nova versão do contrato (.docx editado)</Label>
      <Input type="file" name="arquivo" accept=".docx" required />
      <Textarea name="motivo" placeholder="O que mudou nessa versão? (opcional, mas ajuda no histórico)" rows={2} />
      {estado.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
      <Button type="submit" disabled={pendente} className="self-start">
        {pendente ? "Enviando…" : "Subir versão"}
      </Button>
    </form>
  );
}
