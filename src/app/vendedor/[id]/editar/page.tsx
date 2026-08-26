import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigirPapel } from "@/lib/auth/session";
import { buscarPedidoDetalhe, listarClientes, listarRepresentantesFooture, listarSignatariosDoCliente } from "@/lib/pedidos/consultas";
import { PedidoForm, type DadosIniciaisPedido } from "@/components/pedido/pedido-form";

export default async function EditarPedidoPage({ params }: PageProps<"/vendedor/[id]/editar">) {
  const { id } = await params;
  const sessao = await exigirPapel("vendedor");
  const supabase = await createClient();

  const detalhe = await buscarPedidoDetalhe(supabase, id);
  if (!detalhe || detalhe.pedido.vendedor_id !== sessao.id) notFound();
  if (detalhe.pedido.status !== "rascunho") notFound();

  const [clientes, representantesFooture] = await Promise.all([
    listarClientes(supabase),
    listarRepresentantesFooture(supabase),
  ]);

  const signatariosPorCliente: Record<string, { id: string; nomeCompleto: string; email: string; cpf: string }[]> = {};
  await Promise.all(
    clientes.map(async (c) => {
      const signatarios = await listarSignatariosDoCliente(supabase, c.id);
      signatariosPorCliente[c.id] = signatarios.map((s) => ({ id: s.id, nomeCompleto: s.nome_completo, email: s.email, cpf: s.cpf }));
    }),
  );

  const { pedido, signatarios, representantesFooture: repsSelecionados, testemunhasFooture } = detalhe;

  const dadosIniciais: DadosIniciaisPedido = {
    clienteId: pedido.cliente_id,
    plano: pedido.plano,
    planoLegadoNomeOriginal: pedido.plano_legado_nome_original,
    planoLegadoConfirmado: pedido.plano_legado_detectado,
    incluiApi: pedido.produtos.includes("api"),
    licencasPagas: pedido.licencas_pagas,
    licencasGratuitas: pedido.licencas_gratuitas,
    formaPagamento: pedido.forma_pagamento,
    valorMensal: pedido.valor_mensal,
    valorTotal: pedido.valor_total,
    valorLicencaAdicional: pedido.valor_licenca_adicional ?? 0,
    valorMensalApi: pedido.valor_mensal_api ?? 0,
    valorMensalSoftware: pedido.valor_mensal_software ?? 0,
    primeiroPagamento: pedido.primeiro_pagamento,
    diaVencimento: pedido.dia_vencimento ?? 10,
    convencaoParcelas: pedido.convencao_parcelas,
    vigenciaInicio: pedido.vigencia_inicio,
    vigenciaFim: pedido.vigencia_fim,
    divulgaParceria: pedido.divulga_parceria,
    multaTipo: pedido.multa_tipo,
    multaTexto: pedido.multa_texto,
    foro: pedido.foro,
    condicaoEspecial: pedido.condicao_especial ?? "",
    representantesLegais: signatarios
      .filter((s) => s.tipo === "representante_legal" && s.signatarios_cliente)
      .map((s) => {
        const sc = s.signatarios_cliente as unknown as { id: string; nome_completo: string; email: string; cpf: string };
        return { id: sc.id, nomeCompleto: sc.nome_completo, email: sc.email, cpf: sc.cpf };
      }),
    testemunhasCliente: signatarios
      .filter((s) => s.tipo === "testemunha" && s.signatarios_cliente)
      .map((s) => {
        const sc = s.signatarios_cliente as unknown as { id: string; nome_completo: string; email: string; cpf: string };
        return { id: sc.id, nomeCompleto: sc.nome_completo, email: sc.email, cpf: sc.cpf };
      }),
    representantesFootureIds: repsSelecionados
      .map((r) => (r.representantes_footure as unknown as { id: string } | null)?.id)
      .filter((id): id is string => !!id),
    testemunhasFooture: testemunhasFooture.map((t) => ({ nomeCompleto: t.nome_completo, email: t.email, cpf: t.cpf })),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar pedido</h1>
      <PedidoForm
        pedidoId={pedido.id}
        clientes={clientes.map((c) => ({ id: c.id, tipo: c.tipo, razaoSocial: c.razao_social, cnpj: c.cnpj, endereco: c.endereco }))}
        signatariosPorCliente={signatariosPorCliente}
        representantesFooture={representantesFooture.map((r) => ({ id: r.id, nome: r.nome }))}
        dadosIniciais={dadosIniciais}
      />
    </div>
  );
}
