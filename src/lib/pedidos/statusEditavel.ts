import type { StatusPedido } from "@/lib/supabase/database.types";

// Vendedor pode seguir editando o pedido em qualquer um desses status — depois
// que o contrato é liberado para assinatura (PRONTO_PARA_ASSINATURA em diante),
// só volta a ficar editável se a assinatura for cancelada (ver cancelarAssinaturaAction).
export const STATUS_EDITAVEIS: StatusPedido[] = ["rascunho", "em_aprovacao", "aprovado", "em_revisao_juridica"];

export function pedidoEhEditavel(status: StatusPedido): boolean {
  return STATUS_EDITAVEIS.includes(status);
}
