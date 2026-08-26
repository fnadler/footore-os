"use client";

import { useState, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { alterarPapelUsuario } from "@/lib/usuarios/serverActions";
import type { PapelUsuario } from "@/lib/supabase/database.types";

export function UsuarioPapelSelect({ userId, papelAtual }: { userId: string; papelAtual: PapelUsuario }) {
  const [papel, setPapel] = useState(papelAtual);
  const [pendente, iniciar] = useTransition();

  return (
    <Select
      value={papel}
      onValueChange={(v) => {
        if (!v) return;
        const novoPapel = v as PapelUsuario;
        setPapel(novoPapel);
        iniciar(() => alterarPapelUsuario(userId, novoPapel));
      }}
    >
      <SelectTrigger className="w-36" disabled={pendente}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vendedor">Vendedor</SelectItem>
        <SelectItem value="juridico">Jurídico</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
