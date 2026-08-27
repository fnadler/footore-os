"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2, ImagePlus } from "lucide-react";
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
  nomeFantasia: string | null;
  apelido: string | null;
  cnpj: string;
  endereco: string;
  foroPreferencial: string;
  logoUrl: string | null;
}

export function ClienteForm({ cliente }: { cliente?: ClienteFormValores }) {
  const [estado, formAction, pendente] = useActionState(salvarClienteAction, ESTADO_INICIAL);
  const [tipo, setTipo] = useState<TipoCliente>(cliente?.tipo ?? "clube");
  const [razaoSocial, setRazaoSocial] = useState(cliente?.razaoSocial ?? "");
  const [nomeFantasia, setNomeFantasia] = useState(cliente?.nomeFantasia ?? "");
  const [apelido, setApelido] = useState(cliente?.apelido ?? "");
  const [cnpj, setCnpj] = useState(cliente?.cnpj ?? "");
  const [endereco, setEndereco] = useState(cliente?.endereco ?? "");
  const [foroPreferencial, setForoPreferencial] = useState(cliente?.foroPreferencial ?? "Porto Alegre/RS");
  const [previewImagem, setPreviewImagem] = useState<string | null>(cliente?.logoUrl ?? null);

  const payload = { clienteId: cliente?.id, tipo, razaoSocial, nomeFantasia, apelido, cnpj, endereco, foroPreferencial };

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />

      <BlocoFormulario numero={1} titulo="Dados do cliente" icon={Building2}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Perfil</Label>
              <Select value={tipo} onValueChange={(v) => setTipo((v as TipoCliente) ?? "clube")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clube">Clube</SelectItem>
                  <SelectItem value="agente">Agente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>CNPJ</Label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Razão social</Label>
              <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Nome fantasia</Label>
              <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
            </div>
          </div>
          {tipo === "clube" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Apelido</Label>
                <Input value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder="ex.: Timão" />
              </div>
            </div>
          )}
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

      <BlocoFormulario numero={2} titulo="Logo" descricao="Logo da agência ou escudo do clube." icon={ImagePlus}>
        <div className="flex items-center gap-4">
          {previewImagem ? (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) ou URL pública do Storage, sem otimização necessária
            <img src={previewImagem} alt="Prévia do logo" className="size-20 rounded-lg border border-border bg-muted object-contain p-1" />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground">
              <ImagePlus className="size-6" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            <Input
              type="file"
              name="imagem"
              accept="image/*"
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                if (arquivo) setPreviewImagem(URL.createObjectURL(arquivo));
              }}
            />
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
