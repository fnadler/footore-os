// Validações da seção 6.2 do PROMPT.md — alertas revisáveis, não travas
// automáticas (com a única exceção dura documentada em podeLiberarParaAssinatura,
// necessidade técnica de e-mail pra assinatura, não julgamento de negócio).
// Puro e sem I/O — usado tanto no formulário (client) quanto nas Server
// Actions de aprovação/liberação (server, fonte da verdade).
import type { Signatario } from "@/lib/contratos/gerarContrato";

export type CodigoAlerta =
  | "dados_cadastrais"
  | "representante_ausente"
  | "plano_legado"
  | "valor_incoerente"
  | "licencas_gratuitas"
  | "foro_divergente";

export interface AlertaPedido {
  codigo: CodigoAlerta;
  mensagem: string;
}

export const FORO_DEFAULT = "Porto Alegre - RS";

export interface DadosParaAlertas {
  valorMensal: number;
  valorTotal: number;
  formaPagamento: "avista" | "parcelado";
  numeroParcelas?: number;
  licencasGratuitas: number;
  foro: string;
  temRepresentanteLegal: boolean;
  planoLegadoDetectado: boolean;
  planoLegadoNomeOriginal?: string | null;
  planoLegadoConfirmado: boolean;
}

/**
 * Alertas revisáveis (não bloqueiam o envio/aprovação por si só) — a UI
 * decide o que fazer com cada um (destacar, pedir ciência, etc.).
 */
export function gerarAlertas(dados: DadosParaAlertas): AlertaPedido[] {
  const alertas: AlertaPedido[] = [];

  // Item 1 — lembrete permanente, não condicional: o pedido é rascunho até
  // ser revisado, e o dado do cliente historicamente diverge do correto.
  alertas.push({
    codigo: "dados_cadastrais",
    mensagem: "Confira razão social, CNPJ e endereço do cliente antes de aprovar — esses dados vão para o contrato.",
  });

  if (!dados.temRepresentanteLegal) {
    alertas.push({
      codigo: "representante_ausente",
      mensagem:
        "Nenhum representante legal do cliente cadastrado ainda. O pedido pode seguir para aprovação, mas não poderá ser liberado para assinatura sem isso.",
    });
  }

  if (dados.planoLegadoDetectado && !dados.planoLegadoConfirmado) {
    alertas.push({
      codigo: "plano_legado",
      mensagem: `Nome de plano legado detectado ("${dados.planoLegadoNomeOriginal}"). Confirme o plano novo correspondente antes de prosseguir — o contrato sempre usa o nome novo.`,
    });
  }

  if (dados.formaPagamento === "parcelado") {
    const numeroParcelas = dados.numeroParcelas ?? 12;
    const esperado = dados.valorMensal * numeroParcelas;
    const divergeu = Math.abs(esperado - dados.valorTotal) > 0.01;
    if (divergeu) {
      alertas.push({
        codigo: "valor_incoerente",
        mensagem: `Valor da parcela × ${numeroParcelas} (${esperado.toFixed(2)}) não bate com o valor total (${dados.valorTotal.toFixed(2)}). Pode ser desconto, licença grátis ou condição especial — confirme antes de aprovar; o sistema não recalcula sozinho.`,
      });
    }
  }

  if (dados.licencasGratuitas > 0) {
    alertas.push({
      codigo: "licencas_gratuitas",
      mensagem: `${dados.licencasGratuitas} licença(s) gratuita(s) será(ão) refletida(s) no texto "Licenças Contempladas" do contrato.`,
    });
  }

  if (dados.foro.trim() !== FORO_DEFAULT) {
    alertas.push({
      codigo: "foro_divergente",
      mensagem: `Foro "${dados.foro}" diverge do padrão (${FORO_DEFAULT}). Confirme que o cliente realmente impôs esse foro.`,
    });
  }

  return alertas;
}

/**
 * Trava dura (seção 6.2 item 7 / seção 4): única validação que efetivamente
 * bloqueia — sem representante legal com e-mail e CPF, não há como montar o
 * envelope de assinatura (Fase 3). Chamar antes de EM_REVISAO_JURIDICA ->
 * PRONTO_PARA_ASSINATURA.
 */
export function podeLiberarParaAssinatura(
  representantesLegais: Signatario[],
): { ok: true } | { ok: false; motivo: string } {
  const valido = representantesLegais.find((r) => r.nomeCompleto.trim() && r.email.trim() && r.cpf.trim());
  if (!valido) {
    return {
      ok: false,
      motivo:
        "É preciso pelo menos um representante legal do cliente com nome, e-mail e CPF preenchidos para liberar o pedido para assinatura.",
    };
  }
  return { ok: true };
}
