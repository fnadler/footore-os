// Textos-padrão de multa por tipo — "3 mensalidades" confirmado literalmente
// contra PANTANAL_teste.docx e ELENKO_teste.docx (linha Scout, set/2026).
// "Retenção total" confirmado no BRAGANTINO. "2 mensalidades" segue por
// analogia ao texto de "3 mensalidades" (só troca o numeral).
import type { MultaTipo } from "@/lib/supabase/database.types";

export const TEXTO_MULTA_PADRAO: Record<Exclude<MultaTipo, "customizado">, string> = {
  sem_multa:
    "O contrato poderá ser resilido imotivadamente pelas partes, a qualquer tempo, mediante aviso prévio de 30 (trinta) dias, sem que seja devida qualquer indenização ou multa contratual.",
  duas_mensalidades:
    "O cancelamento antecipado do contrato pelo CONTRATANTE, ainda que com aviso prévio de 30 (trinta) dias, implicará a retenção dos valores já recebidos pela CONTRATADA, acrescido de multa contratual referentes à soma dos valores de 02 (duas) mensalidades. O cancelamento antecipado por parte da CONTRATADA ensejará a restituição proporcional dos valores recebidos relativos aos meses vincendos eventualmente não usufruídos pelo CONTRATANTE.",
  tres_mensalidades:
    "O cancelamento antecipado do contrato pelo CONTRATANTE, ainda que com aviso prévio de 30 (trinta) dias, implicará a retenção dos valores já recebidos pela CONTRATADA, acrescido de multa contratual referentes à soma dos valores de 03 (três) mensalidades. O cancelamento antecipado por parte da CONTRATADA ensejará a restituição proporcional dos valores recebidos relativos aos meses vincendos eventualmente não usufruídos pelo CONTRATANTE.",
  retencao_total:
    "O cancelamento antecipado pela CONTRATANTE implicará a retenção dos valores já recebidos pela CONTRATADA a título de multa contratual. O cancelamento antecipado por parte da CONTRATADA ensejará a restituição proporcional dos valores recebidos relativos aos meses vincendos não usufruídos pela CONTRATANTE.",
};

export const ROTULO_MULTA: Record<MultaTipo, string> = {
  sem_multa: "Sem multa",
  duas_mensalidades: "2 mensalidades",
  tres_mensalidades: "3 mensalidades (default parcelado)",
  retencao_total: "Retenção total (default à vista)",
  customizado: "Texto customizado",
};

export function textoMultaDefault(tipo: MultaTipo): string {
  return tipo === "customizado" ? "" : TEXTO_MULTA_PADRAO[tipo];
}
