/**
 * gerar_contrato.js — Gerador de contratos Footlink (skill footlink-contract).
 *
 * Uso: node gerar_contrato.js <dados.json> [saida.docx]
 * Recebe o objeto de contrato já normalizado (montado pela SKILL.md) e monta o .docx.
 *
 * Cobre: clube e agente; linhagem enxuta (padrão) e robusta (opção); boleto/pix/à vista;
 * com e sem API (combinado ou boletos distintos); divulgação em 3 níveis; numeração dinâmica.
 *
 * Campos de D: perfil (clube|agente), robusta(bool), cliente, cnpj, endereco, repLegal?,
 *   plano ("Scout Essential"), api(bool), apiValorTexto?, apiModelo('combinado'|'distintos'),
 *   pagamento ('parcelado'|'vista'), metodo ('boleto'|'pix'), total, mensal, mensalApi?,
 *   mensalSoftware?, licAdicional, diaVenc, primeiroVenc, vencAvista?, vigIni, vigFim,
 *   divulgacao ('nenhuma'|'simples'|'obrigacao'), postDivulgacao?, setimaCustom?,
 *   multaTexto, foro, local, features [[label,valor] | ['#','SECAO']], parcelas.
 */
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Header, Footer, ImageRun, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

const ASSET_LOGO = path.join(__dirname, '..', 'assets', 'footlink-logo.png');

const ORD = ['', 'PRIMEIRA','SEGUNDA','TERCEIRA','QUARTA','QUINTA','SEXTA','SÉTIMA','OITAVA','NONA',
  'DÉCIMA','DÉCIMA PRIMEIRA','DÉCIMA SEGUNDA','DÉCIMA TERCEIRA','DÉCIMA QUARTA','DÉCIMA QUINTA',
  'DÉCIMA SEXTA','DÉCIMA SÉTIMA','DÉCIMA OITAVA','DÉCIMA NONA','VIGÉSIMA','VIGÉSIMA PRIMEIRA'];

// ---------- helpers ----------
const R = (t) => new TextRun({ text: t, size: 22 });
const B = (t) => new TextRun({ text: t, bold: true, size: 22 });
const P = (children, opts = {}) => new Paragraph({
  spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED,
  children: Array.isArray(children) ? children : [R(children)], ...opts });
const H = (t) => new Paragraph({
  spacing: { before: 200, after: 120 }, alignment: AlignmentType.CENTER,
  border: { top:{style:BorderStyle.SINGLE,size:6}, bottom:{style:BorderStyle.SINGLE,size:6},
            left:{style:BorderStyle.SINGLE,size:6}, right:{style:BorderStyle.SINGLE,size:6} },
  children: [new TextRun({ text: t, bold: true, size: 22 })] });

function buildHeader() {
  const children = fs.existsSync(ASSET_LOGO)
    ? [ new ImageRun({ type:'png', data: fs.readFileSync(ASSET_LOGO), transformation:{ width:132, height:50 } }) ]
    : [ new TextRun({ text:'footlink', bold:true, size:28, color:'5B4FC4' }) ];
  return new Header({ children:[ new Paragraph({ alignment:AlignmentType.LEFT, spacing:{after:120},
    border:{ bottom:{ style:BorderStyle.SINGLE, size:6, color:'5B4FC4' } }, children }) ] });
}
function buildFooter(D) {
  return new Footer({ children:[ new Paragraph({ alignment:AlignmentType.CENTER, spacing:{before:120},
    border:{ top:{ style:BorderStyle.SINGLE, size:6, color:'5B4FC4' } },
    children:[ new TextRun({ text:`Instrumento Particular de Uso do Software Footlink  ·  ${D.cliente}  ·  Início da vigência: ${D.vigIni||'—'}`,
      size:14, color:'666666' }) ] }) ] });
}

