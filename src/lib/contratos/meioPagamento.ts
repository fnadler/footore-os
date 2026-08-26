// Dado interno/CRM — não muda o texto do contrato (Cláusula Oitava sempre
// diz "boleto bancário", decisão registrada na conversa; nenhum dos 4
// contratos-modelo usa outro meio, então nenhum texto novo foi inventado).
import type { MeioPagamento } from "@/lib/supabase/database.types";

export const ROTULO_MEIO_PAGAMENTO: Record<MeioPagamento, string> = {
  boleto: "Boleto",
  pix: "PIX",
  transferencia_bancaria: "Transferência bancária",
  cartao_credito: "Cartão de crédito",
  cartao_debito: "Cartão de débito",
};
