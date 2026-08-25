// Porte de _docs/referencia-skill/scripts/parcelas.py — gera a tabela de N
// parcelas (Cláusula Oitava) a partir do 1º vencimento.
//
// Cuidado replicado do Python (dateutil.relativedelta): "somar 1 mês" gruda
// no dia grampeado ao último dia do mês de destino quando ele não existe
// (ex.: 31/01 + 1 mês = 28/02, não "03/03" como o overflow nativo do
// `Date.setMonth` do JS faria) — addMesesComGrampo() abaixo replica isso.

export type ConvencaoParcelas = "calendario" | "ciclo";

export interface Parcela {
  numero: number;
  mesVigencia: string;
  periodo: string;
  vencimento: string;
}

const MESES = [
  "",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function diasNoMes(ano: number, mesIndexUm: number): number {
  // mesIndexUm: 1-12. Dia 0 do mês seguinte = último dia do mês pedido.
  return new Date(ano, mesIndexUm, 0).getDate();
}

function addMesesComGrampo(data: Date, meses: number): Date {
  const dia = data.getDate();
  const totalMeses = data.getMonth() + meses; // getMonth() é 0-11
  const ano = data.getFullYear() + Math.floor(totalMeses / 12);
  const mesIndexUm = (((totalMeses % 12) + 12) % 12) + 1; // 1-12
  const diaGrampado = Math.min(dia, diasNoMes(ano, mesIndexUm));
  return new Date(ano, mesIndexUm - 1, diaGrampado);
}

function subtrairDias(data: Date, dias: number): Date {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() - dias);
  return resultado;
}

function formatarData(data: Date): string {
  const dd = String(data.getDate()).padStart(2, "0");
  const mm = String(data.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${data.getFullYear()}`;
}

/** primeiroVencimento no formato DD/MM/AAAA, igual ao script original. */
export function gerarParcelas(
  primeiroVencimento: string,
  n = 12,
  convencao: ConvencaoParcelas = "calendario",
): Parcela[] {
  const [dd, mm, aaaa] = primeiroVencimento.split("/").map(Number);
  let venc = new Date(aaaa, mm - 1, dd);
  const linhas: Parcela[] = [];

  for (let i = 0; i < n; i++) {
    let ini: Date;
    let fim: Date;
    if (convencao === "calendario") {
      ini = new Date(venc.getFullYear(), venc.getMonth(), 1);
      fim = new Date(venc.getFullYear(), venc.getMonth() + 1, 0); // último dia do mês
    } else {
      ini = venc;
      fim = subtrairDias(addMesesComGrampo(venc, 1), 1);
    }

    linhas.push({
      numero: i + 1,
      mesVigencia: `${MESES[venc.getMonth() + 1]}/${venc.getFullYear()}`,
      periodo: `${formatarData(ini)} a ${formatarData(fim)}`,
      vencimento: formatarData(venc),
    });

    venc = addMesesComGrampo(venc, 1);
  }

  return linhas;
}
