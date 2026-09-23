// Mapa de nomenclatura legada de planos de AGENTE — 3 camadas
// (_skill/references/planos.md, linha Scout set/2026): geração antiga
// (Brasil/Latam/Global) e intermediária (Single/Starter/Growth/Pro/Prime,
// os tiers usados antes da reestruturação Scout) apontam pro nome atual.
// Regra crítica: o sistema NUNCA converte sozinho — só sugere e exige
// confirmação explícita do vendedor antes de prosseguir.

export const MAPA_PLANO_LEGADO_AGENTE: Record<string, "Single" | "Basic" | "Essential" | "Prime" | "Elite"> = {
  Brasil: "Basic",
  Starter: "Basic",
  Single: "Single",
  Growth: "Essential",
  Latam: "Prime",
  Pro: "Prime",
  Global: "Elite",
  Prime: "Elite",
};

export function detectarPlanoLegado(perfil: "clube" | "agente", nomeDigitado: string) {
  if (perfil !== "agente") return null;
  const chave = Object.keys(MAPA_PLANO_LEGADO_AGENTE).find(
    (nome) => nome.toLowerCase() === nomeDigitado.trim().toLowerCase(),
  );
  if (!chave) return null;
  return { nomeOriginal: chave, planoSugerido: MAPA_PLANO_LEGADO_AGENTE[chave] };
}
