// gerar_contrato.js espera D.total/D.mensal/D.mensalApi/D.mensalSoftware já
// como string pronta "R$ 34.152,36 (trinta e quatro mil, cento e cinquenta e
// dois reais e trinta e seis centavos)" — no fluxo original (skill via chat)
// isso era escrito à mão/por um humano; aqui vira código porque os valores no
// pedido são numeric puro (seção 5 do PROMPT.md). Validado byte-a-byte contra
// os 4 valores confirmados no Cláusula Sétima do contrato real da Corinthians
// (ver scripts/test-geracao.ts): 34152.36, 450, 2396.03, 2846.03.

const UNIDADES = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];
const DEZ_A_DEZENOVE = [
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const DEZENAS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const CENTENAS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function doisDigitos(n: number): string {
  if (n === 0) return "";
  if (n < 10) return UNIDADES[n];
  if (n < 20) return DEZ_A_DEZENOVE[n - 10];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return u === 0 ? DEZENAS[d] : `${DEZENAS[d]} e ${UNIDADES[u]}`;
}

function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  if (c === 0) return doisDigitos(resto);
  if (resto === 0) return CENTENAS[c];
  return `${CENTENAS[c]} e ${doisDigitos(resto)}`;
}

// Converte um inteiro não-negativo (até 999.999.999) para extenso em português.
export function inteiroPorExtenso(valor: number): string {
  if (valor === 0) return "zero";

  const grupos: number[] = [];
  let resto = Math.trunc(valor);
  while (resto > 0) {
    grupos.push(resto % 1000);
    resto = Math.floor(resto / 1000);
  }
  // grupos[0] = unidades, grupos[1] = milhares, grupos[2] = milhões...

  const partes: { texto: string; valor: number; grupoIndex: number }[] = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i];
    if (g === 0) continue;
    let escala = "";
    if (i === 1) escala = " mil";
    else if (i === 2) escala = g === 1 ? " milhão" : " milhões";
    else if (i === 3) escala = g === 1 ? " bilhão" : " bilhões";
    const texto = i === 1 && g === 1 ? "mil" : `${tresDigitos(g)}${escala}`;
    partes.push({ texto, valor: g, grupoIndex: i });
  }

  let resultado = "";
  for (let idx = 0; idx < partes.length; idx++) {
    const parte = partes[idx];
    const ultima = idx === partes.length - 1;
    resultado += parte.texto;
    if (!ultima) {
      const proxima = partes[idx + 1];
      // "e" antes do último grupo quando ele é < 100 (ou centena redonda) e
      // não há grupo de milhar entre eles; senão vírgula. Regra padrão PT-BR.
      const proximaEhUltima = idx + 1 === partes.length - 1;
      const usarE =
        proximaEhUltima &&
        proxima.grupoIndex === 0 &&
        (proxima.valor < 100 || proxima.valor % 100 === 0);
      resultado += usarE ? " e " : ", ";
    }
  }
  return resultado;
}

// "de" obrigatório entre milhão(ões)/bilhão(ões) e o substantivo seguinte
// quando a escala de milhão/bilhão é a última palavra antes dele (ex.: "um
// milhão de reais", mas "um milhão e duzentos mil reais" sem "de").
function precisaDe(extensoInteiro: string): boolean {
  return /milh(ão|ões)$|bilh(ão|ões)$/.test(extensoInteiro);
}

export function valorPorExtenso(valorEmReais: number): string {
  const reais = Math.trunc(valorEmReais);
  const centavos = Math.round((valorEmReais - reais) * 100);

  const reaisExtenso = inteiroPorExtenso(reais);
  const reaisTexto = `${reaisExtenso} ${precisaDe(reaisExtenso) ? "de " : ""}${reais === 1 ? "real" : "reais"}`;
  if (centavos === 0) return reaisTexto;

  const centavosExtenso = inteiroPorExtenso(centavos);
  const centavosTexto = `${centavosExtenso} ${precisaDe(centavosExtenso) ? "de " : ""}${centavos === 1 ? "centavo" : "centavos"}`;
  return `${reaisTexto} e ${centavosTexto}`;
}

/** "R$ 34.152,36" — espaço normal (não o NBSP que Intl currency devolveria). */
function formatarMoeda(valorEmReais: number): string {
  const numero = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorEmReais);
  return `R$ ${numero}`;
}

/** "R$ 34.152,36 (trinta e quatro mil, cento e cinquenta e dois reais e trinta e seis centavos)" */
export function valorFormatadoComExtenso(valorEmReais: number): string {
  return `${formatarMoeda(valorEmReais)} (${valorPorExtenso(valorEmReais)})`;
}
