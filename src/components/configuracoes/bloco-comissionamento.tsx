"use client";

import { useState, useTransition, type FocusEvent } from "react";
import { toast } from "sonner";
import { Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { salvarConfiguracaoComissionamento } from "@/lib/comissao/serverActions";

// Campos numéricos em type="text" + inputMode — type="number" não suporta
// .select() de forma confiável entre navegadores (mesmo padrão do
// pedido-form.tsx, ver comentário lá).
function selecionarConteudo(e: FocusEvent<HTMLInputElement>) {
  e.target.select();
}

function paraNumero(texto: string): number {
  const n = Number(texto);
  return Number.isNaN(n) ? 0 : n;
}

interface Props {
  percentualImposto: number;
  percentualComissaoTotal: number;
  percentualComissaoSdr: number;
  percentualComissaoCloser: number;
}

export function BlocoComissionamento({
  percentualImposto,
  percentualComissaoTotal,
  percentualComissaoSdr,
  percentualComissaoCloser,
}: Props) {
  const [imposto, setImposto] = useState(percentualImposto);
  const [comissaoTotal, setComissaoTotal] = useState(percentualComissaoTotal);
  const [comissaoSdr, setComissaoSdr] = useState(percentualComissaoSdr);
  const [comissaoCloser, setComissaoCloser] = useState(percentualComissaoCloser);
  const [pendente, iniciar] = useTransition();

  function salvar() {
    iniciar(async () => {
      try {
        await salvarConfiguracaoComissionamento({
          percentualImposto: imposto,
          percentualComissaoTotal: comissaoTotal,
          percentualComissaoSdr: comissaoSdr,
          percentualComissaoCloser: comissaoCloser,
        });
        toast.success("Configuração de comissionamento salva.");
      } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : "Falha ao salvar.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary" strokeWidth={2} />
          <CardTitle>Comissionamento</CardTitle>
        </div>
        <CardDescription>
          Parâmetros globais usados pra calcular a comissão de SDR e Closer sobre os pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label>% de imposto</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={imposto}
              onChange={(e) => setImposto(paraNumero(e.target.value))}
              onFocus={selecionarConteudo}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>% de comissão total</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={comissaoTotal}
              onChange={(e) => setComissaoTotal(paraNumero(e.target.value))}
              onFocus={selecionarConteudo}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>% comissão SDR</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={comissaoSdr}
              onChange={(e) => setComissaoSdr(paraNumero(e.target.value))}
              onFocus={selecionarConteudo}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>% comissão Closer</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={comissaoCloser}
              onChange={(e) => setComissaoCloser(paraNumero(e.target.value))}
              onFocus={selecionarConteudo}
            />
          </div>
        </div>
        <Button className="mt-4" size="sm" disabled={pendente} onClick={salvar}>
          {pendente ? "Salvando…" : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
}
