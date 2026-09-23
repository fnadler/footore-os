# Cláusulas — texto-base e o que varia

**Uma linhagem padrão (ENXUTA) para clube e agente.** A robusta é exceção, só quando o cliente exige.

- **ENXUTA (PADRÃO, clube e agente):** SLA "o mais elevado possível"; LGPD condensada (Art. 7º);
  §1º de obrigação financeira integral 12 meses; multa de 3 mensalidades. É o padrão real dos
  contratos 2026 (Pantanal, Paysandu, Londrina, Elenko, TFA).
- **ROBUSTA (OPÇÃO, sob demanda):** SLA 98%, garantia de features (1ª §1º), LGPD reforçada
  controladora/operadora, compliance, não-vínculo. Foi específica de São Paulo e Corinthians —
  clientes grandes que impuseram os próprios termos. **Só usar quando o cliente exigir.**

> Trade-off aceito pelo Fabiano: no padrão enxuto o clube sai **sem LGPD reforçada**, mesmo o produto
> tratando dados de atletas menores. Decisão comercial consciente.

Legenda: 【FIXO】 nunca muda · 【VAR:campo】 vem do pedido/regra · 【OPC:nome】 entra só por demanda.

---

## TÍTULO 【FIXO】
"INSTRUMENTO PARTICULAR DE USO DO SOFTWARE FOOTLINK" (padrão atual — não "DE LICENÇA DE USO").

## PARTES (abertura)
CONTRATADA 【FIXO】: "FOOTURE PRODUTORA DE CONTEUDO, SOFTWARE E SERVICOS LTDA, pessoa jurídica de
direito privado, inscrita no CNPJ/MF sob nº 32.527.841/0001-48, com sede na cidade de Porto Alegre –
RS, na Rua Dr. Barbosa Gonçalves 69, bairro Chácara das Pedras, neste ato representada na forma
prevista em seu Estatuto Social, adiante denominada como 'CONTRATADA'."

CONTRATANTE 【VAR】: razão social, CNPJ, endereço do pedido, **sempre confirmados** (o pedido costuma
trazer CNPJ de filial/endereço divergente). Representante legal: se faltar, placeholder
`[REPRESENTANTE LEGAL — nome, qualificação, CPF]` e sinalizar. Situações especiais aparecem no nome
(ex.: Paysandu "– Em Recuperação Judicial").

---

## 1ª OBJETO 【FIXO + VAR:api】
"(i) comercialização da Licença de Uso temporária e não exclusiva do software de gerenciamento e
gestão de atletas de futebol, doravante denominado 'FOOTLINK'". Se API 【VAR:api】: "; e (ii)
comercialização da Licença de Acesso temporário da Interface de Programação de Aplicação/Application
Programming Interface (API) do software FOOTLINK".
- 【ROBUSTA, OPC】 §1º garantia de manutenção de features (não suprimir/reduzir; anuência do
  CONTRATANTE). Só na robusta.

## 2ª PROPRIEDADE INTELECTUAL 【FIXO】
Titularidade Footure, Lei 9.609/98. §1º direitos exclusivos (licença temporária, onerosa, não
exclusiva). §2º melhorias incorporadas, comercializáveis a terceiros. §3º 【FIXO, redação ampliada】:
"É vedado à CONTRATANTE... copiar, alterar, desmontar, descompilar, efetuar engenharia reversa...
devendo responder pelas perdas e danos que comprovadamente der causa, **sem qualquer limitação de
valor, incluindo danos diretos, indiretos, lucros cessantes e indenização devida a terceiros**".
Se API: citar "e sua interface API" ao longo da cláusula.

## 3ª–5ª SUPORTE 【FIXO / VAR:sla】
3ª pleno suporte na vigência; §1º exceções (negligência/uso indevido); §2º SLA:
- 【ENXUTA, PADRÃO】 "SLA de disponibilidade anual o mais elevado possível", ressalvadas: (i)
  manutenção; (ii) segurança/patches; (iii) suspensão por autoridade ou descumprimento.
