import { notFound } from "next/navigation";
import { Building2, Package, Users, FileStack, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { exigirPapel } from "@/lib/auth/session";
import { buscarPedidoDetalhe } from "@/lib/pedidos/consultas";
import { gerarAlertas } from "@/lib/validacoes/pedido";
import { detectarPlanoLegado } from "@/lib/contratos/legado";
import { ROTULO_MEIO_PAGAMENTO } from "@/lib/contratos/meioPagamento";
import { RotuloStatus, ROTULO_STATUS } from "@/components/rotulo-status";
import { PainelAlertas } from "@/components/pedido/painel-alertas";
import { StepperPedido } from "@/components/pedido/stepper-pedido";
import { ProximaAcao } from "@/components/pedido/proxima-acao";
import { BlocoFormulario } from "@/components/pedido/bloco-formulario";
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
  const donoDoRascunho = pedido.vendedor_id === sessao.id;

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
          <h1 className="text-xl font-bold text-foreground">{cliente?.razao_social ?? "Pedido"}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {pedido.perfil} · {pedido.plano} · vendedor: {vendedorNome ?? "—"}
          </p>
        </div>
        <RotuloStatus status={pedido.status} />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <StepperPedido status={pedido.status} />
      </div>

      <ProximaAcao pedidoId={pedido.id} status={pedido.status} papel={sessao.papel} donoDoRascunho={donoDoRascunho} />

      <PainelAlertas alertas={alertas} />
      {pedido.geracao_contrato_erro && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          Última tentativa de geração falhou: {pedido.geracao_contrato_erro}
        </p>
      )}

      {pedido.status === "em_revisao_juridica" && (sessao.papel === "juridico" || sessao.papel === "admin") && (
        <UploadNovaVersao pedidoId={pedido.id} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BlocoFormulario numero={1} titulo="Cliente" icon={Building2}>
          <div className="flex flex-col gap-1 text-sm">
            <p>
              <strong>Razão social:</strong> {cliente?.razao_social}
            </p>
            <p>
              <strong>CNPJ:</strong> {cliente?.cnpj}
            </p>
            <p>
              <strong>Endereço:</strong> {cliente?.endereco}
            </p>
          </div>
        </BlocoFormulario>

        <BlocoFormulario numero={2} titulo="Produto e valores" icon={Package}>
          <div className="flex flex-col gap-1 text-sm">
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
          </div>
        </BlocoFormulario>

        <BlocoFormulario numero={3} titulo="Signatários" icon={Users}>
          <div className="flex flex-col gap-3 text-sm">
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
          </div>
        </BlocoFormulario>

        <BlocoFormulario numero={4} titulo="Versões do contrato" icon={FileStack}>
          <div className="flex flex-col gap-2 text-sm">
            {contratosComUrl.length === 0 && <p className="text-muted-foreground">Nenhum contrato gerado ainda.</p>}
            {contratosComUrl.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
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
          </div>
        </BlocoFormulario>
      </div>

      <BlocoFormulario numero={5} titulo="Linha do tempo" icon={History}>
        <div className="flex flex-col gap-2 text-sm">
          {transicoes.length === 0 && <p className="text-muted-foreground">Sem transições ainda.</p>}
          {transicoes.map((t) => (
            <div key={t.id} className="border-b border-border pb-2 last:border-0">
              <p>
                <strong>{t.de ? ROTULO_STATUS[t.de] : "criado"}</strong> → <strong>{ROTULO_STATUS[t.para]}</strong> ·{" "}
                {(t.profiles as unknown as { nome: string } | null)?.nome} · {formatarData(t.criado_em)}
              </p>
              {t.comentario && <p className="text-muted-foreground">{t.comentario}</p>}
            </div>
          ))}
        </div>
      </BlocoFormulario>
    </div>
  );
}
