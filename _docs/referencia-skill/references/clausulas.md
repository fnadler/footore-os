# Cláusulas — texto-base e o que varia

Duas linhagens de template:
- **CLUBE** → base robusta (contrato São Paulo 2025): inclui garantia de features, SLA 98%, LGPD reforçada controladora/operadora, compliance. LGPD reforçada é **padrão para clube** (produto trata dados de atletas menores de idade).
- **AGENTE** → base Elenko 2026: mais enxuta, com obrigação financeira integral por 12 meses e multa rescisória de 3 mensalidades.

Legenda: 【FIXO】 nunca muda · 【VAR:campo】 vem do pedido/regra · 【OPC:nome】 entra só por demanda.

---

## PARTES (abertura) 【VAR】
CONTRATADA é sempre 【FIXO】:
"FOOTURE PRODUTORA DE CONTEUDO, SOFTWARE E SERVICOS LTDA, pessoa jurídica de direito privado, com sede na cidade de Porto Alegre – RS, na Rua Dr. Barbosa Gonçalves 69, bairro Chácara das Pedras, inscrita no CNPJ/MF sob nº 32.527.841/0001-48, neste ato representada na forma prevista em seu Estatuto Social, doravante denominada como 'CONTRATADA'."

CONTRATANTE 【VAR】: razão social, CNPJ, endereço vêm do pedido de venda MAS devem ser **confirmados** — o pedido costuma trazer CNPJ de filial/endereço divergente. Sempre listar os dados cadastrais para revisão antes de fechar. Representante legal do cliente: se o pedido não trouxer, deixar placeholder [REPRESENTANTE LEGAL — nome, qualificação, CPF] e sinalizar.

Título do documento: "INSTRUMENTO PARTICULAR DE LICENÇA DE USO DO SOFTWARE FOOTLINK" (ou "...DE USO DO SOFTWARE FOOTLINK" — ambas as formas existem; usar a primeira, mais recente/robusta).

---

## CLÁUSULA PRIMEIRA — OBJETO 【FIXO + VAR:api】
Base: "Faz parte do objeto do presente contrato a (i) comercialização da Licença de Uso temporária e não exclusiva do software de gerenciamento e gestão de atletas de futebol, doravante denominado 'FOOTLINK'."
Se produto inclui API 【VAR:api】: acrescentar item (ii) — texto em features.md.

【CLUBE, robusta】 §1º garantia de manutenção de features:
"A CONTRATADA garante que as funcionalidades descritas na Cláusula Sexta serão mantidas durante todo o período de vigência do contrato, não podendo ser suprimidas ou reduzidas. Qualquer alteração significativa deverá ser previamente comunicada e dependerá da anuência expressa do CONTRATANTE. Fica ressalvada a possibilidade de suspensão temporária nas hipóteses da Cláusula Nona."

## CLÁUSULA SEGUNDA — PROPRIEDADE INTELECTUAL 【FIXO】
Titularidade Footure, Lei 9.609/98; §1º direitos exclusivos; §2º melhorias incorporadas; §3º vedação a engenharia reversa. (Texto padrão idêntico em todos os contratos.)

## CLÁUSULA TERCEIRA a QUINTA — SUPORTE 【FIXO / VAR:sla】
3ª: suporte pleno durante a vigência. §1º exceções (negligência/uso indevido).
§2º SLA:
- 【CLUBE, robusta】 "SLA de disponibilidade mínima de 98% (noventa e oito por cento) ao ano" 【FIXO nesta linhagem】
- 【AGENTE / enxuta】 "SLA de disponibilidade anual o mais elevado possível"
4ª: suporte online. 【VAR】 incluir canais reais quando for clube robusto: "através do contato pelo WhatsApp nº (51) 9782-3228 e no e-mail support@footlink.app."
5ª: suporte prestado por sócios/empregados/estagiários.

## CLÁUSULA SEXTA — PREÇO E LICENÇAS (tabela) 【VAR】
Tabela de features montada de features.md × planos.md (ver aquelas referências).
§1º: 2 níveis de acesso "gerencial"/"analista". §2º: troca de logins sem custo.
§3º 【VAR:lic_adicional】: "Caso o CONTRATANTE queira contratar mais licenças... será acrescido ao pagamento mensal o valor de R$ {VALOR_LIC_ADICIONAL}/mês por licença. A cobrança das licenças adicionais se dará na próxima fatura em aberto do contrato."
(À vista: usar a fórmula do Bragantino — R$ X por licença × meses restantes, pago à vista.)

## CLÁUSULA SÉTIMA — VALOR 【VAR:pagamento】
- **Parcelado**: "pagará à CONTRATADA o valor total de R$ {TOTAL} ({total por extenso}), parcelados em 12 pagamentos fixos de R$ {MENSAL} ({mensal por extenso}) ao mês a título de Licença de Uso do software FOOTLINK."
  - 【AGENTE】 acrescentar §1º: "Para fins deste contrato, a obrigação financeira é assumida de forma integral pelo período de 12 (doze) meses, não se confundindo com a forma de pagamento ajustada em parcelamento, que constitui mera facilidade concedida ao CONTRATANTE."
  - Se API: valor total composto; discriminar parcela API + parcela software; boletos distintos.
- **À vista**: "pagará... o valor de R$ {TOTAL} ({por extenso}) em parcela única a título de Licença de Uso do software FOOTLINK."

