// Fonte da Cláusula Sexta (DO PREÇO E DAS LICENÇAS) — rótulos × valores por plano.
//
// Reconciliado contra `_skill/references/{features,planos}.md` (pacote de referência
// "footlink-contract", linha Scout — set/2026). `pedidos.plano` guarda a KEY canônica
// do registro (src/lib/plans/plan-registry.json e normalize.ts) — o "tier" puro usado
// aqui pra indexar as tabelas de features é resolvido a partir da key (ver `tierDaKey`).
//
// FEATURES_CLUBE já era fiel aos 4 contratos-modelo reais (GOIAS/BRAGANTINO)
// verificados na Fase 1 — os rótulos e tiers não mudaram na atualização Scout.
// FEATURES_AGENTE foi REESTRUTURADA: a matriz técnica antiga (Single/Starter/
// Growth/Pro/Prime, lista plana) foi substituída pelo descritivo agrupado em 4
// seções (Capacidade/Minha Agência/Base de Atletas/Mercado) do pacote novo —
// os tiers antigos Starter/Growth/Pro não existem mais (ver `legado.ts` pro
// mapeamento de nomenclatura antiga).

import { inteiroPorExtenso } from "./valorPorExtenso";

export type PlanoClube = "Starter" | "Basic" | "Essential" | "Elite" | "Multi-Club";
export type PlanoAgente = "Single" | "Basic" | "Essential" | "Prime" | "Elite";

export const PLANOS_CLUBE: PlanoClube[] = ["Starter", "Basic", "Essential", "Elite", "Multi-Club"];
export const PLANOS_AGENTE: PlanoAgente[] = ["Single", "Basic", "Essential", "Prime", "Elite"];

interface FeatureRow<P extends string> {
  /** Texto literal da coluna esquerda — não reescrever (references/features.md). */
  label: string;
  valores: Record<P, string>;
}

/** Linha de seção (subcabeçalho ocupando as duas colunas da tabela) — convenção
 * do gerador: `['#', 'NOME DA SEÇÃO']` em vez de um par [rótulo, valor] normal. */
type LinhaFeature = [string, string];
const SECAO = (nome: string): LinhaFeature => ["#", nome];