- 【ROBUSTA, OPC】 "SLA de disponibilidade mínima de 98% (noventa e oito por cento) ao ano".
4ª suporte online. 【ROBUSTA, OPC】 canais reais: "WhatsApp (51) 9782-3228 e e-mail
support@footlink.app". 5ª suporte por sócios/empregados/estagiários.

## 6ª PREÇO E LICENÇAS 【VAR】
Tabela de features de features.md × planos.md (chave perfil+plano). Cabeçalho "PLANO FOOTLINK SCOUT
<PLANO> - FEATURES". Se API: **segunda tabela** "PLANO ACESSO À API DO FOOTLINK" logo abaixo.
§1º 2 níveis "gerencial"/"analista". §2º troca de logins sem custo.
§3º 【VAR:lic_adicional】: "Caso o CONTRATANTE queira contratar mais licenças... será acrescido ao
pagamento mensal o valor de R$ {LIC_ADICIONAL}/mês por licença. A cobrança das licenças adicionais se
dará na próxima fatura em aberto do contrato."

## 7ª VALOR 【VAR:pagamento】
- **Parcelado:** "pagará à CONTRATADA o valor total de R$ {TOTAL} ({extenso}), parcelados em 12
  pagamentos fixos de R$ {MENSAL} ({extenso}) ao mês a título de Licença de Uso do software FOOTLINK."
  §1º 【PADRÃO, clube e agente】 obrigação integral 12 meses: "a obrigação financeira é assumida de
  forma integral pelo período de 12 (doze) meses, não se confundindo com a forma de pagamento
  ajustada em parcelamento, que constitui mera facilidade concedida ao CONTRATANTE."
- **À vista:** "pagará... o valor de R$ {TOTAL} ({extenso}) em parcela única...".
- **API combinado (padrão recente):** total já soma software + API (ex.: R$1.300+R$500=R$1.800/mês);
  boleto único. **API boletos distintos (variante Corinthians):** discriminar parcela API + software;
  §1º emite boletos distintos por parcela.
- **Divulgação com desconto (VAR:divulgacao=obrigacao):** ver bloco Divulgação abaixo — os descontos
  entram aqui na 7ª (redação Paysandu: valor cheio por licença → descontos → valor final parcelado).

## 8ª FORMA/PRAZO DE PAGAMENTO 【VAR:pagamento】
- **Boleto (padrão):** "boleto bancário, com vencimento até o dia {DIA} de cada mês... primeiro
  vencimento pactuado para {DATA_1o}." + tabela de 12 parcelas.
- **PIX (VAR):** "pagamentos se darão através de transferência eletrônica (pix), cabendo ao
  CONTRATANTE a obrigação de envio imediato do comprovante ao e-mail financeiro@footure.com.br...
  pagamento até o dia {DIA} de cada mês, com apresentação da nota fiscal, e previsão do primeiro
  pagamento a partir de {DATA_1o}, através dos seguintes dados bancários:" + **bloco de dados
  bancários** (Footure / CNPJ 32.527.841/0001-48 / BANCO INTER S.A. 077 / AG 0001 / CC 2463249-0 /
  PIX CNPJ32527841000148) + tabela de 12 parcelas.
- **À vista:** boleto com vencimento em 30 dias corridos do envio, OU conforme pedido.
- Tabela de parcelas: colunas Parcela | Mês de Vigência | Período | Vencimento da Parcela. Gerar com
  scripts/parcelas.py (convenção `ciclo` = dia a dia; `calendario` = mês cheio).

## 9ª MORA 【FIXO】
"juros de mora de 1% ao mês e multa de 2%... correção IGPM-FGV... inadimplemento superior a 30 dias
autoriza cancelamento da licença e suspensão das senhas, a critério da CONTRATADA, sem prejuízo da
rescisão." Se API: "...senhas de acesso ao Software Footlink e ao API do FOOTLINK".
- 【ROBUSTA, OPC】 variante com cura de 10 dias antes de suspender.

