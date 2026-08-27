"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlocoFormulario } from "@/components/pedido/bloco-formulario";
import { salvarClienteAction, type SalvarClienteState } from "@/lib/clientes/serverActions";
import type { TipoCliente } from "@/lib/supabase/database.types";

const ESTADO_INICIAL: SalvarClienteState = {};

export interface ClienteFormValores {
  id: string;
  tipo: TipoCliente;
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  foroPreferencial: string;
}

export function ClienteForm({ cliente }: { cliente?: ClienteFormValores }) {
  const [estado, formAction, pendente] = useActionState(salvarClienteAction, ESTADO_INICIAL);
  const [tipo, setTipo] = useState<TipoCliente>(cliente?.tipo ?? "clube");
  const [razaoSocial, setRazaoSocial] = useState(cliente?.razaoSocial ?? "");
  const [cnpj, setCnpj] = useState(cliente?.cnpj ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [foroPreferencial, setForoPreferencial] = useState(cliente?.foroPreferencial ?? "Porto Alegre/RS");

  const payload = { clienteId: cliente?.id, tipo, razaoSocial, cnpj, endereco, foroPreferencial };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <BlocoFormulario numero={1} titulo="Dados do cliente" icon={Building2}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label>Perfil</Label>
            <Select value={tipo} onValueChange={(v) => setTipo((v as TipoCliente) ?? "clube")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clube">Clube</SelectItem>
                <SelectItem value="agente">Agente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Razão social</Label>
            <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>CNPJ</Label>
            <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Endereço</Label>
            <Textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Foro preferencial</Label>
            <Input value={foroPreferencial} onChange={(e) => setForoPreferencial(e.target.value)} required />
          </div>
        </div>
      </BlocoFormulario>

      {estado.erro && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{estado.erro}</p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" nativeButton={false} render={<Link href="/clientes">Cancelar</Link>} />
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
