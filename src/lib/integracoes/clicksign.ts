// Fase 3 (PROMPT.md seção 8) — integração real com a Clicksign (API v3,
// JSON:API, developer.clicksign.com). Fluxo: cria envelope -> sobe o .docx
// como documento -> cria um signatário + 2 requirements (assinatura +
// autenticação por e-mail) por pessoa -> ativa o envelope (dispara os
// e-mails). O webhook que fecha o ciclo (enviado_para_assinatura -> assinado)
// vive em src/app/api/webhooks/clicksign/route.ts.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { nomeArquivoContrato } from "@/lib/contratos/nomeArquivo";

type Supa = SupabaseClient<Database>;

export interface ContratoParaAssinatura {
  contratoId: string;
  pedidoId: string;
  arquivoPath: string;
}

// "legal_representative"/"witness" são valores do catálogo de qualificações da
// Clicksign (/reference/tipos-de-requisitos-de-qualificacao) — combinado com o
// usuário: representantes (do cliente e da Footure) assinam como
// legal_representative, testemunhas (dos dois lados) como witness.
type PapelAssinatura = "legal_representative" | "witness";

interface SignatarioEnvelope {
  nomeCompleto: string;
  email: string;
  cpf: string;
  papel: PapelAssinatura;
}

function baseUrl(): string {
  const url = process.env.CLICKSIGN_API_URL;
  if (!url) throw new Error("CLICKSIGN_API_URL não configurada.");
  return url.replace(/\/+$/, "");
}

function accessToken(): string {
  const token = process.env.CLICKSIGN_ACCESS_TOKEN;
  if (!token) throw new Error("CLICKSIGN_ACCESS_TOKEN não configurado.");
  return token;
}

async function clicksign<T>(path: string, init: { method: "GET" | "POST" | "PATCH"; body?: unknown }): Promise<T> {
  const resposta = await fetch(`${baseUrl()}/api/v3${path}`, {
    method: init.method,
    headers: {
      Authorization: accessToken(),
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const json = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new Error(`Clicksign ${init.method} ${path} retornou ${resposta.status}: ${JSON.stringify(json)}`);
  }
  return json as T;
}

// CPF é texto livre no formulário (sem máscara) — normaliza pro formato
// pontuado que os exemplos da doc da Clicksign usam (123.321.123-40), em vez
// de confiar em como o vendedor digitou.
function formatarCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11) {
    throw new Error(`CPF "${cpf}" inválido (esperado 11 dígitos, recebido ${digitos.length}).`);
  }
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
}

async function buscarSignatariosDoPedido(supabase: Supa, pedidoId: string): Promise<SignatarioEnvelope[]> {
  const [{ data: signatariosCliente }, { data: repsFooture }, { data: testemunhasFooture }] = await Promise.all([
    supabase
      .from("pedido_signatarios")
      .select("tipo, signatarios_cliente(nome_completo, email, cpf)")
      .eq("pedido_id", pedidoId),
    supabase.from("pedido_representantes_footure").select("representantes_footure(nome, email, cpf)").eq("pedido_id", pedidoId),
    supabase.from("pedido_testemunhas_footure").select("nome_completo, email, cpf").eq("pedido_id", pedidoId),
  ]);

  const doCliente: SignatarioEnvelope[] = (signatariosCliente ?? [])
    .map((r) => {
      const s = r.signatarios_cliente as unknown as { nome_completo: string; email: string; cpf: string } | null;
      if (!s) return null;
      const papel: PapelAssinatura = r.tipo === "representante_legal" ? "legal_representative" : "witness";
      return { nomeCompleto: s.nome_completo, email: s.email, cpf: s.cpf, papel };
    })
    .filter((s): s is SignatarioEnvelope => !!s);

  const daFooture: SignatarioEnvelope[] = (repsFooture ?? []).map((r) => {
    const rep = r.representantes_footure as unknown as { nome: string; email: string | null; cpf: string | null } | null;
    if (!rep) throw new Error("Representante da Footure vinculado ao pedido não foi encontrado.");
    if (!rep.email || !rep.cpf) {
      throw new Error(`Representante da Footure "${rep.nome}" está sem e-mail/CPF cadastrado — obrigatório para assinatura via Clicksign.`);
    }
    return { nomeCompleto: rep.nome, email: rep.email, cpf: rep.cpf, papel: "legal_representative" as const };
  });

  const testemunhasDaFooture: SignatarioEnvelope[] = (testemunhasFooture ?? []).map((t) => ({
    nomeCompleto: t.nome_completo,
    email: t.email,
    cpf: t.cpf,
    papel: "witness" as const,
  }));

  return [...doCliente, ...daFooture, ...testemunhasDaFooture];
}

