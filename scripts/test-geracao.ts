// Teste de fidelidade do gerador de contrato — roda sem Supabase.
//
// Gera os 4 casos reais descritos no PROMPT.md (seção 10) com o gerador
// portado (src/lib/contratos/gerarContrato.ts) e compara, linha a linha
// (texto normalizado), com o texto extraído dos 4 .docx-modelo em
// _docs/contratos-modelo/. Diferenças são impressas para revisão manual —
// isso não é um gate automático de CI, é a ferramenta que valida a Fase 1
// sem precisar de um projeto Supabase conectado (PROMPT.md seção 9, passo 6).
//
// Uso: npx tsx scripts/test-geracao.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import mammoth from "mammoth";
import { gerarContratoBuffer, type DadosContrato } from "../src/lib/contratos/gerarContrato";
import { montarFeatures } from "../src/lib/contratos/planos";
import { gerarParcelas } from "../src/lib/contratos/parcelas";
import { valorFormatadoComExtenso } from "../src/lib/contratos/valorPorExtenso";

const MODELOS_DIR = path.join(process.cwd(), "_docs/contratos-modelo");

interface CasoTeste {
  nome: string;
  docxModelo: string;
  dados: DadosContrato;
  // Diferenças esperadas e aceitas (decisões de produto, não bugs) — cada
  // entrada é um trecho que pode aparecer só no modelo real, não no gerado.
  divergenciasAceitas: string[];
}

function montarValorFormatado(valor: number) {
  return valorFormatadoComExtenso(valor);
}

const GOIAS: CasoTeste = {
  nome: "GOIAS (clube, Essential, parcelado)",
  docxModelo: "GOIAS_Footlink_Contrato_Essential_Parcelado.docx",
  dados: {
    perfil: "clube",
    cliente: "GOIÁS ESPORTE CLUBE",
    cnpj: "01.665.256/0001-80",
    endereco: "Avenida Edmundo Pinheiro de Abreu, 721, Setor Bela Vista, Goiânia, GO, 74.823-342",
    representantesContratante: [],
    testemunhasContratante: [],
    representantesFooture: [],
    testemunhasFooture: [],
    plano: "Essential",
    api: false,
    pagamento: "parcelado",
    total: montarValorFormatado(24000),
    mensal: montarValorFormatado(2000),
    licAdicional: "R$ 660,00",
    diaVenc: "10 (dez)",
    primeiroVenc: "10/05/2026",
    vigIni: "01/05/2026",
    vigFim: "30/04/2027",
    divulga: false,
    foro: "Porto Alegre - RS",
    multaTexto:
      "O cancelamento antecipado pelo CONTRATANTE, ainda que com aviso prévio de 30 dias, implicará a retenção dos valores já recebidos, acrescido de multa contratual referente à soma dos valores de 03 (três) mensalidades vigentes no momento da rescisão. O cancelamento pela CONTRATADA ensejará restituição proporcional dos meses não usufruídos.",
    features: montarFeatures("clube", "Essential", false, 3, 0),
    parcelas: gerarParcelas("10/05/2026", 12, "calendario"),
    dataGeracao: new Date(2026, 3, 6), // 06/04/2026 — data real de fechamento do modelo
  },
  divergenciasAceitas: [
    "endereço fiscal/alternativo duplo do Goiás (schema só tem um campo endereco)",
    "'contratado na modalidade anual' — variação pontual do Goiás, não replicada (só 1 dos 4 contratos mostra isso)",
    "'PLANO ANUAL' no header da Cláusula Sexta — só o Goiás usa esse texto; os outros 3 usam 'PLANO' (padrão majoritário mantido)",
    "Cláusula Décima Terceira (confidencialidade) do Goiás é uma versão longa/negociada, com Parágrafos 1º-4º e 6º " +
      "próprios — fora do escopo do texto padrão do gerador (mesma categoria das cláusulas opcionais já fora de " +
      "escopo: compliance/não-vínculo/estatuto). Bragantino e Corinthians (também clube) confirmam a versão curta " +
      "como padrão majoritário.",
  ],
};

