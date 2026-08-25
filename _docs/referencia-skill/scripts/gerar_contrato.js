/**
 * gerar_contrato.js — Gerador de contratos Footlink (skill footlink-contract).
 *
 * Uso: node gerar_contrato.js <dados.json>
 * O <dados.json> é o objeto de contrato já normalizado (ver montar_dados no fluxo da SKILL.md).
 * Este script NÃO decide regra de negócio — recebe tudo pronto e monta o .docx.
 *
 * Cobre: clube e agente; à vista e parcelado; com e sem API; LGPD reforçada (clube);
 * cabeçalho com logo, rodapé com metadados, página exclusiva de assinaturas.
 */
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, Header, Footer, ImageRun, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

const ASSET_LOGO = path.join(__dirname, '..', 'assets', 'footlink-logo.png');

// ---------- helpers de parágrafo ----------
const R = (t) => new TextRun({ text: t, size: 22 });
const B = (t) => new TextRun({ text: t, bold: true, size: 22 });
const P = (children, opts = {}) => new Paragraph({
  spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED,
  children: Array.isArray(children) ? children : [R(children)], ...opts
});
const H = (t) => new Paragraph({
  spacing: { before: 200, after: 120 }, alignment: AlignmentType.CENTER,
  border: { top:{style:BorderStyle.SINGLE,size:6}, bottom:{style:BorderStyle.SINGLE,size:6},
            left:{style:BorderStyle.SINGLE,size:6}, right:{style:BorderStyle.SINGLE,size:6} },
  children: [new TextRun({ text: t, bold: true, size: 22 })]
});

// ---------- cabeçalho / rodapé ----------
function buildHeader() {
  const children = [];
  if (fs.existsSync(ASSET_LOGO)) {
    children.push(new ImageRun({ type: 'png', data: fs.readFileSync(ASSET_LOGO),
      transformation: { width: 132, height: 50 } }));
  } else {
    children.push(new TextRun({ text: 'footlink', bold: true, size: 28, color: '5B4FC4' }));
  }
  return new Header({ children: [ new Paragraph({
    alignment: AlignmentType.LEFT, spacing: { after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '5B4FC4' } },
    children }) ] });
}
function buildFooter(D) {
  return new Footer({ children: [ new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 120 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: '5B4FC4' } },
    children: [ new TextRun({
      text: `Instrumento Particular de Licença de Uso do Software Footlink  ·  ${D.cliente}  ·  Início da vigência: ${D.vigIni || '—'}`,
      size: 14, color: '666666' }) ] }) ] });
}

// ---------- tabelas ----------
function featTable(planoLabel, features) {
  const rows = [ new TableRow({ tableHeader: true, children: [
    new TableCell({ width:{size:7200,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B(`PLANO FOOTLINK ${planoLabel.toUpperCase()} - FEATURES`)])] }),
    new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'D9D9F3'}, children:[P([B('PLANO')])] }),
  ]})];
  for (const [f, v] of features) {
    rows.push(new TableRow({ children: [
      new TableCell({ width:{size:7200,type:WidthType.DXA}, children:[P(f)] }),
      new TableCell({ width:{size:2000,type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'E2EFDA'}, children:[P(v)] }),
    ]}));
  }
  return new Table({ columnWidths:[7200,2000], width:{size:9200,type:WidthType.DXA}, rows });
}
function parcTable(parcelas) {
  const head = ['Parcela','Mês de Vigência','Período','Vencimento da Parcela'];
  const w = [1400,2200,3400,2200];
  const rows = [ new TableRow({ tableHeader:true, children: head.map((h,i)=>
    new TableCell({ width:{size:w[i],type:WidthType.DXA}, shading:{type:ShadingType.CLEAR,fill:'F2F2F2'}, children:[P([B(h)])] })) })];
  for (const p of parcelas) {
    rows.push(new TableRow({ children: p.map((c,i)=>
      new TableCell({ width:{size:w[i],type:WidthType.DXA}, children:[P(String(c))] })) }));
  }
  return new Table({ columnWidths:w, width:{size:9200,type:WidthType.DXA}, rows });
}

