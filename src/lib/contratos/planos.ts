// Fonte da Cláusula Sexta (DO PREÇO E DAS LICENÇAS) — rótulos × valores por plano.
//
// NÃO é um porte direto de _docs/referencia-skill/references/{features,planos}.md.
// Esses dois arquivos divergem entre si para AGENTE (planos.md tem uma linha
// "Análise de Mercado" que não existe em contrato nenhum, e não lista as linhas
// "Número de Atletas"/"Atletas Agenciados"/"Agências" que features.md tem) — os
// dados abaixo foram reconciliados contra o texto real extraído dos 4
// contratos-modelo em _docs/contratos-modelo/*.docx (ver scripts/test-geracao.ts
// para a verificação de fidelidade). Onde um valor não pôde ser confirmado num
// contrato real (só temos Pro assinado para agente), está marcado como
// ASSUMIDO — revisar antes de gerar contrato de verdade nesses planos.

import { inteiroPorExtenso } from "./valorPorExtenso";

export type PlanoClube = "Starter" | "Basic" | "Essential" | "Elite" | "Multi-Club";
export type PlanoAgente = "Single" | "Starter" | "Growth" | "Pro" | "Prime";

export const PLANOS_CLUBE: PlanoClube[] = ["Starter", "Basic", "Essential", "Elite", "Multi-Club"];
export const PLANOS_AGENTE: PlanoAgente[] = ["Single", "Starter", "Growth", "Pro", "Prime"];