// tabela de features: suporta linha de seção ['#','CAPACIDADE'] (subcabeçalho full-width)
function featTable(planoLabel, features) {
  const head = new TableRow({ tableHeader:true, children:[
    new TableCell({ width:{size:7200,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B(`PLANO FOOTLINK ${planoLabel.toUpperCase()} - FEATURES`)])] }),
    new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B('PLANO')])] }),
  ]});
  const rows = [head];
  for (const [f, v] of features) {
    if (f === '#') {
      rows.push(new TableRow({ children:[ new TableCell({ columnSpan:2, width:{size:9200,type:WidthType.DXA},
        shading:{type:ShadingType.CLEAR,fill:'ECECF7'}, children:[P([B(v)])] }) ] }));
    } else {
      rows.push(new TableRow({ children:[
        new TableCell({ width:{size:7200,type:WidthType.DXA}, children:[P(f)] }),
        new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'E2EFDA'}, children:[P(String(v))] }),
      ]}));
    }
  }
  return new Table({ columnWidths:[7200,2000], width:{size:9200,type:WidthType.DXA}, rows });
}
function apiTable(valorTexto) {
  const linhas = ['Competições','Atletas monitorados','Atletas inseridos pela organização','Avaliações','Relatórios','Projetos'];
  const txt = 'O acesso à API do Footlink permite a utilização dos dados da plataforma integrado a outras soluções próprias ou terceiras, enriquecendo os dados do clube para análise. A API do Footlink fornece os seguintes dados: ' + linhas.join('; ') + '.';
  return new Table({ columnWidths:[7200,2000], width:{size:9200,type:WidthType.DXA}, rows:[
    new TableRow({ tableHeader:true, children:[
      new TableCell({ width:{size:7200,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B('PLANO ACESSO À API DO FOOTLINK')])] }),
      new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B('PLANO')])] }),
    ]}),
    new TableRow({ children:[
      new TableCell({ width:{size:7200,type:WidthType.DXA}, children:[P(txt)] }),
      new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'E2EFDA'}, children:[P(valorTexto||'Pagamento mensal conforme pedido')] }),
    ]}),
  ]});
}
function parcTable(parcelas) {
  const headers = ['Parcela','Mês de Vigência','Período','Vencimento da Parcela'];
  const w = [1400,2200,3400,2200];
  const rows = [ new TableRow({ tableHeader:true, children: headers.map((h,i)=>
    new TableCell({ width:{size:w[i],type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'F2F2F2'}, children:[P([B(h)])] })) })];
  for (const p of parcelas) rows.push(new TableRow({ children: p.map((c,i)=>
    new TableCell({ width:{size:w[i],type:WidthType.DXA}, children:[P(String(c))] })) }));
  return new Table({ columnWidths:w, width:{size:9200,type:WidthType.DXA}, rows });
}
function pixBankBlock() {
  const linhas = ['FOOTURE PRODUTORA DE CONTEUDO, SOFTWARE E SERVICOS LTDA','(CNPJ: 32.527.841/0001-48)',
    'BANCO: INTER S.A. 077','AGÊNCIA: 0001','CONTA CORRENTE: 2463249 – 0','PIX: CNPJ32527841000148'];
  return linhas.map(l => new Paragraph({ spacing:{after:0}, alignment:AlignmentType.LEFT, children:[B(l)] }));
}