## DIVULGAÇÃO 【VAR:divulgacao】 — três níveis
- **nenhuma:** omitir a cláusula e renumerar.
- **simples (Pantanal/Londrina):** cláusula própria: "O CONTRATANTE autoriza à CONTRATADA a
  publicação da prestação dos serviços como referência em suas redes sociais (Instagram, twitter,
  facebook e linkedin) @FootureFC, @footlink.app, @Footlink."
- **obrigação de fazer com desconto (Paysandu):** entra como §2º/§3º da 7ª. O clube se obriga a
  publicar post (imagem + texto padrão marcando @FootureFC, @footlink.app, @Footlink_) e recebe
  desconto. Regra de desconto por divulgação: **5% se a parcela mensal < R$ 1.000; 10% se ≥ R$ 1.000**
  — percentual **sempre informado no pedido** (pode variar). Pode combinar com outros descontos
  (ex.: 50% na 2ª licença). O valor final descontado vai para a 7ª.
- 【ROBUSTA, OPC】 variante que condiciona à aprovação prévia do conteúdo pelo CONTRATANTE.

## VIGÊNCIA E RESCISÃO 【VAR:vigencia, multa】
Vigência 12 meses; início/fim do pedido (ex.: 25/08/2026 a 24/08/2027).
Multa 【VAR:multa】:
- **3 mensalidades (PADRÃO):** "O cancelamento antecipado do contrato pelo CONTRATANTE, ainda que com
  aviso prévio de 30 dias, implicará a retenção dos valores já recebidos pela CONTRATADA, acrescido
  de multa contratual referentes à soma dos valores de 03 (três) mensalidades. O cancelamento por
  parte da CONTRATADA ensejará a restituição proporcional dos valores... meses vincendos não
  usufruídos."
- **0 / retenção total / customizada (OPC):** só se o pedido explicitar (SP negociou 0; Bragantino à
  vista = retenção total; Corinthians = 2 mensalidades). Registrar o texto no pedido.
§1º cancelamento por escrito a cancelamentos@footure.com.br, 30 dias de antecedência.

## CONFIDENCIALIDADE 【FIXO base】
Cláusula + §§1º–6º padrão. §5º LGPD:
- 【ENXUTA, PADRÃO】 condensada: "A CONTRATANTE declara expresso consentimento para que a CONTRATADA
  colete, trate e compartilhe os dados necessários ao cumprimento do contrato, nos termos do Art. 7º,
  incisos II, V, IX e X da LGPD. Outros dados poderão ser coletados, conforme termo de consentimento
  específico."
- 【ROBUSTA, OPC】 bloco reforçado controladora/operadora (alíneas a–o: LGPD/ANPD, sigilo, registro,
  finalidade, ordem judicial 24h, transferência internacional, descarte, cooperação com titulares,
  segurança, incidente 48h, dados sensíveis, **crianças e adolescentes com consentimento dos
  pais**, garantias das Plataformas). Ver texto integral no gerador (bloco robusto).

## DISPOSIÇÕES GERAIS 【FIXO】
Prevalência do contrato sobre proposta; isenção sobre incorreção de dados públicos; devolução em CSV +
exclusão ao fim; alteração só por escrito + §§ sucessores/força maior/tolerância.
- 【ROBUSTA, OPC】 compliance (anticorrupção Lei 9.613/98 e 12.846/13, trabalho de menores, canais de
  denúncia); não-vínculo com conselheiros/diretores; observância do Estatuto do clube (Corinthians).

## FORO 【VAR:foro】
Default "Foro Central da Comarca de Porto Alegre - RS". Só muda se o cliente impuser.

## FECHAMENTO 【FIXO】
Frase de fecho MP 2.200-2/2001 + 2 testemunhas; local e data; blocos de assinatura CONTRATANTE /
CONTRATADA (FOOTURE). Representantes nomeados (Emílio César dos Santos Fialho / Eduardo Robaina Dias)
só quando o modelo pedir; os contratos enxutos recentes trazem só a linha da FOOTURE.