interface FeatureRow<P extends string> {
  /** Texto literal da coluna esquerda — não reescrever (references/features.md). */
  label: string;
  valores: Record<P, string>;
}

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
    valores: { Starter: "Não", Basic: "5", Essential: "até 10", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
  },
  {
    label:
      "Monitoramento (registro dos atletas monitorados para recebimento de atualizações, organizar em listas e registrar informações)",
    valores: {
      Starter: "Até 200",
      Basic: "Até 500",
      Essential: "até 1.000",
      Elite: "Ilimitado",
      "Multi-Club": "Ilimitado",
    },
  },
  {
    label: "Avaliações (registro de avaliações de atletas na plataforma, com relatórios em lista e gráficos)",
    valores: { Starter: "Não", Basic: "Até 1.000", Essential: "até 2.000", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
  },
  {
    label:
      "Mercado de Transferências (anunciar atletas sem contrato e visualizar necessidades dos clubes, podendo oferecer atletas e gerenciar negociações)",
    valores: { Starter: "Até 5", Basic: "Até 10", Essential: "até 20", Elite: "Ilimitado", "Multi-Club": "Ilimitado" },
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

// Confirmado contra ELENKO (Pro) — 15 linhas reais, não as 13 de planos.md.
// "Atletas Agenciados" e "Agências" só têm o valor Pro ("Sim") confirmado;
// os demais planos foram assumidos como "Sim" por analogia com o padrão
// uniforme da linha "Agências" em clube (ver nota do módulo). "Análise de
// Mercado" (planos.md) foi removida — não existe no contrato real.
export const FEATURES_AGENTE: FeatureRow<PlanoAgente>[] = [
  {
    label: "Número de Atletas",
    valores: { Single: "1", Starter: "Até 10", Growth: "Até 30", Pro: "Até 100", Prime: "Ilimitado" },
  },
  {
    label: "Atletas Agenciados (o nome e o contato por mensagem da agência fica vinculado ao perfil do atleta na plataforma)",
    valores: { Single: "Sim", Starter: "Sim", Growth: "Sim", Pro: "Sim", Prime: "Sim" }, // ASSUMIDO exceto Pro
  },
  {
    label:
      "Minha Agência (com gestão de agenciados, perfil com minutagem por idade, gestão de contratos, gestão de mercado)",
    valores: { Single: "Não", Starter: "Não", Growth: "Sim", Pro: "Sim", Prime: "Sim" },
  },
  {
    label: "Meu Feed (com alertas de registro no BID e FootNews)",
    valores: { Single: "Sim", Starter: "Sim", Growth: "Sim", Pro: "Sim", Prime: "Sim" },
  },
  {
    label: "Footlink Originals (conteúdo em vídeo com análise de mercados internacionais)",
    valores: { Single: "Não", Starter: "Sim", Growth: "Sim", Pro: "Sim", Prime: "Sim" },
  },
  {
    label:
      "Busca de Atletas (acesso a base de dados com aproximadamente 600 mil atletas, masculino e feminino, desde os 7 anos de idade)",
    valores: {
      Single: "Não",
      Starter: "Somente Masc. ou Fem.",
      Growth: "Sim",
      Pro: "Sim",
      Prime: "Sim",
    },
  },
  {
    label:
      "Perfil de Atletas (visualização de dados de contrato, carreira, desempenho, jogos com recursos para geração de relatórios e anotações sobre o atleta. Para atletas agenciados, pode publicar vídeos e relatórios para qualificar apresentação do atleta)",
    valores: {
      Single: "Somente do seu agenciado",
      Starter: "Sim",
      Growth: "Sim",
      Pro: "Sim",
      Prime: "Sim",
    },
  },
  {
    label:
      "Competições (visualizações de dados de competições, com o maior acervo de dados de competições de base organizadas por federações e CBF)",
    valores: { Single: "Não", Starter: "Sim", Growth: "Sim", Pro: "Sim", Prime: "Sim" },
  },
  {
    label: "Projetos (organização do workflow de análise de mercado com geração de relatórios em formato de time sombra)",
    valores: { Single: "Não", Starter: "Não", Growth: "1", Pro: "3", Prime: "Ilimitado" },
  },
  {
    label:
      "Monitoramento (registro dos atletas monitorados para recebimento de atualizações, organizar em listas e registrar informações)",
    valores: { Single: "Não", Starter: "Até 50", Growth: "200", Pro: "500", Prime: "Ilimitado" },
  },
  {
    label: "Avaliações (registro de avaliações de atletas na plataforma, com relatórios em lista e gráficos)",
    valores: { Single: "Não", Starter: "Não", Growth: "200", Pro: "1.000", Prime: "Ilimitado" },
  },
  {
    label:
      "Mercado de Transferências (anunciar atletas sem contrato e visualizar necessidades dos clubes, podendo oferecer atletas e gerenciar negociações)",
    valores: {
      Single: "Somente seu agenciado",
      Starter: "Até 2 anúncios",
      Growth: "Até 5 anúncios",
      Pro: "Até 10",
      Prime: "Ilimitado",
    },
  },
  {
    // Confirmado ELENKO: texto de agente é mais curto que o de clube.
    label: "Chat Integrado (ferramenta de comunicação com clubes e agentes)",
    valores: {
      Single: "Recebe e envia",
      Starter: "Recebe e envia",
      Growth: "Recebe e envia",
      Pro: "Recebe e envia",
      Prime: "Recebe e envia",
    },
  },
  {
    label: "Agências Listagem de agentes clientes do Footlink com seus atletas agenciados",
    valores: { Single: "Sim", Starter: "Sim", Growth: "Sim", Pro: "Sim", Prime: "Sim" }, // ASSUMIDO exceto Pro
  },
];

// Linha extra da Cláusula Sexta quando o produto inclui API — confirmado
// contra CORINTHIANS (clube). Não há contrato de agente com API para conferir
// se o texto muda; assumido igual (mesma plataforma, mesma feature).
export const FEATURE_API = {
  label:
    "Acesso à API do Footlink (Competições; Atletas monitorados; Atletas inseridos pela organização; Avaliações; Relatórios; Projetos)",
  valor: "Sim",
};

// Preço de licença adicional — só referência para a UI (o valor real do
// contrato SEMPRE vem do pedido de venda, nunca destas tabelas cheias).
export const PRECO_LICENCA_ADICIONAL_REFERENCIA: Record<PlanoClube | PlanoAgente, string> = {
  Starter: "R$ 365,00 (clube) / R$ 350,00 (agente) — varia por perfil",
  Basic: "R$ 575,00",
  Essential: "R$ 730,00 (1 licença) / R$ 630,00 (combo 3)",
  Elite: "R$ 330,00 (10) / R$ 300,00 (20) / R$ 275,00 (30)",
  "Multi-Club": "R$ 600,00 / R$ 500,00",
  Single: "R$ 300,00",
  Growth: "R$ 600,00 / R$ 550,00",
  Pro: "R$ 700,00 / R$ 650,00 / R$ 550,00",
  Prime: "R$ 750,00 / R$ 700,00 / R$ 650,00",
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
  const linhas = perfil === "clube" ? FEATURES_CLUBE : FEATURES_AGENTE;
  const planoValido = (perfil === "clube" ? PLANOS_CLUBE : PLANOS_AGENTE).includes(plano as never);
  if (!planoValido) {
    throw new Error(`Plano "${plano}" inválido para perfil "${perfil}".`);
  }

  const resultado: Array<[string, string]> = [
    ["Licenças Contempladas no Plano", montarLinhaLicencas(licencasPagas, licencasGratuitas, rotuloGratuita)],
  ];
  if (incluiApi) resultado.push([FEATURE_API.label, FEATURE_API.valor]);
  for (const linha of linhas) {
    resultado.push([linha.label, (linha.valores as Record<string, string>)[plano]]);
  }
  return resultado;
}
