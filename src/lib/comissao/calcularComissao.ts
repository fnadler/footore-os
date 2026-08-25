// Porta da Fase 2 (PROMPT.md 7.2) — função pura e testável, sem uso em
// produção ainda (a tela de comissão do vendedor fica fora da Fase 1).
import type { Database } from "@/lib/supabase/database.types";

type PedidoRow = Database["public"]["Tables"]["pedidos"]["Row"];
type RegraComissao = Database["public"]["Tables"]["regras_comissao"]["Row"];

// "Parâmetro provisório, confirmar antes de produção" (PROMPT.md 7.2).
export const REGRA_DEFAULT_PROVISORIA: Pick<RegraComissao, "percentual" | "base_calculo" | "escopo_tipo"> = {
  percentual: 10,
  base_calculo: "valor_total",
  escopo_tipo: "global",
};

export interface ResultadoComissao {
  regraId: string | null;
  base: number;
  percentual: number;
  valorCalculado: number;
}

/**
 * Escolhe a regra vigente aplicável ao pedido (mais específica primeiro:
 * por_pagamento > por_plano > por_vendedor > global) dentre as regras ativas,
 * e calcula o valor. Sem regra nenhuma cadastrada, cai no default provisório.
 * `valorRecebido` só é necessário se alguma regra usar base_calculo=
 * 'valor_recebido' — Fase 2 é controle manual (PROMPT.md 7.2), não há
 * rastreio automático de recebimento ainda.
 */
export function calcularComissao(
  pedido: Pick<PedidoRow, "valor_total" | "vendedor_id" | "plano" | "forma_pagamento">,
  regrasAtivas: RegraComissao[],
  valorRecebido?: number,
): ResultadoComissao {
  const candidatas = regrasAtivas.filter((r) => {
    if (!r.ativo) return false;
    switch (r.escopo_tipo) {
      case "por_pagamento":
        return r.escopo_valor === pedido.forma_pagamento;
      case "por_plano":
        return r.escopo_valor === pedido.plano;
      case "por_vendedor":
        return r.escopo_valor === pedido.vendedor_id;
      case "global":
        return true;
    }
  });

  const prioridade: Record<RegraComissao["escopo_tipo"], number> = {
    por_pagamento: 3,
    por_plano: 2,
    por_vendedor: 1,
    global: 0,
  };
  candidatas.sort((a, b) => prioridade[b.escopo_tipo] - prioridade[a.escopo_tipo]);
  const regra = candidatas[0];

  const percentual = regra?.percentual ?? REGRA_DEFAULT_PROVISORIA.percentual;
  const baseCalculo = regra?.base_calculo ?? REGRA_DEFAULT_PROVISORIA.base_calculo;
  const base = baseCalculo === "valor_recebido" ? (valorRecebido ?? 0) : pedido.valor_total;

  return {
    regraId: regra?.id ?? null,
    base,
    percentual,
    valorCalculado: Number(((base * percentual) / 100).toFixed(2)),
  };
}
