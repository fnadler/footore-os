import { Sparkles } from "lucide-react";
import { AcoesPedido } from "./acoes-pedido";
import { acaoPendente } from "@/lib/pedidos/acaoPendente";
import type { PapelUsuario, StatusPedido } from "@/lib/supabase/database.types";

// Só aparece quando o papel logado tem algo a fazer no status atual — o
// destaque visual (fundo com tint da marca) é justamente pra chamar atenção
// pra isso em vez de deixar os botões soltos no meio da página.
export function ProximaAcao({
  pedidoId,
  status,
  papel,
  donoDoRascunho,
}: {
  pedidoId: string;
  status: StatusPedido;
  papel: PapelUsuario;
  donoDoRascunho: boolean;
}) {
  const acao = acaoPendente(status, papel, donoDoRascunho);
  if (!acao) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="size-[18px]" strokeWidth={2} />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{acao.titulo}</p>
          <p className="text-sm text-muted-foreground">{acao.descricao}</p>
        </div>
      </div>
      <div className="shrink-0 pl-12 sm:pl-0">
        <AcoesPedido pedidoId={pedidoId} status={status} papel={papel} donoDoRascunho={donoDoRascunho} />
      </div>
    </div>
  );
}
