// Mapa de nomenclatura legada de planos de AGENTE (references/planos.md).
// Regra crítica (PROMPT.md 6.1): o sistema NUNCA converte sozinho — só
// sugere e exige confirmação explícita do vendedor antes de prosseguir.

export const MAPA_PLANO_LEGADO_AGENTE: Record<string, "Starter" | "Pro" | "Prime"> = {
  Brasil: "Starter",
  Latam: "Pro",
  Global: "Prime",
};

export function detectarPlanoLegado(perfil: "clube" | "agente", nomeDigitado: string) {
  if (perfil !== "agente") return null;
  const chave = Object.keys(MAPA_PLANO_LEGADO_AGENTE).find(
    (nome) => nome.toLowerCase() === nomeDigitado.trim().toLowerCase(),
  );
  if (!chave) return null;
  return { nomeOriginal: chave, planoSugerido: MAPA_PLANO_LEGADO_AGENTE[chave] };
}