// Confirmado contra GOIAS (Essential) e BRAGANTINO (Elite, "Ilimitado" nas 4
// linhas de limite). Basic/Starter/Multi-Club vêm de planos.md sem contrato
// assinado próprio para conferir — mesmo risco "ASSUMIDO" citado acima.
export const FEATURES_CLUBE: FeatureRow<PlanoClube>[] = [
  {
    label: "Meu Clube (com gestão de elenco, perfil com minutagem por idade, gestão de contratos, gestão de mercado)",
    valores: { Starter: "Não", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label: "Meu Feed (com alertas de registro no BID e FootNews)",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label: "Footlink Originals (conteúdo em vídeo com análise de mercados internacionais)",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label:
      "Busca de Atletas (acesso a base de dados com aproximadamente 600 mil atletas, masculino e feminino, desde os 7 anos de idade)",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label:
      "Perfil de Atletas (visualização de dados de contrato, carreira, desempenho, jogos com recursos para geração de relatórios, registro de avaliações e anotações sobre o atleta. Para atletas do clube, pode publicar vídeos e relatórios para qualificar apresentação do atleta)",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label:
      "Competições (visualizações de dados de competições, com o maior acervo de dados de competições de base organizadas por federações e CBF)",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
  {
    label: "Projetos (organização do workflow de análise de mercado com geração de relatórios em formato de time sombra)",
    // Basic confirmado contra PANTANAL_teste.docx ("até 05") — antes ASSUMIDO como "5".
    valores: { Starter: "Não", Basic: "até 05", Essential: "até 10", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
  },
  {
    label:
      "Monitoramento (registro dos atletas monitorados para recebimento de atualizações, organizar em listas e registrar informações)",
    // Basic confirmado contra PANTANAL_teste.docx ("até 500", minúsculo) — antes ASSUMIDO como "Até 500".
    valores: {
      Starter: "Até 200",
      Basic: "até 500",
      Essential: "até 1.000",
      Elite: "Ilimitado",
      "Multi-Club": "Ilimitado",
    },
  },
  {
    label: "Avaliações (registro de avaliações de atletas na plataforma, com relatórios em lista e gráficos)",
    // Basic confirmado contra PANTANAL_teste.docx ("até 1.000", minúsculo) — antes ASSUMIDO como "Até 1.000".
    valores: { Starter: "Não", Basic: "até 1.000", Essential: "até 2.000", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
  },
  {
    label:
      "Mercado de Transferências (anunciar atletas sem contrato e visualizar necessidades dos clubes, podendo oferecer atletas e gerenciar negociações)",
    // Basic confirmado contra PANTANAL_teste.docx ("até 10", minúsculo) — antes ASSUMIDO como "Até 10".
    valores: { Starter: "Até 5", Basic: "até 10", Essential: "até 20", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
  },
  {
    // Confirmado GOIAS/BRAGANTINO: texto de clube é mais longo que o de agente.
    label: "Chat Integrado (ferramenta de comunicação com clubes e agentes)",
    valores: {
      Starter: "Recebe e envia mensagens para clubes clientes Footlink",
      Basic: "Recebe e envia mensagens para clubes clientes Footlink",
      Essential: "Recebe e envia mensagens para clubes clientes Footlink",
      Elite: "Recebe e envia mensagens para clubes clientes Footlink",
      "Multi-Club": "Recebe e envia mensagens para clubes clientes Footlink",
    },
  },
  {
    label: "Agências Listagem de agentes clientes do Footlink com seus atletas agenciados",
    valores: { Starter: "Sim", Basic: "Sim", Essential: "Sim", Elite: "Sim", "Multi-Club": "Sim" },
  },
];

// Descritivo agrupado (set/2026), substitui a matriz técnica antiga (Elenko/TFA,
// ~30 linhas S/N) — ver _skill/references/{features,planos}.md. Sem contrato
// real ainda gerado sob essa estrutura pra conferir linha a linha (o gabarito
// de validação `_validacao/ELENKO_teste.docx` é a primeira conferência real).
export const FEATURES_AGENTE: LinhaFeature[] = [
  SECAO("CAPACIDADE"),
  ["Atletas agenciados", ""],
  ["Monitoramento de atletas", ""],
  ["Projetos com time sombra", ""],
  ["Avaliações de atletas", ""],
  ["Anúncios simultâneos de atletas sem contrato", ""],
  SECAO("MINHA AGÊNCIA"),
  ["Gestão da carteira e análise de minutagem", ""],
  ["Gestão de contratos", ""],
  ["Workflow de gestão de mercado", ""],
  SECAO("BASE DE ATLETAS"),
  ["Busca na base completa", ""],
  ["Modalidades e categorias", ""],
  ["Perfil, desempenho, contratos, avaliações e relatórios", ""],
  ["Competições de base brasileiras", ""],
  ["Análise de mercado", ""],
  SECAO("MERCADO"),
  ["Mercado de transferências e janelas", ""],
  ["Ver perfis de atletas desejados pelos clubes", ""],
  ["Footlink Originals", ""],
];

// Valores por tier de cada linha de FEATURES_AGENTE (na mesma ordem, pulando
// as linhas de seção) — separado da lista acima só por legibilidade da tabela
// fonte em planos.md; `montarFeatures` combina os dois na montagem.
const VALORES_FEATURES_AGENTE: Record<PlanoAgente, string>[] = [
  { Single: "1", Basic: "10", Essential: "30", Prime: "100", Elite: "Ilimitado" },
  { Single: "Não incluído", Basic: "50", Essential: "200", Prime: "500", Elite: "Ilimitado" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "1", Prime: "3", Elite: "Ilimitado" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "200", Prime: "1.000", Elite: "Ilimitado" },
  { Single: "Só o seu agenciado", Basic: "2", Essential: "5", Prime: "10", Elite: "Ilimitado" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Sim", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Masculino ou feminino", Essential: "Todas", Prime: "Todas", Elite: "Todas" },
  {
    Single: "Só o seu agenciado",
    Basic: "Toda a base",
    Essential: "Toda a base",
    Prime: "Toda a base",
    Elite: "Toda a base",
  },
  { Single: "Não incluído", Basic: "Sim", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Sim", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Sim", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Não incluído", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
  { Single: "Não incluído", Basic: "Sim", Essential: "Sim", Prime: "Sim", Elite: "Sim" },
];

// Linha extra da Cláusula Sexta quando o produto inclui API — confirmado
// contra CORINTHIANS (clube). Não há contrato de agente com API para conferir
// se o texto muda; assumido igual (mesma plataforma, mesma feature).
export const FEATURE_API = {
  label:
    "Acesso à API do Footlink (Competições; Atletas monitorados; Atletas inseridos pela organização; Avaliações; Relatórios; Projetos)",
  valor: "Sim",
};

// "um"/"dois" -> "uma"/"duas" (licença é substantivo feminino). Confirmado
// contra BRAGANTINO: "20 (vinte) licenças + 01 (uma) licença Feminino
// gratuita" — nenhum dos 4 contratos-modelo tem gratuitas>1 pra conferir a
// pluralização de "licença(s) {rótulo} gratuita(s)" nesse caso; ASSUMIDO.
function extensoFeminino(n: number): string {
  return inteiroPorExtenso(n).replace(/\bum\b/g, "uma").replace(/\bdois\b/g, "duas");
}

/**
 * "03 (três)" (sem gratuitas) ou "20 (vinte) licenças + 01 (uma) licença
 * Feminino gratuita" (com gratuitas) — confirmado contra GOIAS/ELENKO/
 * CORINTHIANS (sem gratuitas) e BRAGANTINO (com). `rotuloGratuita` não tem
 * campo próprio no modelo de dados hoje (PROMPT.md só tem
 * `licencas_gratuitas` numérico) — default "Feminino" por ser o único caso
 * real observado; revisar se aparecer outro tipo de licença gratuita.
 */
export function montarLinhaLicencas(pagas: number, gratuitas: number, rotuloGratuita = "Feminino"): string {
  const pagasTexto = `${String(pagas).padStart(2, "0")} (${extensoFeminino(pagas)})`;
  if (gratuitas === 0) return pagasTexto;
  const gratuitasTexto = `${String(gratuitas).padStart(2, "0")} (${extensoFeminino(gratuitas)})`;
  return `${pagasTexto} licenças + ${gratuitasTexto} licença ${rotuloGratuita} gratuita`;
}

export function montarFeatures(
  perfil: "clube" | "agente",
  plano: string,
  incluiApi: boolean,
  licencasPagas: number,
  licencasGratuitas: number,
  rotuloGratuita?: string,
): Array<[string, string]> {
  const planoValido = (perfil === "clube" ? PLANOS_CLUBE : PLANOS_AGENTE).includes(plano as never);
  if (!planoValido) {
    throw new Error(`Plano "${plano}" inválido para perfil "${perfil}".`);
  }

  const resultado: Array<[string, string]> = [
    ["Licenças Contempladas no Plano", montarLinhaLicencas(licencasPagas, licencasGratuitas, rotuloGratuita)],
  ];
  if (incluiApi) resultado.push([FEATURE_API.label, FEATURE_API.valor]);

  if (perfil === "clube") {
    for (const linha of FEATURES_CLUBE) {
      resultado.push([linha.label, (linha.valores as Record<string, string>)[plano]]);
    }
  } else {
    let indiceValor = 0;
    for (const [label, secao] of FEATURES_AGENTE) {
      if (label === "#") {
        resultado.push(["#", secao]);
        continue;
      }
      const valores = VALORES_FEATURES_AGENTE[indiceValor];
      indiceValor += 1;
      resultado.push([label, (valores as Record<string, string>)[plano]]);
    }
  }

  return resultado;
}