export async function enviarParaAssinatura(supabase: Supa, contrato: ContratoParaAssinatura): Promise<{ envelopeId: string }> {
  const { data: arquivo, error: erroDownload } = await supabase.storage.from("contratos").download(contrato.arquivoPath);
  if (erroDownload || !arquivo) throw new Error(`Falha ao baixar o contrato do Storage: ${erroDownload?.message}`);
  const buffer = Buffer.from(await arquivo.arrayBuffer());

  const { data: contratoRow, error: erroContrato } = await supabase
    .from("contratos")
    .select("versao, gerado_em")
    .eq("id", contrato.contratoId)
    .single();
  if (erroContrato || !contratoRow) throw new Error(`Contrato ${contrato.contratoId} não encontrado: ${erroContrato?.message}`);

  const { data: pedido, error: erroPedido } = await supabase
    .from("pedidos")
    .select("cliente_id")
    .eq("id", contrato.pedidoId)
    .single();
  if (erroPedido || !pedido) throw new Error(`Pedido ${contrato.pedidoId} não encontrado: ${erroPedido?.message}`);

  const { data: cliente, error: erroCliente } = await supabase
    .from("clientes")
    .select("razao_social")
    .eq("id", pedido.cliente_id)
    .single();
  if (erroCliente || !cliente) throw new Error(`Cliente do pedido ${contrato.pedidoId} não encontrado: ${erroCliente?.message}`);

  const signatarios = await buscarSignatariosDoPedido(supabase, contrato.pedidoId);
  if (signatarios.length === 0) {
    throw new Error("Nenhum signatário encontrado para este pedido — não é possível criar o envelope na Clicksign.");
  }

  const nomeDocumento = nomeArquivoContrato(cliente.razao_social, contratoRow.gerado_em, contratoRow.versao);

  const envelope = await clicksign<{ data: { id: string } }>("/envelopes", {
    method: "POST",
    body: {
      data: {
        type: "envelopes",
        attributes: { name: nomeDocumento, locale: "pt-BR", auto_close: true, block_after_refusal: true },
      },
    },
  });
  const envelopeId = envelope.data.id;

  // Confirmado via teste real no sandbox: `content_base64` exige um Data URI
  // completo (a API recusa base64 puro com "Formatação do campo inválida").
  const dataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString("base64")}`;
  const documento = await clicksign<{ data: { id: string } }>(`/envelopes/${envelopeId}/documents`, {
    method: "POST",
    body: {
      data: {
        type: "documents",
        attributes: { filename: nomeDocumento, content_base64: dataUri },
      },
    },
  });
  const documentId = documento.data.id;

  for (const signatario of signatarios) {
    const signer = await clicksign<{ data: { id: string } }>(`/envelopes/${envelopeId}/signers`, {
      method: "POST",
      body: {
        data: {
          type: "signers",
          attributes: {
            name: signatario.nomeCompleto,
            email: signatario.email,
            has_documentation: true,
            documentation: formatarCpf(signatario.cpf),
          },
        },
      },
    });
    const signerId = signer.data.id;

    await clicksign(`/envelopes/${envelopeId}/requirements`, {
      method: "POST",
      body: {
        data: {
          type: "requirements",
          attributes: { action: "agree", role: signatario.papel },
          relationships: {
            document: { data: { type: "documents", id: documentId } },
            signer: { data: { type: "signers", id: signerId } },
          },
        },
      },
    });

    await clicksign(`/envelopes/${envelopeId}/requirements`, {
      method: "POST",
      body: {
        data: {
          type: "requirements",
          attributes: { action: "provide_evidence", auth: "email" },
          relationships: {
            document: { data: { type: "documents", id: documentId } },
            signer: { data: { type: "signers", id: signerId } },
          },
        },
      },
    });
  }

  await clicksign(`/envelopes/${envelopeId}`, {
    method: "PATCH",
    body: { data: { id: envelopeId, type: "envelopes", attributes: { status: "running" } } },
  });

  // Ativar o envelope (acima) NÃO dispara o e-mail sozinho — confirmado testando no
  // sandbox (envelope "running", 0 e-mails enviados). É preciso notificar
  // explicitamente depois de ativar.
  await clicksign(`/envelopes/${envelopeId}/notifications`, {
    method: "POST",
    body: { data: { type: "notifications", attributes: {} } },
  });

  await supabase.from("contratos").update({ clicksign_envelope_id: envelopeId }).eq("id", contrato.contratoId);

  return { envelopeId };
}
