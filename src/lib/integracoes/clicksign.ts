// Porta da Fase 3 (PROMPT.md 8) — stub que só transiciona o estado e
// registra a intenção. Implementar o envio real (envelope + signatários a
// partir de pedido_signatarios/pedido_representantes_footure/
// pedido_testemunhas_footure) quando a Fase 3 começar
// (developer.clicksign.com).
export interface ContratoParaAssinatura {
  contratoId: string;
  pedidoId: string;
  arquivoPath: string;
}

export async function enviarParaAssinatura(contrato: ContratoParaAssinatura): Promise<{ envelopeId: string | null }> {
  console.info("[stub] enviarParaAssinatura — Fase 3 ainda não implementada.", contrato);
  return { envelopeId: null };
}
