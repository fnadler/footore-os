// Porta da Fase 2 (PROMPT.md 7.1) — stub documentado, NÃO chama a API do
// Bling ainda. Mapeamento de campos esboçado; implementar OAuth 2.0 +
// POST /pedidos/vendas quando a Fase 2 começar (developer.bling.com.br).
import type { Database } from "@/lib/supabase/database.types";

type PedidoRow = Database["public"]["Tables"]["pedidos"]["Row"];

export interface PedidoVendaBling {
  numero?: string;
  data: string;
  itens: Array<{ descricao: string; quantidade: number; valor: number }>;
  observacoes?: string;
}

/**
 * Mapeia um pedido do sistema para o payload de POST /pedidos/vendas do
 * Bling — chamado quando o pedido chega a APROVADO (PROMPT.md 7.1).
 * NÃO chama a API ainda: retorna o payload esboçado e loga a intenção.
 */
export function montarPayloadBling(pedido: PedidoRow): PedidoVendaBling {
  return {
    data: pedido.criado_em.slice(0, 10),
    itens: [
      {
        descricao: `Assinatura Footlink — Plano ${pedido.plano}`,
        quantidade: pedido.licencas_pagas,
        valor: pedido.valor_mensal,
      },
      ...(pedido.produtos.includes("api") && pedido.valor_mensal_api != null
        ? [{ descricao: "API Footlink", quantidade: 1, valor: pedido.valor_mensal_api }]
        : []),
    ],
    observacoes: pedido.condicao_especial ?? undefined,
  };
}

/** Stub — Fase 2. Não chama a API do Bling; só registra a intenção. */
export async function criarPedidoBling(pedido: PedidoRow): Promise<{ blingPedidoId: string | null }> {
  const payload = montarPayloadBling(pedido);
  console.info("[stub] criarPedidoBling — Fase 2 ainda não implementada. Payload que seria enviado:", payload);
  return { blingPedidoId: null };
}
