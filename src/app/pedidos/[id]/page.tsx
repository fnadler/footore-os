import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigirPapel } from "@/lib/auth/session";
import { buscarPedidoDetalhe } from "@/lib/pedidos/consultas";
import { gerarAlertas } from "@/lib/validacoes/pedido";
import { detectarPlanoLegado } from "@/lib/contratos/legado";
import { ROTULO_MEIO_PAGAMENTO } from "@/lib/contratos/meioPagamento";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotuloStatus } from "@/components/rotulo-status";
import { PainelAlertas } from "@/components/pedido/painel-alertas";
import { AcoesPedido } from "@/components/pedido/acoes-pedido";
import { UploadNovaVersao } from "@/components/pedido/upload-nova-versao";

function formatarMoeda(v: number | null) {
  if (v == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}
function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export default async function DetalhePedidoPage({ params }: PageProps<"/pedidos/[id]">) {
  const { id } = await params;
  const sessao = await exigirPapel("vendedor", "juridico", "admin");
  const supabase = await createClient();

  const detalhe = await buscarPedidoDetalhe(supabase, id);
  if (!detalhe) notFound();
  const { pedido, transicoes, contratos, signatarios, representantesFooture, testemunhasFooture } = detalhe;

  const cliente = pedido.clientes as unknown as {
    razao_social: string;
    cnpj: string;
    endereco: string;
    tipo: "clube" | "agente";
    foro_preferencial: string;
  } | null;
  const vendedorNome = (pedido.profiles as unknown as { nome: string } | null)?.nome;

  const representantesLegais = signatarios.filter((s) => s.tipo === "representante_legal");
  const testemunhasCliente = signatarios.filter((s) => s.tipo === "testemunha");

  const legado = detectarPlanoLegado(pedido.perfil, pedido.plano_legado_nome_original ?? "");
  const alertas = gerarAlertas({
    valorMensal: pedido.valor_mensal,
    valorTotal: pedido.valor_total,
    formaPagamento: pedido.forma_pagamento,
    numeroParcelas: pedido.numero_parcelas ?? undefined,
    licencasGratuitas: pedido.licencas_gratuitas,
    foro: pedido.foro,
    temRepresentanteLegal: representantesLegais.length > 0,
    planoLegadoDetectado: pedido.plano_legado_detectado,
    planoLegadoNomeOriginal: legado?.nomeOriginal ?? pedido.plano_legado_nome_original,
    planoLegadoConfirmado: pedido.plano_legado_detectado,
  });

  const contratosComUrl = await Promise.all(
    contratos.map(async (c) => {
      const { data } = await supabase.storage.from("contratos").createSignedUrl(c.arquivo_path, 3600);
      return { ...c, url: data?.signedUrl ?? null };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{cliente?.razao_social ?? "Pedido"}</h1>
          <p className="text-sm text-muted-foreground">
            {pedido.perfil} · {pedido.plano} · vendedor: {vendedorNome ?? "—"}
          </p>
        </div>
        <RotuloStatus status={pedido.status} />
      </div>

      <PainelAlertas alertas={alertas} />
      {pedido.geracao_contrato_erro && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Última tentativa de geração falhou: {pedido.geracao_contrato_erro}
        </p>
      )}

      <AcoesPedido pedidoId={pedido.id} status={pedido.status} papel={sessao.papel} donoDoRascunho={pedido.vendedor_id === sessao.id} />

      {pedido.status === "em_revisao_juridica" && (sessao.papel === "juridico" || sessao.papel === "admin") && (
        <UploadNovaVersao pedidoId={pedido.id} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>
              <strong>Razão social:</strong> {cliente?.razao_social}
            </p>
            <p>
              <strong>CNPJ:</strong> {cliente?.cnpj}
            </p>
            <p>
              <strong>Endereço:</strong> {cliente?.endereco}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produto e valores</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p>
              <strong>Produtos:</strong> {pedido.produtos.includes("api") ? "Footlink + API" : "Footlink"}
            </p>
            <p>
              <strong>Licenças:</strong> {pedido.licencas_pagas} pagas
              {pedido.licencas_gratuitas > 0 ? ` + ${pedido.licencas_gratuitas} gratuita(s)` : ""}
            </p>
            <p>
              <strong>Forma de pagamento:</strong>{" "}
              {pedido.forma_pagamento === "avista" ? "À vista" : `Parcelado (${pedido.numero_parcelas}x)`} ·{" "}
              {ROTULO_MEIO_PAGAMENTO[pedido.meio_pagamento]}
            </p>
            <p>
              <strong>Valor da parcela:</strong> {formatarMoeda(pedido.valor_mensal)}
            </p>
            <p>
              <strong>Valor total:</strong> {formatarMoeda(pedido.valor_total)}
            </p>
            {pedido.produtos.includes("api") && (
              <p>
                <strong>API / Software:</strong> {formatarMoeda(pedido.valor_mensal_api)} / {formatarMoeda(pedido.valor_mensal_software)}
              </p>
            )}
            <p>
              <strong>Vigência:</strong> {pedido.vigencia_inicio} a {pedido.vigencia_fim}
            </p>
            <p>
              <strong>Foro:</strong> {pedido.foro}
            </p>
            <p>
              <strong>Multa:</strong> {pedido.multa_texto}
            </p>
            {pedido.condicao_especial && (
              <p>
                <strong>Condição especial:</strong> {pedido.condicao_especial}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signatários</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="font-medium">Representantes legais do cliente</p>
              {representantesLegais.length === 0 && <p className="text-muted-foreground">Nenhum cadastrado.</p>}
              {representantesLegais.map((s, i) => {
                const sc = s.signatarios_cliente as unknown as { nome_completo: string; email: string; cpf: string } | null;
                return (
                  <p key={i}>
                    {sc?.nome_completo} — {sc?.email} — {sc?.cpf}
                  </p>
                );
              })}
            </div>
            <div>
              <p className="font-medium">Testemunhas do cliente</p>
              {testemunhasCliente.length === 0 && <p className="text-muted-foreground">Nenhuma cadastrada.</p>}
              {testemunhasCliente.map((s, i) => {
                const sc = s.signatarios_cliente as unknown as { nome_completo: string; email: string; cpf: string } | null;
                return <p key={i}>{sc?.nome_completo}</p>;
              })}
            </div>
            <div>
              <p className="font-medium">Representante(s) da Footure</p>
              {representantesFooture.length === 0 && <p className="text-muted-foreground">Nenhum selecionado.</p>}
              {representantesFooture.map((r, i) => (
                <p key={i}>{(r.representantes_footure as unknown as { nome: string } | null)?.nome}</p>
              ))}
            </div>
            <div>
              <p className="font-medium">Testemunhas da Footure</p>
              {testemunhasFooture.length === 0 && <p className="text-muted-foreground">Nenhuma cadastrada.</p>}
              {testemunhasFooture.map((t) => (
                <p key={t.id}>{t.nome_completo}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Versões do contrato</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {contratosComUrl.length === 0 && <p className="text-muted-foreground">Nenhum contrato gerado ainda.</p>}
            {contratosComUrl.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p>
                    Versão {c.versao} · {formatarData(c.gerado_em)}
                  </p>
                  {c.motivo_versao && <p className="text-xs text-muted-foreground">{c.motivo_versao}</p>}
                </div>
                {c.url && (
                  <a href={c.url} className="text-sm text-primary underline" target="_blank" rel="noreferrer">
                    Baixar
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          {transicoes.length === 0 && <p className="text-muted-foreground">Sem transições ainda.</p>}
          {transicoes.map((t) => (
            <div key={t.id} className="border-b pb-2 last:border-0">
              <p>
                <strong>{t.de ?? "criado"}</strong> → <strong>{t.para}</strong> · {(t.profiles as unknown as { nome: string } | null)?.nome} ·{" "}
                {formatarData(t.criado_em)}
              </p>
              {t.comentario && <p className="text-muted-foreground">{t.comentario}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