## CLÁUSULA OITAVA — FORMA/PRAZO DE PAGAMENTO 【VAR:pagamento】
- **Parcelado**: boleto, vencimento no dia {DIA} de cada mês; primeiro vencimento em {DATA_1o_PGTO}. Incluir **tabela de parcelas** (12 linhas: Parcela | Mês de Vigência | Período | Vencimento). Gerar as datas a partir do 1º vencimento.
- **À vista**: boleto com vencimento em 30 dias corridos da data de envio (Bragantino), OU conforme pedido.
- Variante SP: primeira parcela quitada em até 20 dias da assinatura; §1º prorrogação se atraso na NF/boleto.

## CLÁUSULA NONA — MORA 【FIXO default】
"juros de mora de 1% (um por cento) ao mês e multa de 2% (dois por cento)... correção IGPM-FGV... O inadimplemento superior a 30 dias autorizará... suspensão das senhas..., a critério da CONTRATADA, sem prejuízo da rescisão."
- 【CLUBE robusto/SP】 pode usar variante com **prazo de cura de 10 dias** antes de suspender (mais protetiva ao cliente): "concedendo o prazo de 10 (dez) dias para regularização, sob pena de suspensão".

## CLÁUSULA DÉCIMA — DIVULGAÇÃO 【VAR:divulgacao】
Só entra se o pedido disser "Cliente divulgará parceria? = Sim".
- Versão robusta (SP): autoriza divulgação em redes @FootureFC/@footlink.app/@Footlink "desde que o conteúdo seja prévia e expressamente aprovado pelo CONTRATANTE".
- Versão simples (Goiás/agentes): autoriza publicação como referência nas redes.
Se "Não": omitir a cláusula e renumerar.

## VIGÊNCIA E RESCISÃO 【VAR:vigencia, multa】
Vigência: 12 meses. Início = data de assinatura (SP) OU datas fixas do pedido (Goiás: 01/05/2026 a 30/04/2027).
Rescisão — multa é **negociável** (VAR:multa):
- **0 (São Paulo)**: "resilido imotivadamente... sem que seja devida qualquer indenização ou multa contratual." + hipóteses de rescisão por descumprimento (a/b/c) + cura de 15 dias.
- **3 mensalidades (Goiás, Elenko, agentes — DEFAULT parcelado)**: "O cancelamento antecipado pelo CONTRATANTE, ainda que com aviso prévio de 30 dias, implicará a retenção dos valores já recebidos... acrescido de multa contratual referente à soma dos valores de 03 (três) mensalidades vigentes no momento da rescisão."
- **Retenção total (Bragantino, à vista)**: "O cancelamento antecipado pela CONTRATANTE implicará a retenção dos valores já recebidos a título de multa." (Usar só se o pedido explicitar; é mais agressiva.)
Cancelamento por parte da CONTRATADA: restituição proporcional dos meses não usufruídos.
§1º: pedido de cancelamento por escrito a cancelamentos@footure.com.br, 30 dias de antecedência.

## CONFIDENCIALIDADE 【FIXO】
13ª + §§1º-6º. Padrão em todos. 
- 【CLUBE robusto】 §5º/bloco LGPD reforçado (ver abaixo) — mantém controladora/operadora.

## 【OPC/PADRÃO-CLUBE: LGPD REFORÇADA】
Bloco controladora/operadora (São Paulo §5º, alíneas a–o + itens i–iv): declara CONTRATANTE controladora e FOOTURE operadora; conformidade LGPD/ANPD; sigilo; registro de operações; uso restrito à finalidade; comunicação de ordem judicial em 24h; transferência internacional condicionada; descarte pós-finalidade; cooperação com titulares; medidas de segurança; comunicação de incidente em 48h; dados sensíveis; **dados de crianças e adolescentes com consentimento dos pais/responsável**; garantias das Plataformas.
→ **Padrão para clube.** Para agente, incluir versão condensada (Elenko traz só o consentimento LGPD Art. 7º); manter §5º LGPD Art.7º II,V,IX,X.
→ Corinthians tem cláusula 21ª de Proteção de Dados ainda mais extensa (operador/suboperador, RIPD, auditoria 10 dias, ECA) — usar como 【OPC】 quando o cliente exigir DPA próprio.

## DISPOSIÇÕES GERAIS 【FIXO】
15ª prevalência do contrato sobre proposta; 16ª isenção sobre incorreção de dados de fontes públicas; 17ª devolução em CSV + exclusão ao fim; 18ª alteração só por escrito + §§ sucessores/força maior/tolerância.
- 【OPC:compliance】 (SP §5º a–e): políticas internas, diversidade, anticorrupção (Lei 9.613/98 e 12.846/13), trabalho de menores, canais de denúncia. Padrão em clube robusto.
- 【OPC:nao_vinculo】 (SP §4º): declaração de não-vínculo da CONTRATADA com conselheiros/diretores do clube. Entra quando o cliente exige.
- 【OPC:estatuto】 (Corinthians 19ª): observância do Estatuto/Regulamentos do clube publicados no site. Por demanda.

## FORO 【VAR:foro】
Default: "Foro Central da Comarca de Porto Alegre - RS". Só muda se o cliente impuser (SP→São Paulo/SP; Corinthians→São Paulo/SP).

## FECHAMENTO 【FIXO】
Cláusula de assinatura eletrônica MP 2.200-2/2001; local e data; blocos de assinatura CONTRATANTE / CONTRATADA (Emílio César dos Santos Fialho + Eduardo Robaina Dias) + 2 testemunhas.