const ELENKO: CasoTeste = {
  nome: "ELENKO (agente, Pro, parcelado)",
  docxModelo: "ELENKO_Footlink_Contrato_Pro_Parcelado.docx",
  dados: {
    perfil: "agente",
    cliente: "ELENKO SPORTS LTDA",
    cnpj: "21.317.529/0001-03",
    endereco: "Rua Doutor Amâncio de Carvalho, nº 182, conjunto 211, Vila Mariana, São Paulo - SP, CEP 04.012-080",
    representantesContratante: [
      { nomeCompleto: "Luis Fernando Menezes Garcia", cpf: "003.482.238-03", email: "" },
      { nomeCompleto: "Guilherme de Miranda Gonçalves", cpf: "223.688.678-05", email: "" },
    ],
    testemunhasContratante: [],
    representantesFooture: [],
    testemunhasFooture: [],
    plano: "Pro",
    api: false,
    pagamento: "parcelado",
    total: montarValorFormatado(9240),
    mensal: montarValorFormatado(770),
    licAdicional: "R$ 770,00",
    diaVenc: "10",
    primeiroVenc: "10/09/2026",
    vigIni: "01/09/2026",
    vigFim: "31/08/2027",
    divulga: false,
    foro: "Porto Alegre - RS",
    multaTexto:
      "O cancelamento antecipado pelo CONTRATANTE, ainda que com aviso prévio de 30 dias, implicará a retenção dos valores já recebidos, acrescido de multa contratual referente à soma dos valores de 03 (três) mensalidades vigentes no momento da rescisão. O cancelamento pela CONTRATADA ensejará restituição proporcional dos meses não usufruídos.",
    features: montarFeatures("agente", "Pro", false, 1, 0),
    parcelas: gerarParcelas("10/09/2026", 12, "calendario"),
    dataGeracao: new Date(2026, 7, 19), // 19/08/2026
  },
  divergenciasAceitas: [
    "texto de preâmbulo 'por {nome1}, CPF nº ...' vs 'por seus sócios {nome1} (CPF ...)' — script usa formato genérico, não 'sócios'",
    "valor por extenso de R$ 9.240,00 no real omite a vírgula antes de 'duzentos e quarenta' (inconsistência humana " +
      "no documento original); o gerador segue a convenção gramatical padrão com vírgula, igual a Corinthians e " +
      "Bragantino que a usam corretamente",
    "bloco de assinatura mostra o nome dos 2 representantes cadastrados em vez de só 'ELENKO SPORTS LTDA' — " +
      "capacidade nova pedida explicitamente (N representantes assináveis, necessária pra Fase 3/Clicksign); o " +
      "contrato real histórico só nomeia representantes no preâmbulo, nunca na assinatura — decisão de produto foi " +
      "estender esse comportamento adiante, não reproduzir o padrão antigo",
  ],
};

const BRAGANTINO: CasoTeste = {
  nome: "BRAGANTINO (clube, Elite, à vista)",
  docxModelo: "BRAGANTINO_Footlink_Contrato_Elite_AVista.docx",
  dados: {
    perfil: "clube",
    cliente: "RED BULL BRAGANTINO FUTEBOL LTDA",
    cnpj: "51.315.976/0001-94",
    endereco: "Rua Emilio Colella, S/N, Bairro Jardim Nova Bragança, Bragança Paulista/SP, CEP 12914-410",
    representantesContratante: [],
    testemunhasContratante: [],
    representantesFooture: [],
    testemunhasFooture: [],
    plano: "Elite",
    api: false,
    pagamento: "avista",
    total: montarValorFormatado(49896),
    mensal: montarValorFormatado(49896),
    licAdicional: "R$ 207,90",
    vencAvista: "30 (trinta) dias corridos contados a partir da data de envio do boleto bancário à CONTRATANTE",
    vigIni: "01/01/2026",
    vigFim: "31/12/2026",
    divulga: true,
    foro: "Porto Alegre - RS",
    multaTexto:
      "O cancelamento antecipado pela CONTRATANTE implicará a retenção dos valores já recebidos pela CONTRATADA a título de multa contratual. O cancelamento antecipado por parte da CONTRATADA ensejará a restituição proporcional dos valores recebidos relativos aos meses vincendos não usufruídos pela CONTRATANTE.",
    features: montarFeatures("clube", "Elite", false, 20, 1, "Feminino"),
    parcelas: [],
    dataGeracao: new Date(2025, 11, 30), // 30/12/2025
  },
  divergenciasAceitas: [],
};