// bloco LGPD reforçado (só robusta) — texto integral São Paulo
function lgpdReforcada() {
  const out = [];
  out.push(P([B('Parágrafo 5º: '), R('Em conformidade com o objeto do Contrato, a CONTRATADA poderá ter acesso a dados que identifiquem ou permitam a identificação de pessoas naturais (“Dados Pessoais”) enviados pela CONTRATANTE, coletados ou tratados por conta e ordem desta última. A CONTRATANTE e a CONTRATADA reconhecem que atuam respectivamente como CONTROLADORA e OPERADORA no tratamento de Dados Pessoais relacionado ao objeto do Contrato:')]));
  const al = [
    ['a)','A CONTRATADA declara conhecer e se compromete a cumprir todos os princípios e regras da Lei 13.709/2018 (“LGPD”), suas alterações e regulamentos subsequentes editados pela Autoridade Nacional de Proteção de Dados (“ANPD”).'],
    ['b)','Obriga-se a manter os dados pessoais confidenciais, com acesso estritamente limitado a quem precisa acessá-lo.'],
    ['c)','Deve manter o registro de todas as operações de tratamento de Dados Pessoais, conforme a legislação e a regulamentação vigente.'],
    ['d)','Obriga-se a utilizar os dados exclusivamente para as finalidades do objeto do Contrato, sendo vedado o compartilhamento com terceiros, ainda que anonimizado, salvo autorização prévia, expressa e por escrito da CONTRATANTE.'],
    ['e)','Caso obrigada a transferir ou divulgar Dado Pessoal por ordem administrativa ou judicial, informará a CONTRATANTE em até 24 (vinte e quatro) horas, cooperando para limitar a extensão da transferência.'],
    ['f)','Só realizará transferência internacional de Dados Pessoais quando necessária às finalidades legítimas e em acordo com as exigências legais de proteção de dados.'],
    ['g)','Após atingida a finalidade do tratamento, os Dados Pessoais serão descartados, exceto quando a retenção for necessária ao cumprimento de obrigação legal ou regulatória.'],
    ['h)','Cooperará com a CONTRATANTE para viabilizar o exercício dos direitos dos titulares previstos na legislação.'],
    ['i)','Implementará medidas técnicas e de segurança para resguardar o acesso aos Dados Pessoais, respondendo pelos danos causados e autorizando auditorias mediante prévia e expressa autorização.'],
    ['j)','Em caso de questionamento por autoridade ou ação judicial por violação causada pela CONTRATADA, esta assumirá a defesa, mantendo a CONTRATANTE indene quanto a custas, sanções e honorários.'],
    ['k)','Comunicará à CONTRATANTE quaisquer Incidentes de segurança de Dados Pessoais, potenciais ou efetivos, em até 48 (quarenta e oito) horas.'],
    ['l)','Reconhece que os serviços envolvem o tratamento de Dados Pessoais sensíveis, tratando-os em estrita conformidade legal.'],
    ['m)','Reconhece que os serviços podem envolver o tratamento de Dados Pessoais de crianças e adolescentes, observando o melhor interesse da criança e do adolescente.'],
    ['n)','Só coletará Dados Pessoais de crianças e adolescentes mediante consentimento prévio, expresso e específico dos pais e/ou responsável legal, nos termos da LGPD, quando de fonte privada.'],
    ['o)','Garante que as Plataformas estão adequadas à LGPD e às políticas da CONTRATANTE, com dever de segurança e de possibilitar o exercício dos direitos dos titulares.'],
  ];
  for (const [a,t] of al) out.push(new Paragraph({ spacing:{after:100}, alignment:AlignmentType.JUSTIFIED, indent:{left:360}, children:[ B(a+' '), R(t) ] }));
  return out;
}

function blocoAssinaturas(D) {
  const out = [];
  const linha = '______________________________________';
  const linhaT = '________________________________';
  out.push(new Paragraph({ children:[ new PageBreak() ] }));
  out.push(P([ R('E, por assim se acharem justas e contratadas, as partes assinam o presente Contrato, na presença de duas testemunhas, reconhecendo a validade das assinaturas digital e eletrônica, inclusive aquelas que não utilizem certificados ou utilizem certificados não emitidos pela ICP – Brasil, de modo que o presente documento poderá ser assinado por quaisquer destes meios, sendo considerados, desde já, verdadeiros, válidos e eficazes para todos os efeitos, na forma preconizada pela Medida Provisória n.º 2.200-2/2001, em vigor no Brasil.') ], { spacing:{after:360} }));
  out.push(new Paragraph({ spacing:{before:120,after:120}, alignment:AlignmentType.RIGHT, children:[R((D.local||'')+'.')] }));
  const bloco = (nome, papel, before) => ([
    new Paragraph({ spacing:{before}, alignment:AlignmentType.CENTER, keepNext:true, keepLines:true, children:[R(linha)] }),
    new Paragraph({ spacing:{after:0}, alignment:AlignmentType.CENTER, keepNext:true, keepLines:true, children:[B(nome)] }),
    new Paragraph({ spacing:{after:0}, alignment:AlignmentType.CENTER, keepLines:true, children:[R(papel)] }),
  ]);
  out.push(...bloco(D.cliente, 'CONTRATANTE', 480));
  out.push(...bloco('FOOTURE PRODUTORA DE CONTEÚDO, SOFTWARE E SERVIÇOS LTDA', 'CONTRATADA', 720));
  out.push(new Paragraph({ spacing:{before:720,after:160}, keepNext:true, children:[B('Testemunhas:')] }));
  const cell = () => new TableCell({ width:{size:4600,type:WidthType.DXA},
    borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE}},
    margins:{right:400}, children:[
      new Paragraph({ spacing:{before:240,after:0}, children:[R(linhaT)] }),
      new Paragraph({ spacing:{after:0}, children:[R('Nome:')] }),
      new Paragraph({ spacing:{after:0}, children:[R('CPF:')] }),
    ]});
  out.push(new Table({ columnWidths:[4600,4600], width:{size:9200,type:WidthType.DXA},
    borders:{top:{style:BorderStyle.NONE},bottom:{style:BorderStyle.NONE},left:{style:BorderStyle.NONE},right:{style:BorderStyle.NONE},insideHorizontal:{style:BorderStyle.NONE},insideVertical:{style:BorderStyle.NONE}},
    rows:[ new TableRow({ children:[ cell(), cell() ] }) ] }));
  return out;
}

