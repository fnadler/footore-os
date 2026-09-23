#!/usr/bin/env python3
"""
Gera a tabela de 12 parcelas (Cláusula Oitava) a partir do 1º vencimento.

Uso: python parcelas.py DD/MM/AAAA [n_parcelas] [dia_venc]

Reproduz o padrão dos contratos: cada parcela = 1 mês de vigência, período do dia
do vencimento ao dia anterior do mês seguinte, vencimento no dia fixo.
Imprime linhas "Parcela | Mês de Vigência | Período | Vencimento".
"""
import sys
from datetime import date
from dateutil.relativedelta import relativedelta

MESES = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
         "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]


def gerar(primeiro_venc, n=12, periodo="calendario"):
    """
    periodo="calendario" (default, padrão Goiás/2026): período = mês-calendário cheio
        (01/05/2026 a 31/05/2026), vencimento no dia informado.
    periodo="ciclo" (padrão Corinthians): período = do dia do vencimento ao dia anterior
        do mês seguinte (10/05/2026 a 09/06/2026).
    """
    d, m, a = map(int, primeiro_venc.split("/"))
    venc = date(a, m, d)
    linhas = []
    for i in range(n):
        if periodo == "calendario":
            ini = venc.replace(day=1)
            fim = ini + relativedelta(months=1) - relativedelta(days=1)
        else:  # ciclo
            ini = venc
            fim = venc + relativedelta(months=1) - relativedelta(days=1)
        vig = f"{MESES[venc.month]}/{venc.year}"
        per = f"{ini.strftime('%d/%m/%Y')} a {fim.strftime('%d/%m/%Y')}"
        linhas.append((i + 1, vig, per, venc.strftime("%d/%m/%Y")))
        venc = venc + relativedelta(months=1)
    return linhas


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("uso: python parcelas.py DD/MM/AAAA [n]")
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 12
    modo = sys.argv[3] if len(sys.argv) > 3 else "calendario"
    for p in gerar(sys.argv[1], n, modo):
        print(f"{p[0]:>2} | {p[1]:<16} | {p[2]} | {p[3]}")
