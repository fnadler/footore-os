// Fase 3 (PROMPT.md seção 8) — webhook real da Clicksign. Assinado com HMAC
// SHA-256 (header `Content-Hmac: sha256=<hex>`, calculado sobre o corpo BRUTO
// da requisição — https://developers.clicksign.com "Segurança de Webhooks").
// Só o evento `document_closed` (todos assinaram) importa aqui: baixa o PDF
// assinado, guarda no Storage e move ENVIADO_PARA_ASSINATURA -> ASSINADO.
//
// `document.key` no payload é o mesmo id que chamamos de `clicksign_envelope_id`
// — a Clicksign usa nomenclatura da API clássica (pré-v3) no webhook, mas os
// campos (auto_close, locale, remind_interval, block_after_refusal) batem
// exatamente com o que mandamos em POST /envelopes.
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

function assinaturaValida(corpoBruto: string, cabecalho: string | null): boolean {
  const secret = process.env.CLICKSIGN_WEBHOOK_SECRET;
  if (!secret || !cabecalho) return false;

  const prefixo = "sha256=";
  if (!cabecalho.startsWith(prefixo)) return false;

  const recebido = Buffer.from(cabecalho.slice(prefixo.length), "hex");
  const esperado = Buffer.from(createHmac("sha256", secret).update(corpoBruto).digest("hex"), "hex");
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

export async function POST(request: Request) {
  const corpoBruto = await request.text();

  if (!assinaturaValida(corpoBruto, request.headers.get("content-hmac"))) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  const payload = JSON.parse(corpoBruto);
  if (payload?.event?.name !== "document_closed") {
    return NextResponse.json({ status: "evento ignorado" }, { status: 200 });
  }

  const documento = payload.document;
  const envelopeId: string | undefined = documento?.key;
  if (!envelopeId) {
    return NextResponse.json({ error: "document.key ausente no payload." }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: contrato } = await supabase
    .from("contratos")
    .select("id, pedido_id, versao")
    .eq("clicksign_envelope_id", envelopeId)
    .single();

  // Envelope que não reconhecemos (ex.: sobra de teste manual) — ignora sem erro,
  // não é motivo pra Clicksign ficar retentando a entrega.
  if (!contrato) {
    return NextResponse.json({ status: "envelope não reconhecido, ignorado" }, { status: 200 });
  }

  const { data: pedido } = await supabase.from("pedidos").select("status").eq("id", contrato.pedido_id).single();
  if (pedido?.status === "assinado") {
    return NextResponse.json({ status: "já processado" }, { status: 200 });
  }

  const urlAssinado: string | undefined = documento?.downloads?.signed_file_url;
  if (urlAssinado) {
    try {
      const respostaArquivo = await fetch(`${process.env.CLICKSIGN_API_URL}${urlAssinado}`, {
        headers: { Authorization: process.env.CLICKSIGN_ACCESS_TOKEN! },
      });
      if (respostaArquivo.ok) {
        const bufferAssinado = Buffer.from(await respostaArquivo.arrayBuffer());
        const pathAssinado = `${contrato.pedido_id}/v${contrato.versao}-assinado.pdf`;
        await supabase.storage
          .from("contratos")
          .upload(pathAssinado, bufferAssinado, { contentType: "application/pdf", upsert: true });
        await supabase.from("contratos").update({ arquivo_assinado_path: pathAssinado }).eq("id", contrato.id);
      } else {
        console.error(`[webhook clicksign] falha ao baixar arquivo assinado (${respostaArquivo.status}), seguindo sem arquivar.`);
      }
    } catch (erro) {
      // Não trava a transição de status por causa de um problema secundário
      // de arquivamento — o mesmo padrão usado no stub do Bling em acoes.ts.
      console.error("[webhook clicksign] erro ao baixar/guardar arquivo assinado:", erro);
    }
  }

  const { error: erroTransicao } = await supabase.rpc("registrar_transicao", {
    p_pedido_id: contrato.pedido_id,
    p_para: "assinado",
    p_comentario: "Assinatura concluída na Clicksign (webhook).",
  });
  if (erroTransicao) {
    return NextResponse.json({ error: erroTransicao.message }, { status: 500 });
  }

  return NextResponse.json({ status: "processado" }, { status: 200 });
}