const CORINTHIANS: CasoTeste = {
  nome: "CORINTHIANS (clube, Elite, com API)",
  docxModelo: "CORINTHIANS_Footlink_Contrato_Elite_API.docx",
  dados: {
    perfil: "clube",
    cliente: "SPORT CLUB CORINTHIANS PAULISTA",
    cnpj: "61.902.722/0001-26",
    endereco: "Rua São Jorge, 777, Parque São Jorge, Tatuapé, São Paulo/SP, CEP 03087-000",
    representantesContratante: [],
    testemunhasContratante: [],
    representantesFooture: [],
    testemunhasFooture: [],
    plano: "Elite",
    api: true,
    pagamento: "parcelado",
    total: montarValorFormatado(34152.36),
    mensal: montarValorFormatado(2846.03),
    mensalApi: montarValorFormatado(450),
    mensalSoftware: montarValorFormatado(2396.03),
    licAdicional: "R$ 237,60",
    diaVenc: "10",
    primeiroVenc: "10/05/2026",
    vigIni: "10/05/2026",
    vigFim: "09/05/2027",
    divulga: true,
    foro: "São Paulo - SP",
    multaTexto:
      "O presente Contrato poderá ser resilido imotivadamente pelas Partes, a qualquer tempo, mediante aviso prévio de 30 (trinta) dias, sendo que a falta do aviso implicará multa equivalente a 02 (dois) meses da prestação dos serviços.",
    features: montarFeatures("clube", "Elite", true, 10, 0),
    parcelas: gerarParcelas("10/05/2026", 12, "ciclo"),
    dataGeracao: new Date(2026, 3, 2), // 02/04/2026
  },
  divergenciasAceitas: [
    "'Porto Alegre' vs 'São Paulo' na linha de fechamento — decisão de produto (local sempre fixo Porto Alegre/RS), não bug",
  ],
};

const CASOS = [GOIAS, ELENKO, BRAGANTINO, CORINTHIANS];

function normalizar(texto: string): string[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => linha.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

async function extrairTextoModelo(nomeArquivo: string): Promise<string[]> {
  const caminho = path.join(MODELOS_DIR, nomeArquivo);
  const { value } = await mammoth.extractRawText({ buffer: readFileSync(caminho) });
  return normalizar(value);
}

async function extrairTextoGerado(dados: DadosContrato): Promise<string[]> {
  const buffer = await gerarContratoBuffer(dados);
  const { value } = await mammoth.extractRawText({ buffer });
  return normalizar(value);
}

async function rodarCaso(caso: CasoTeste) {
  console.log(`\n=== ${caso.nome} ===`);
  const [linhasModelo, linhasGerado] = await Promise.all([
    extrairTextoModelo(caso.docxModelo),
    extrairTextoGerado(caso.dados),
  ]);

  const setGerado = new Set(linhasGerado);
  const faltandoNoGerado = linhasModelo.filter((l) => !setGerado.has(l));

  if (faltandoNoGerado.length === 0) {
    console.log("OK — toda linha do modelo real aparece no contrato gerado.");
    return { caso: caso.nome, divergencias: 0 };
  }

  console.log(`${faltandoNoGerado.length} linha(s) do modelo real NÃO aparecem no gerado:`);
  for (const linha of faltandoNoGerado) {
    console.log(`  ✗ ${linha.slice(0, 220)}`);
  }
  if (caso.divergenciasAceitas.length > 0) {
    console.log("  Divergências já esperadas/aceitas para este caso (conferir manualmente contra a lista acima):");
    for (const d of caso.divergenciasAceitas) console.log(`    - ${d}`);
  }
  return { caso: caso.nome, divergencias: faltandoNoGerado.length };
}

async function main() {
  const resultados = [];
  for (const caso of CASOS) {
    resultados.push(await rodarCaso(caso));
  }
  console.log("\n=== Resumo ===");
  for (const r of resultados) {
    console.log(`${r.divergencias === 0 ? "OK  " : "REVER"} ${r.caso} (${r.divergencias} linha(s) a revisar)`);
  }
}

main();
