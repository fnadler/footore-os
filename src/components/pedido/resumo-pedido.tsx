import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}

export function ResumoPedido({
  clienteNome,
  perfil,
  plano,
  valorTotal,
  qtdAlertas,
  pendente,
}: {
  clienteNome: string;
  perfil: "clube" | "agente";
  plano: string;
  valorTotal: number;
  qtdAlertas: number;
  pendente: boolean;
}) {
  return (
    <div className="sticky top-24 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div>
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Resumo do pedido</p>
        <p className="mt-2 text-base font-bold text-foreground">{clienteNome || "Cliente não selecionado"}</p>
        <p className="text-sm text-muted-foreground capitalize">
          {perfil}
          {plano ? ` · ${plano}` : ""}
        </p>
      </div>

      <Separator />

      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Valor total</span>
        <span className="text-lg font-bold text-foreground">{formatarMoeda(valorTotal)}</span>
      </div>

      {qtdAlertas > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-[#fbe0c9] px-3 py-2 text-sm font-medium text-[#ce9232]">
          <AlertTriangle className="size-4 shrink-0" />
          {qtdAlertas} {qtdAlertas === 1 ? "ponto" : "pontos"} para revisar
        </div>
      )}

      <Button type="submit" disabled={pendente} className="w-full">
        {pendente ? "Salvando…" : "Salvar rascunho"}
      </Button>
    </div>
  );
}