// ---------- bloco LGPD reforçado (clube) ----------
function lgpdReforcada() {
  const out = [];
  out.push(P([B('Parágrafo 5º: '), R('Em conformidade com o objeto do Contrato, a CONTRATADA poderá ter acesso a dados que identifiquem ou permitam a identificação de pessoas naturais (\u201cDados Pessoais\u201d) e que sejam enviados pela CONTRATANTE, coletados ou de qualquer outra forma tratados por conta e ordem desta última. A CONTRATANTE e a CONTRATADA reconhecem reciprocamente que atuam respectivamente como CONTROLADORA e OPERADORA no tratamento de Dados Pessoais que possa estar relacionado ao objeto do Contrato:')]));
  const al = [
    ['a)','A CONTRATADA declara conhecer e se compromete a cumprir todos os princípios e regras da Lei 13.709 de 2018 (\u201cLGPD\u201d), suas alterações e regulamentos subsequentes que disponham sobre privacidade e proteção de dados pessoais no Brasil que venham a ser editados pela Autoridade Nacional de Proteção de Dados Pessoais (\u201cANPD\u201d).'],
    ['b)','Obriga-se a CONTRATADA a manter os dados pessoais confidenciais, assegurando que o acesso seja estritamente limitado àqueles indivíduos que precisam acessá-lo.'],
    ['c)','A CONTRATADA deve manter o registro de todas as operações de tratamento de Dados Pessoais, atendendo o exigido pela legislação e pela regulamentação vigente.'],
    ['d)','A CONTRATADA obriga-se a utilizar os dados pessoais exclusivamente para as finalidades previstas no objeto do Contrato, nos termos das instruções emitidas pela CONTRATANTE, sendo vedado o compartilhamento com terceiros, mesmo que de forma anonimizada, salvo mediante autorização prévia, expressa e por escrito da CONTRATANTE, controladora dos dados pessoais.'],
    ['e)','Caso a CONTRATADA seja obrigada a transferir ou divulgar qualquer Dado Pessoal tratado em nome da CONTRATANTE em razão de ordem administrativa ou judicial, deverá informar a CONTRATANTE em até 24 (vinte e quatro) horas, comprometendo-se as Partes a cooperar para limitar a extensão de tal transferência ou divulgação.'],
    ['f)','A CONTRATADA apenas poderá realizar a transferência internacional dos Dados Pessoais quando o compartilhamento for necessário para atender as finalidades legítimas que justificaram o compartilhamento e desde que em acordo com as exigências legais sobre proteção de dados pessoais.'],
    ['g)','A CONTRATADA garante à CONTRATANTE que, após atingida a finalidade que fundamentou o tratamento dos Dados Pessoais, estes serão descartados, exceto quando a retenção for necessária para o cumprimento de obrigação legal ou regulatória.'],
    ['h)','A CONTRATADA reconhece que deve cooperar com a CONTRATANTE sempre que necessário para viabilizar o exercício dos direitos de titulares previstos na legislação sobre proteção de dados pessoais.'],
    ['i)','A CONTRATADA obriga-se a implementar medidas técnicas e de segurança para resguardar o acesso aos Dados Pessoais, responsabilizando-se por todos os danos eventualmente causados em virtude do tratamento, ressarcindo integralmente a CONTRATANTE por quaisquer prejuízos e/ou penalidades resultantes. Obriga-se ainda a demonstrar conformidade à legislação, autorizando a CONTRATANTE a realizar auditorias mediante prévia e expressa autorização.'],
    ['j)','Na hipótese de questionamento à CONTRATANTE por autoridades públicas ou ação judicial relacionada à proteção de dados por violação causada culposa ou dolosamente pela CONTRATADA, esta assumirá por sua conta a defesa, mantendo a CONTRATANTE indene quanto a custas, sanções e honorários advocatícios.'],
    ['k)','A CONTRATADA obriga-se a comunicar à CONTRATANTE quaisquer Incidentes de segurança de Dados Pessoais, potenciais ou efetivos, em até 48 (quarenta e oito) horas após a ocorrência, colaborando com informações e medidas para mitigar os prejuízos.'],
    ['l)','A CONTRATADA entende e concorda que os serviços objeto do Contrato envolvem o tratamento de dados considerados Dados Pessoais sensíveis, devendo tratá-los conforme as instruções da CONTRATANTE e em estrita conformidade às exigências legais, garantindo a segurança adequada.'],
    ['m)','A CONTRATADA entende e concorda que os serviços podem envolver o tratamento de Dados Pessoais de crianças e adolescentes, devendo tratá-los em estrita conformidade às exigências legais e garantindo a observância do melhor interesse da criança e do adolescente.'],
    ['n)','A CONTRATADA garante que apenas realizará a coleta de Dados Pessoais de crianças e adolescentes em razão da execução deste instrumento, mediante o consentimento prévio, expresso e específico dos pais e/ou responsável legal, nos termos da LGPD, se a extração de dados for de fonte privada.'],
    ['o)','Considerando que o objeto do Contrato inclui a provisão de sistemas e/ou infraestrutura de tecnologia da informação (a \u201cPlataforma\u201d), que pode operacionalizar o tratamento de Dados Pessoais, a CONTRATADA garante que: (i) as Plataformas estão adequadas à regulamentação, melhores práticas e leis de proteção de dados, em especial a LGPD; (ii) estão em conformidade com as normas e políticas da CONTRATANTE em matéria de proteção de dados e segurança da informação; (iii) têm o dever de garantir a segurança e a adequada gestão dos Dados Pessoais; e (iv) devem possibilitar à CONTRATANTE o exercício dos direitos dos titulares previstos na legislação.'],
  ];
  for (const [a,t] of al) out.push(new Paragraph({ spacing:{after:100}, alignment:AlignmentType.JUSTIFIED, indent:{left:360}, children:[ new TextRun({text:a+' ',bold:true,size:22}), R(t) ] }));
  return out;
}