// ---------- montagem ----------
function build(D) {
  const isClube = D.perfil === 'clube';
  const robusta = !!D.robusta;
  const metodo = D.metodo || 'boleto';
  const divulg = D.divulgacao || 'nenhuma';
  const apiSep = ' e sua interface API';
  const k = [];

  // Numeração dinâmica: cláusula de divulgação simples é standalone (Décima) e desloca as demais.
  const divStandalone = (divulg === 'simples') ? 1 : 0;
  const nVigencia = 10 + divStandalone;
  const nRescisao = nVigencia + 1;
  const nConfid   = nRescisao + 1;
  const nExclus   = nConfid + 1;
  const nDisp1    = nExclus + 1; // prevalência
  const nDisp2    = nDisp1 + 1;  // fontes públicas
  const nDisp3    = nDisp2 + 1;  // csv
  const nDisp4    = nDisp3 + 1;  // alteração
  const nForo     = nDisp4 + 1;
  const CL = (n) => `CLÁUSULA ${ORD[n]}: `;

  k.push(H('INSTRUMENTO PARTICULAR DE USO DO SOFTWARE FOOTLINK'));

  // Partes
  k.push(P([ B(`CONTRATANTE: ${D.cliente}, `), R(`pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${D.cnpj}, com endereço à ${D.endereco}, neste ato representado na forma prevista em seu Estatuto Social`), (D.repLegal? R(`, por ${D.repLegal}`):R('')), R(', adiante denominado '), B('“CONTRATANTE”;') ]));
  k.push(P([ B('CONTRATADA: FOOTURE PRODUTORA DE CONTEUDO, SOFTWARE E SERVICOS LTDA, '), R('pessoa jurídica de direito privado, inscrita no CNPJ/MF sob nº 32.527.841/0001-48, com sede na cidade de Porto Alegre – RS, na Rua Dr. Barbosa Gonçalves 69, bairro Chácara das Pedras, neste ato representado na forma prevista em seu Estatuto Social, adiante denominada como '), B('“CONTRATADA”;') ]));
  k.push(P('Ajustam as partes, de mútuo e comum acordo, o presente Contrato de Licenciamento de Software, o qual será regido nos seguintes termos e condições abaixo descritas:'));

  // 1ª Objeto
  k.push(H('DO OBJETO'));
  let objeto = 'Faz parte do objeto do presente contrato a (i) comercialização da Licença de Uso temporária e não exclusiva do software de gerenciamento e gestão de atletas de futebol, doravante denominado “FOOTLINK”';
  if (D.api) objeto += '; e (ii) comercialização da Licença de Acesso temporário da Interface de Programação de Aplicação/Application Programming Interface (API) do software FOOTLINK';
  objeto += ';';
  k.push(P([ B('CLÁUSULA PRIMEIRA: '), R(objeto) ]));
  if (robusta) k.push(P([ B('Parágrafo 1º: '), R('A CONTRATADA garante que as funcionalidades descritas na Cláusula Sexta serão mantidas durante todo o período de vigência do contrato, não podendo ser suprimidas ou reduzidas. Qualquer alteração significativa deverá ser previamente comunicada e dependerá da anuência expressa do CONTRATANTE.') ]));

  // 2ª PI
  k.push(H('DA PROPRIEDADE INTELECTUAL'));
  k.push(P([ B('CLÁUSULA SEGUNDA: '), R(`O CONTRATANTE reconhece como da CONTRATADA todos os direitos concernentes ao software FOOTLINK${D.api?apiSep:''}. Aplicam-se, adicionalmente, as regras estabelecidas na Lei 9.609/98 para o fim de regular as demais normas a respeito da titularidade da propriedade intelectual decorrente do software FOOTLINK de titularidade da CONTRATADA.`) ]));
  k.push(P([ B('Parágrafo 1º: '), R(`Todos os direitos autorais e de propriedade intelectual do software FOOTLINK${D.api?apiSep:''} e de obras derivadas são e permanecerão sendo de propriedade única e exclusiva da CONTRATADA. A CONTRATANTE declara que não terá qualquer direito ou ação sobre o software FOOTLINK, exceto a licença temporária de uso, onerosa e não exclusiva, nos termos acordados nesse Contrato.`) ]));
  k.push(P([ B('Parágrafo 2º: '), R('Todas as modificações, melhorias, correções e novas versões do software FOOTLINK ou de obras derivadas, mesmo que informadas, solicitadas e, eventualmente, pagas pela CONTRATANTE, ficarão incorporadas ao software FOOTLINK e sujeitas a este Contrato, podendo ser disponibilizadas/comercializadas pela CONTRATADA a terceiros.') ]));
  k.push(P([ B('Parágrafo 3º: '), R(`É vedado à CONTRATANTE, na pessoa de seus sócios, representantes, empregados, fornecedores ou terceiros interessados, copiar, alterar, desmontar, descompilar, efetuar engenharia reversa ou tomar qualquer providência visando obter os códigos-fonte do software FOOTLINK${D.api?apiSep:''}, devendo responder pelas perdas e danos que comprovadamente der causa, sem qualquer limitação de valor, incluindo danos diretos, indiretos, lucros cessantes e indenização devida a terceiros.`) ]));

  // 3ª-5ª Suporte
  k.push(H('DO SUPORTE TÉCNICO'));
  k.push(P([ B('CLÁUSULA TERCEIRA: '), R(`A CONTRATADA se obriga, no decorrer do prazo de vigência da presente relação contratual, a conceder pleno suporte ao CONTRATANTE para utilização do FOOTLINK${D.api?' e da API':''}.`) ]));
  k.push(P([ B('Parágrafo 1º: '), R('Os serviços técnicos de suporte e manutenção serão efetuados desde que não causados por: (i) negligência ou uso inadequado do Software; ou (ii) uso do Software para fins diversos do projetado.') ]));
  const sla = robusta
    ? 'a CONTRATADA se compromete a manter um SLA de disponibilidade mínima de 98% (noventa e oito por cento) ao ano'
    : 'a CONTRATADA se compromete a manter um SLA de disponibilidade anual o mais elevado possível';
  k.push(P([ B('Parágrafo 2º: '), R(`Partindo-se da premissa de que em prestação de serviços na área de informática não existe garantia integral de manutenção do Software no ar durante 100% do tempo, ${sla}, ressalvadas: (i) interrupções para ajustes técnicos ou manutenção; (ii) intervenções emergenciais de segurança; e (iii) suspensão por determinação de autoridades competentes ou por descumprimento contratual.`) ]));
  const canais = robusta ? ', através do WhatsApp nº (51) 9782-3228 e do e-mail support@footlink.app' : '';
  k.push(P([ B('CLÁUSULA QUARTA: '), R(`Independente da possibilidade do suporte presencial, a CONTRATADA se compromete a prestar o suporte para utilização do FOOTLINK por meio de suas linhas de comunicação e de serviço de atendimento online${canais}.`) ]));
  k.push(P([ B('CLÁUSULA QUINTA: '), R('O suporte para acesso e uso do FOOTLINK será prestado pela CONTRATADA através de seus sócios, empregados, estagiários e, eventualmente, por profissionais especialmente contratados.') ]));

  // 6ª Preço e licenças
  k.push(H('DO PREÇO E DAS LICENÇAS'));
  k.push(P([ B('CLÁUSULA SEXTA: '), R('A configuração dos serviços do software FOOTLINK, ora contratado, é a detalhada abaixo:') ]));
  k.push(featTable(D.plano, D.features));
  if (D.api) { k.push(new Paragraph({ spacing:{after:80}, children:[R('')] })); k.push(apiTable(D.apiValorTexto)); }
  k.push(P([ B('Parágrafo 1º: '), R('As licenças individuais contratadas serão distribuídas em 2 (dois) níveis de acesso, “gerencial” e “analista”, conforme lista a ser enviada pelo '+(isClube?'clube':'CONTRATANTE')+' após a assinatura do contrato.') ]));
  k.push(P([ B('Parágrafo 2º: '), R('Não excedendo o número de licenças contratadas, a alteração de níveis de acesso, inclusão e troca de logins poderão ser feitas pela CONTRATANTE a qualquer momento, sem qualquer custo adicional.') ]));
  k.push(P([ B('Parágrafo 3º: '), R(`Caso a CONTRATANTE queira contratar mais licenças que as que constam no presente contrato, será acrescido ao pagamento mensal o valor de ${D.licAdicional}/mês por licença. A cobrança das licenças adicionais se dará na próxima fatura em aberto do contrato.`) ]));

  // 7ª Valor
  if (D.setimaCustom) {
    k.push(P([ B('CLÁUSULA SÉTIMA: '), R(D.setimaCustom) ]));
    if (D.pagamento === 'parcelado') k.push(P([ B('Parágrafo 1º: '), R('Para fins deste contrato, a obrigação financeira é assumida de forma integral pelo período de 12 (doze) meses, não se confundindo com a forma de pagamento ajustada em parcelamento, que constitui mera facilidade concedida ao CONTRATANTE.') ]));
  } else if (D.pagamento === 'parcelado') {
    if (D.api && D.apiModelo === 'distintos' && D.mensalApi && D.mensalSoftware) {
      k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, o CONTRATANTE pagará à CONTRATADA o valor total de ${D.total}, em 12 (doze) parcelas mensais de ${D.mensal}, sendo cada parcela composta por: (i) ${D.mensalApi} referentes à utilização da API; e (ii) ${D.mensalSoftware} referentes à licença de uso do software FOOTLINK.`) ]));
      k.push(P([ B('Parágrafo 1º: '), R(`Fica estabelecido que, para cada parcela mensal, serão emitidos boletos bancários distintos, sendo um no valor de ${D.mensalApi} relativo à API e outro no valor de ${D.mensalSoftware} relativo ao software FOOTLINK.`) ]));
    } else {
      k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, contratado na modalidade anual, o CONTRATANTE pagará à CONTRATADA o valor total de ${D.total}, parcelados em 12 pagamentos fixos de ${D.mensal} ao mês a título de Licença de Uso do software FOOTLINK.`) ]));
      k.push(P([ B('Parágrafo 1º: '), R('Para fins deste contrato, a obrigação financeira é assumida de forma integral pelo período de 12 (doze) meses, não se confundindo com a forma de pagamento ajustada, que constitui mera facilidade concedida ao CONTRATANTE.') ]));
    }
  } else {
    k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, o CONTRATANTE pagará à CONTRATADA o valor de ${D.total} em parcela única a título de Licença de Uso do software FOOTLINK.`) ]));
  }
  // Divulgação como obrigação de fazer (entra na 7ª)
  if (divulg === 'obrigacao') {
    const post = D.postDivulgacao || 'uma imagem promocional com texto de divulgação da parceria a ser aprovado entre as partes';
    k.push(P([ B('Parágrafo 2º: '), R(`Além do valor acima, constitui o preço pelo objeto do presente contrato a seguinte obrigação de fazer: em data a ser ajustada entre os departamentos de comunicação e marketing das partes, o CONTRATANTE irá publicar nas suas redes sociais (Instagram, twitter, facebook e linkedin), marcando “@FootureFC”, “@footlink.app” e “@Footlink_”, ${post}.`) ]));
    k.push(P([ B('Parágrafo 3º: '), R('Da mesma forma, o CONTRATANTE autoriza à CONTRATADA a publicação da imagem e texto nas redes sociais (Instagram, twitter, facebook e linkedin) @FootureFC, @footlink.app, @Footlink.') ]));
  }

  // 8ª Forma/prazo de pagamento
  if (D.pagamento === 'parcelado') {
    if (metodo === 'pix') {
      k.push(P([ B('CLÁUSULA OITAVA: '), R(`Ajustam as partes que os pagamentos se darão através de transferência eletrônica (pix), cabendo ao CONTRATANTE a obrigação de envio imediato do comprovante de pagamento ao e-mail financeiro@footure.com.br, tão logo este seja realizado. O pagamento será realizado até o dia ${D.diaVenc||'25'} de cada mês, com apresentação da nota fiscal, e previsão do primeiro pagamento a partir de ${D.primeiroVenc}, através dos seguintes dados bancários:`) ]));
      k.push(...pixBankBlock());
      k.push(new Paragraph({ spacing:{after:80}, children:[R('')] }));
    } else {
      k.push(P([ B('CLÁUSULA OITAVA: '), R(`Em relação à forma e prazo para pagamento, ajustam as partes que o pagamento se dará através de boleto bancário, com vencimento até o dia ${D.diaVenc||'10'} de cada mês, cabendo ao CONTRATANTE a obrigação de efetuar o pagamento no prazo estipulado, sendo o primeiro vencimento pactuado para ${D.primeiroVenc}:`) ]));
    }
    k.push(parcTable(D.parcelas));
  } else {
    k.push(P([ B('CLÁUSULA OITAVA: '), R(`O pagamento se dará através de boleto bancário, com vencimento em ${D.vencAvista||'30 (trinta) dias corridos contados a partir da data de envio do boleto à CONTRATANTE'}.`) ]));
  }

  // 9ª Mora
  k.push(P([ B('CLÁUSULA NONA: '), R(`O não pagamento no prazo ajustado implicará a incidência de juros de mora de 1% (um por cento) ao mês e multa de 2% (dois por cento), ambos sobre o valor em atraso, com correção pelo IGPM-FGV até o efetivo pagamento. O inadimplemento superior a 30 (trinta) dias autorizará o imediato cancelamento da licença e a suspensão das senhas de acesso ao Software Footlink${D.api?' e ao API do FOOTLINK':''}, a critério da CONTRATADA, sem prejuízo da rescisão prevista na Cláusula ${ORD[nRescisao]}.`) ]));

  // Divulgação simples (cláusula standalone)
  if (divulg === 'simples') {
    k.push(P([ B('CLÁUSULA DÉCIMA: '), R('O CONTRATANTE autoriza à CONTRATADA a publicação da prestação dos serviços como referência em suas redes sociais (Instagram, twitter, facebook e linkedin) @FootureFC, @footlink.app, @Footlink.') ]));
  }

  // Vigência e rescisão
  k.push(H('DA VIGÊNCIA E DA RESCISÃO'));
  k.push(P([ B(CL(nVigencia)), R(`O presente contrato é celebrado por prazo determinado de 12 (doze) meses, iniciando-se em ${D.vigIni} e encerrando-se em ${D.vigFim}, sendo que, findo o período e havendo interesse das partes, deverão celebrar novo instrumento contratual.`) ]));
  k.push(P([ B(CL(nRescisao)), R(D.multaTexto) ]));
  k.push(P([ B('Parágrafo 1º: '), R('O CONTRATANTE que pretender rescindir ou cancelar sua assinatura deverá formalizar a solicitação exclusivamente por comunicação escrita ao e-mail cancelamentos@footure.com.br, com antecedência mínima de 30 (trinta) dias.') ]));

  // Confidencialidade
  k.push(H('DA CONFIDENCIALIDADE E EXCLUSIVIDADE'));
  k.push(P([ B(CL(nConfid)), R('A CONTRATADA obriga-se expressamente a manter em estrito sigilo as informações confidenciais recebidas, bem como a não utilizá-las para outros fins. Da mesma forma, o CONTRATANTE obriga-se a não divulgar ou repassar a terceiros as metodologias e tecnologias da CONTRATADA, mantendo sigilo das informações recebidas.') ]));
  k.push(P([ B('Parágrafo 1º: '), R('As Partes tratarão como sigilosas todas as informações confidenciais a que tiverem acesso, em especial dados pessoais e informações técnicas, estratégicas, econômicas ou de mercado.') ]));
  k.push(P([ B('Parágrafo 2º: '), R('Eventual obrigação de sigilo relativa às informações incluídas e/ou extraídas do Software FOOTLINK é de responsabilidade do CONTRATANTE quanto ao uso interno, e da CONTRATADA quanto à guarda e segurança tecnológica.') ]));
  k.push(P([ B('Parágrafo 3º: '), R('Não há restrição de divulgação quando: a) a informação se torna pública por outra via que não a Parte Receptora; b) é obtida de terceiros com autorização; c) já era de conhecimento prévio da Parte Receptora.') ]));
  k.push(P([ B('Parágrafo 4º: '), R('É vedada a divulgação de informações confidenciais salvo consentimento expresso, admitido o fornecimento por ordem judicial/administrativa mediante notificação prévia. A disposição perdura durante a vigência e por 05 (cinco) anos após o término.') ]));
  if (robusta) k.push(...lgpdReforcada());
  else k.push(P([ B('Parágrafo 5º: '), R('A CONTRATANTE declara expresso consentimento para que a CONTRATADA colete, trate e compartilhe os dados necessários ao cumprimento do contrato, nos termos do Art. 7º, incisos II, V, IX e X da LGPD. Outros dados poderão ser coletados conforme termo de consentimento específico.') ]));
  k.push(P([ B('Parágrafo 6º: '), R('Serão consideradas confidenciais, ainda, as informações identificadas como tais pelas partes ou que, pela natureza ou circunstâncias da revelação, devam ser assim consideradas.') ]));
  k.push(P([ B(CL(nExclus)), R('O presente contrato não implica qualquer exclusividade entre as partes, podendo cada qual contratar serviços semelhantes junto a terceiros.') ]));

  // Disposições gerais
  k.push(H('DAS DISPOSIÇÕES GERAIS'));
  k.push(P([ B(CL(nDisp1)), R('Havendo contradição entre este instrumento e a Proposta Comercial ou qualquer outro documento, prevalecerá o disposto neste contrato.') ]));
  k.push(P([ B(CL(nDisp2)), R('O CONTRATANTE reconhece que as informações do FOOTLINK são obtidas de fontes oficiais e não oficiais públicas lícitas; eventual incorreção não é responsabilidade da CONTRATADA nem justifica rescisão.') ]));
  k.push(P([ B(CL(nDisp3)), R('Encerrada a vigência sem prorrogação, as informações inseridas serão entregues em arquivo “csv” e, após, imediatamente excluídas junto com as senhas e logins de acesso.') ]));
  k.push(P([ B(CL(nDisp4)), R('Este ajuste somente poderá ser alterado, substituído, rescindido, renovado ou prorrogado por instrumento escrito assinado pelas partes, constituindo o entendimento completo entre elas, obrigando sucessores; eventos de força maior serão comunicados de imediato; a tolerância quanto a atraso não altera as condições pactuadas.') ]));

  // Foro
  k.push(H('DO FORO'));
  k.push(P([ B(CL(nForo)), R(`Elegem as partes o Foro Central da Comarca de ${D.foro}, para dirimir quaisquer questões oriundas do presente contrato.`) ]));

  k.push(...blocoAssinaturas(D));

  return new Document({ sections:[{
    properties:{ page:{ size:{width:11906,height:16838}, margin:{top:1134,bottom:1134,left:1134,right:1134} } },
    headers:{ default: buildHeader() }, footers:{ default: buildFooter(D) }, children:k }] });
}

if (require.main === module) {
  const dados = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const out = process.argv[3] || '/mnt/user-data/outputs/contrato.docx';
  Packer.toBuffer(build(dados)).then(b => { fs.writeFileSync(out, b); console.log('gerado:', out); });
}
module.exports = { build };
