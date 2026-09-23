// Motivos pré-definidos pra cancelar um pedido de venda — em ordem alfabética,
// "Outro" incluso (exige observação obrigatória, ver CancelarPedidoDialog).
export const MOTIVOS_CANCELAMENTO = [
  "Cliente desistiu da contratação",
  "Erro no cadastro do pedido",
  "Inadimplência do cliente",
  "Mudança de escopo do cliente",
  "Negociação comercial não avançou",
  "Orçamento insuficiente do cliente",
  "Outro",
  "Pedido duplicado",
  "Perda para concorrente",
  "Proposta comercial expirada",
] as const;

export type MotivoCancelamento = (typeof MOTIVOS_CANCELAMENTO)[number];
