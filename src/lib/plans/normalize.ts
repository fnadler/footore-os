// Camada de normalização de nomenclatura de planos (PROMPT_NORMALIZACAO_PLANOS.md).
// `plan-registry.json` é a fonte única da verdade: o formulário do pedido grava a
// `key` canônica (nunca texto livre), e o gerador de contrato resolve a key pra
// imprimir `printed` e montar as features — a correspondência pedido↔contrato é
// estrutural, não depende de o texto ser digitado igual.
import registry from "./plan-registry.json";

export type PerfilPlano = "clube" | "agente";

export interface PlanoCanonico {
  key: string;
  canonical: string;
  printed: string;
}

export type NormalizeResult =
  | ({ status: "ok" } & PlanoCanonico)
  | { status: "needs_confirmation"; candidates: PlanoCanonico[]; reason: string }
  | { status: "unknown"; reason: string };

interface PlanoRegistroEntry {
  key: string;
  canonical: string;
  printed: string;
  aliases_exatos: string[];
  legado: string[];
  ambiguous_bare?: string[];
}

function planosDoPerfil(perfil: PerfilPlano): PlanoRegistroEntry[] {
  return (registry[perfil] as { plans: PlanoRegistroEntry[] }).plans;
}

function paraCanonico(p: PlanoRegistroEntry): PlanoCanonico {
  return { key: p.key, canonical: p.canonical, printed: p.printed };
}

/** minúsculas, trim, remove "plano footlink" e espaços extras — regra 3.1.1 do prompt. */
function sanitizar(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/plano footlink/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Todos os planos de um perfil, pra popular o `<Select>` (mostra `canonical`, grava `key`). */
export function listarPlanosCanonicos(perfil: PerfilPlano): PlanoCanonico[] {
  return planosDoPerfil(perfil).map(paraCanonico);
}

/** Resolve uma `key` já gravada no pedido de volta pro registro (contrato, telas de detalhe). */
export function buscarPlanoPorKey(key: string): PlanoCanonico | null {
  for (const perfil of ["clube", "agente"] as const) {
    const encontrado = planosDoPerfil(perfil).find((p) => p.key === key);
    if (encontrado) return paraCanonico(encontrado);
  }
  return null;
}

/** "Scout Essential" -> "Essential" — nome de tier puro, pra indexar FEATURES_CLUBE/FEATURES_AGENTE
 * (que continuam organizadas por tier, sem o prefixo Scout). */
export function tierDaKey(key: string): string | null {
  const plano = buscarPlanoPorKey(key);
  if (!plano) return null;
  return plano.canonical.replace(/^Scout\s+/i, "");
}

/**
 * Normaliza um nome de plano digitado livremente (ex.: nome de geração anterior)
 * pra uma key canônica — NUNCA converte em silêncio: nome de geração anterior ou
 * termo ambíguo sempre voltam como `needs_confirmation`, exigindo confirmação humana.
 */
export function normalizePlan(perfil: PerfilPlano, raw: string): NormalizeResult {
  const termo = sanitizar(raw);
  if (!termo) return { status: "unknown", reason: "Nome de plano vazio." };

  const planos = planosDoPerfil(perfil);

  // 1. Ambiguidade tem prioridade sobre match exato (ex.: "prime" pro agente
  // pode ser o Scout Prime atual OU o Prime legado, que virou Scout Elite).
  const ambiguosDireto = planos.filter((p) => p.ambiguous_bare?.includes(termo));
  if (ambiguosDireto.length > 0) {
    const candidatosKeys = new Set(ambiguosDireto.map((p) => p.key));
    for (const p of planos) {
      if (p.legado?.includes(termo)) candidatosKeys.add(p.key);
    }
    return {
      status: "needs_confirmation",
      candidates: planos.filter((p) => candidatosKeys.has(p.key)).map(paraCanonico),
      reason: `"${raw}" é ambíguo — pode corresponder a mais de um plano atual. Confirme qual.`,
    };
  }

  // 2. Match exato no nome atual.
  const exato = planos.find((p) => p.aliases_exatos.includes(termo));
  if (exato) return { status: "ok", ...paraCanonico(exato) };

  // 3. Match em nome de geração anterior — sugere, mas exige confirmação.
  const legado = planos.find((p) => p.legado?.includes(termo));
  if (legado) {
    return {
      status: "needs_confirmation",
      candidates: [paraCanonico(legado)],
      reason: `"${raw}" é um nome de plano de geração anterior.`,
    };
  }

  return { status: "unknown", reason: `Nome de plano "${raw}" não reconhecido para o perfil ${perfil}.` };
}