// ---------- bloco de assinaturas (página própria) ----------
function blocoAssinaturas(D) {
  const out = [];
  const linha = '______________________________________';
  const linhaT = '________________________________';
  out.push(new Paragraph({ children:[ new PageBreak() ] }));
  out.push(new Paragraph({ spacing:{after:360}, alignment:AlignmentType.JUSTIFIED, children:[
    R('E, por assim se acharem justas e contratadas, as partes assinam o presente Contrato, na presença de duas testemunhas, reconhecendo a validade das assinaturas digital e eletrônica, inclusive aquelas que não utilizem certificados ou utilizem certificados não emitidos pela ICP – Brasil, de modo que o presente documento poderá ser assinado por quaisquer destes meios, sendo considerados, desde já, verdadeiros, válidos e eficazes para todos os efeitos, na forma preconizada pela Medida Provisória n.º 2.200-2/2001, em vigor no Brasil.')
  ]}));
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

// ---------- montagem principal ----------
function build(D) {
  const isClube = D.perfil === 'clube';
  const papelParte = isClube ? 'CONTRATANTE' : 'CONTRATANTE';
  const k = [];

  k.push(H('INSTRUMENTO PARTICULAR DE LICENÇA DE USO DO SOFTWARE FOOTLINK'));

  // Partes
  k.push(P([ B(`CONTRATANTE: ${D.cliente}, `), R(`pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${D.cnpj}, com endereço à ${D.endereco}, neste ato representada na forma prevista em seu Estatuto Social`), (D.repLegal? R(`, por ${D.repLegal}`):R('')), R(', adiante denominada '), B('“CONTRATANTE”;') ]));
  k.push(P([ B('CONTRATADA: FOOTURE PRODUTORA DE CONTEUDO, SOFTWARE E SERVICOS LTDA, '), R('pessoa jurídica de direito privado, inscrita no CNPJ/MF sob nº 32.527.841/0001-48, com sede na cidade de Porto Alegre – RS, na Rua Dr. Barbosa Gonçalves 69, bairro Chácara das Pedras, neste ato representada na forma prevista em seu Estatuto Social, adiante denominada como '), B('“CONTRATADA”;') ]));
  k.push(P('Ajustam as partes, de mútuo e comum acordo, o presente Contrato de Licenciamento de Software, o qual será regido nos seguintes termos e condições abaixo descritas:'));

  // Objeto
  k.push(H('DO OBJETO'));
  let objeto = 'Faz parte do objeto do presente contrato a (i) comercialização da Licença de Uso temporária e não exclusiva do software de gerenciamento e gestão de atletas de futebol, doravante denominado “FOOTLINK”';
  if (D.api) objeto += '; e (ii) comercialização da Licença de Acesso temporário da Interface de Programação de Aplicação/Application Programming Interface (API) do software FOOTLINK, que dará acesso a dados de competições, atletas monitorados, atletas inseridos pela organização, avaliações, relatórios e projetos';
  objeto += '.';
  k.push(P([ B('CLÁUSULA PRIMEIRA: '), R(objeto) ]));
  if (isClube) k.push(P([ B('Parágrafo 1º: '), R('A CONTRATADA garante que as funcionalidades descritas na Cláusula Sexta serão mantidas durante todo o período de vigência do contrato, não podendo ser suprimidas ou reduzidas. Qualquer alteração significativa deverá ser previamente comunicada e dependerá da anuência expressa do CONTRATANTE. Fica ressalvada a possibilidade de suspensão temporária nas hipóteses da Cláusula Nona.') ]));

  // PI
  k.push(H('DA PROPRIEDADE INTELECTUAL'));
  k.push(P([ B('CLÁUSULA SEGUNDA: '), R('O CONTRATANTE reconhece como da CONTRATADA todos os direitos concernentes ao software FOOTLINK. Aplicam-se, adicionalmente, as regras estabelecidas na Lei 9.609/98 para regular as demais normas a respeito da titularidade da propriedade intelectual decorrente do software FOOTLINK de titularidade da CONTRATADA.') ]));
  k.push(P([ B('Parágrafo 1º: '), R('Todos os direitos autorais e de propriedade intelectual do software FOOTLINK e de obras derivadas são e permanecerão sendo de propriedade única e exclusiva da CONTRATADA, sendo concedida ao CONTRATANTE apenas a licença temporária de uso, onerosa e não exclusiva, nos termos deste Contrato.') ]));
  k.push(P([ B('Parágrafo 2º: '), R('Todas as modificações, melhorias, correções e novas versões do software FOOTLINK ficarão incorporadas ao software e sujeitas a este Contrato, podendo ser comercializadas pela CONTRATADA a terceiros.') ]));
  k.push(P([ B('Parágrafo 3º: '), R('É vedado ao CONTRATANTE copiar, alterar, desmontar, descompilar, efetuar engenharia reversa ou obter os códigos-fonte do software FOOTLINK, sob pena de responder pelas perdas e danos que der causa.') ]));

  // Suporte
  k.push(H('DO SUPORTE TÉCNICO'));
  k.push(P([ B('CLÁUSULA TERCEIRA: '), R('A CONTRATADA se obriga, durante a vigência, a conceder pleno suporte ao CONTRATANTE para utilização do FOOTLINK'+(D.api?' e da API':'')+'.') ]));
  const sla = isClube
    ? 'a CONTRATADA compromete-se a manter um SLA de disponibilidade mínima de 98% (noventa e oito por cento) ao ano'
    : 'a CONTRATADA compromete-se a manter um SLA de disponibilidade anual o mais elevado possível';
  k.push(P([ B('Parágrafo 2º: '), R(`Não existindo garantia integral de disponibilidade de 100% do tempo, ${sla}, ressalvadas manutenções, intervenções de segurança e suspensões por determinação de autoridades ou descumprimento contratual.`) ]));
  const canais = isClube ? ', através do WhatsApp nº (51) 9782-3228 e do e-mail support@footlink.app' : '';
  k.push(P([ B('CLÁUSULA QUARTA: '), R(`O suporte será prestado por meio das linhas de comunicação e atendimento online${canais}.`) ]));
  k.push(P([ B('CLÁUSULA QUINTA: '), R('O suporte será prestado pela CONTRATADA através de seus sócios, empregados, estagiários e, eventualmente, profissionais especialmente contratados.') ]));

  // Preço e licenças
  k.push(H('DO PREÇO E DAS LICENÇAS'));
  k.push(P([ B('CLÁUSULA SEXTA: '), R('A configuração dos serviços do software FOOTLINK, ora contratado, é a detalhada abaixo:') ]));
  k.push(featTable(D.plano, D.features));
  k.push(P([ B('Parágrafo 1º: '), R('As licenças serão distribuídas em 2 níveis de acesso, “gerencial” e “analista”, conforme lista enviada pelo '+(isClube?'clube':'cliente')+' após a assinatura.') ]));
  k.push(P([ B('Parágrafo 2º: '), R('Não excedendo o número de licenças contratadas, a alteração de níveis, inclusão e troca de logins poderão ser feitas pelo CONTRATANTE a qualquer momento, sem custo.') ]));
  k.push(P([ B('Parágrafo 3º: '), R(`Caso o CONTRATANTE queira contratar mais licenças, será acrescido ao pagamento mensal o valor de ${D.licAdicional}/mês por licença, cobrado na próxima fatura em aberto.`) ]));

  // Valor
  if (D.pagamento === 'parcelado') {
    if (D.api && D.mensalApi && D.mensalSoftware) {
      // Valor composto (API + software), padrão Corinthians
      k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, o CONTRATANTE pagará à CONTRATADA o valor total de ${D.total}, em 12 (doze) parcelas mensais de ${D.mensal}, sendo cada parcela composta por: (i) ${D.mensalApi} referentes à utilização da API; e (ii) ${D.mensalSoftware} referentes à licença de uso do software FOOTLINK.`) ]));
      k.push(P([ B('Parágrafo 1º: '), R(`Fica estabelecido que, para cada parcela mensal, serão emitidos boletos bancários distintos, sendo um boleto no valor de ${D.mensalApi} relativo à API e outro no valor de ${D.mensalSoftware} relativo ao software FOOTLINK.`) ]));
    } else {
      k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, o CONTRATANTE pagará à CONTRATADA o valor total de ${D.total}, parcelados em 12 pagamentos fixos de ${D.mensal} ao mês a título de Licença de Uso do software FOOTLINK.`) ]));
      if (!isClube) k.push(P([ B('Parágrafo 1º: '), R('Para fins deste contrato, a obrigação financeira é assumida de forma integral pelo período de 12 (doze) meses, não se confundindo com a forma de pagamento em parcelamento, mera facilidade concedida ao CONTRATANTE.') ]));
    }
    k.push(P([ B('CLÁUSULA OITAVA: '), R(`Os pagamentos se darão através de boleto bancário, com vencimento até o dia ${D.diaVenc||'10'} de cada mês, sendo o primeiro vencimento em ${D.primeiroVenc}.`) ]));
    k.push(parcTable(D.parcelas));
  } else {
    k.push(P([ B('CLÁUSULA SÉTIMA: '), R(`Pela configuração e serviços descritos acima, o CONTRATANTE pagará à CONTRATADA o valor de ${D.total} em parcela única a título de Licença de Uso do software FOOTLINK.`) ]));
    k.push(P([ B('CLÁUSULA OITAVA: '), R(`O pagamento se dará através de boleto bancário, com vencimento em ${D.vencAvista||'30 (trinta) dias corridos contados a partir da data de envio do boleto à CONTRATANTE'}.`) ]));
  }

  // Mora
  k.push(P([ B('CLÁUSULA NONA: '), R('O não pagamento no prazo implicará juros de mora de 1% ao mês e multa de 2%, incidentes sobre o valor em atraso, com correção pelo IGPM-FGV. O inadimplemento superior a 30 dias autorizará o cancelamento da licença e a suspensão das senhas, a critério da CONTRATADA, sem prejuízo da rescisão prevista na Cláusula Décima Segunda.') ]));

  // Divulgação (opcional)
  if (D.divulga) k.push(P([ B('CLÁUSULA DÉCIMA: '), R('O CONTRATANTE autoriza a CONTRATADA a publicar a prestação dos serviços como referência em suas redes sociais (@FootureFC, @footlink.app, @Footlink), desde que o conteúdo seja prévia e expressamente aprovado pelo CONTRATANTE.') ]));

  // Vigência e rescisão
  k.push(H('DA VIGÊNCIA E DA RESCISÃO'));
  k.push(P([ B('CLÁUSULA DÉCIMA PRIMEIRA: '), R(`O presente contrato é celebrado por prazo determinado de 12 (doze) meses, iniciando-se em ${D.vigIni} e encerrando-se em ${D.vigFim}, devendo as partes celebrar novo instrumento havendo interesse na continuidade.`) ]));
  k.push(P([ B('CLÁUSULA DÉCIMA SEGUNDA: '), R(D.multaTexto) ]));
  k.push(P([ B('Parágrafo 1º: '), R('O CONTRATANTE que pretender rescindir deverá formalizar por escrito ao e-mail cancelamentos@footure.com.br, com 30 dias de antecedência.') ]));

  // Confidencialidade + LGPD
  k.push(H('DA CONFIDENCIALIDADE E EXCLUSIVIDADE'));
  k.push(P([ B('CLÁUSULA DÉCIMA TERCEIRA: '), R('A CONTRATADA obriga-se a manter em estrito sigilo as informações confidenciais recebidas, e o CONTRATANTE a não divulgar as metodologias e tecnologias da CONTRATADA, mantendo sigilo das informações recebidas.') ]));
  k.push(P([ B('Parágrafo 1º: '), R('As Partes tratarão como sigilosas todas as informações confidenciais a que tiverem acesso, em especial dados pessoais e informações técnicas, estratégicas, econômicas ou de mercado.') ]));
  k.push(P([ B('Parágrafo 2º: '), R('A obrigação de sigilo perdurará durante a vigência e pelo prazo de 05 (cinco) anos a contar do término.') ]));
  if (isClube) {
    k.push(...lgpdReforcada());
  } else {
    k.push(P([ B('Parágrafo 5º: '), R('A CONTRATANTE declara expresso consentimento para que a CONTRATADA colete, trate e compartilhe os dados necessários ao cumprimento do contrato, nos termos do Art. 7º, incisos II, V, IX e X da LGPD. Outros dados poderão ser coletados conforme termo de consentimento específico.') ]));
  }
  k.push(P([ B('CLÁUSULA DÉCIMA QUARTA: '), R('O presente contrato não implica qualquer exclusividade entre as partes, podendo cada qual contratar serviços semelhantes junto a terceiros.') ]));

  // Disposições gerais
  k.push(H('DAS DISPOSIÇÕES GERAIS'));
  k.push(P([ B('CLÁUSULA DÉCIMA QUINTA: '), R('Havendo contradição entre este instrumento e a Proposta Comercial, prevalece este contrato.') ]));
  k.push(P([ B('CLÁUSULA DÉCIMA SEXTA: '), R('As informações do FOOTLINK são obtidas de fontes oficiais e não oficiais públicas lícitas; eventual incorreção não é responsabilidade da CONTRATADA nem justifica rescisão.') ]));
  k.push(P([ B('CLÁUSULA DÉCIMA SÉTIMA: '), R('Encerrada a vigência sem prorrogação, os dados inseridos serão entregues em arquivo “csv” e, após, excluídos com as senhas e logins.') ]));
  k.push(P([ B('CLÁUSULA DÉCIMA OITAVA: '), R('Este ajuste somente poderá ser alterado por instrumento escrito assinado pelas partes, constituindo o entendimento completo entre elas.') ]));

  // Foro
  k.push(H('DO FORO'));
  k.push(P([ B('CLÁUSULA DÉCIMA NONA: '), R(`Elegem as partes o Foro Central da Comarca de ${D.foro}, para dirimir quaisquer questões oriundas do presente contrato.`) ]));

  // Assinaturas (página própria)
  k.push(...blocoAssinaturas(D));

  return new Document({ sections: [{
    properties: { page: { size:{width:11906,height:16838}, margin:{top:1134,bottom:1134,left:1134,right:1134} } },
    headers: { default: buildHeader() },
    footers: { default: buildFooter(D) },
    children: k }] });
}

// ---------- CLI ----------
if (require.main === module) {
  const dados = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const out = process.argv[3] || '/mnt/user-data/outputs/contrato.docx';
  Packer.toBuffer(build(dados)).then(b => { fs.writeFileSync(out, b); console.log('gerado:', out); });
}
module.exports = { build };
