"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  aprovarPedidoAction,
  reprovarPedidoAction,
  tentarGerarNovamenteAction,
  liberarParaAssinaturaAction,
  rejeitarContratoAction,
  enviarParaAssinaturaStubAction,
  enviarParaAprovacaoAction,
} from "@/lib/pedidos/serverActions";
import type { PapelUsuario, StatusPedido } from "@/lib/supabase/database.types";

function useAcao() {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  function rodar(acao: () => Promise<void>, msgSucesso: string) {
    iniciar(async () => {
      try {
        await acao();
        toast.success(msgSucesso);
        router.refresh();
      } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : "Falha ao executar a ação.");
      }
    });
  }
  return { pendente, rodar };
}

function ComComentario({
  rotuloBotao,
  placeholder,
  variant,
  onConfirmar,
}: {
  rotuloBotao: string;
  placeholder: string;
  variant?: "destructive" | "outline";
  onConfirmar: (comentario: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [comentario, setComentario] = useState("");

  if (!aberto) {
    return (
      <Button type="button" variant={variant} onClick={() => setAberto(true)}>
        {rotuloBotao}
      </Button>
    );
  }
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <Textarea placeholder={placeholder} value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setAberto(false)}>
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          variant={variant}
          disabled={!comentario.trim()}
          onClick={() => {
            onConfirmar(comentario);
            setAberto(false);
            setComentario("");
          }}
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}

export interface AcaoPendente {
  titulo: string;
  descricao: string;
}

/**
 * Espelha as condições de AcoesPedido — usado pela ProximaAcao pra decidir
 * se mostra o painel de destaque (e com qual texto) sem duplicar a lógica
 * de quais botões aparecem.
 */
export function acaoPendente(status: StatusPedido, papel: PapelUsuario, donoDoRascunho: boolean): AcaoPendente | null {
  if (status === "rascunho" && donoDoRascunho) {
    return { titulo: "Pedido em rascunho", descricao: "Revise os dados e envie para aprovação quando estiver pronto." };
  }
  if (status === "em_aprovacao" && papel === "admin") {
    return { titulo: "Aguardando sua aprovação", descricao: "Confira os dados e os alertas abaixo antes de aprovar ou reprovar." };
  }
  if (status === "aprovado" && (papel === "admin" || papel === "juridico")) {
    return { titulo: "Geração do contrato falhou", descricao: "A última tentativa não gerou o contrato — corrija o problema e tente novamente." };
  }
  if (status === "em_revisao_juridica" && (papel === "juridico" || papel === "admin")) {
    return {
      titulo: "Contrato em revisão",
      descricao: "Baixe, ajuste se precisar e suba uma nova versão, ou libere para assinatura quando estiver pronto.",
    };
  }
  if (status === "pronto_para_assinatura" && (papel === "juridico" || papel === "admin")) {
    return { titulo: "Pronto para assinatura", descricao: "Dispare o envio para assinatura quando quiser seguir com o fluxo." };
  }
  return null;
}

export function AcoesPedido({
  pedidoId,
  status,
  papel,
  donoDoRascunho,
}: {
  pedidoId: string;
  status: StatusPedido;
  papel: PapelUsuario;
  donoDoRascunho: boolean;
}) {
  const { pendente, rodar } = useAcao();

  if (status === "rascunho" && donoDoRascunho) {
    return (
      <Button disabled={pendente} onClick={() => rodar(() => enviarParaAprovacaoAction(pedidoId), "Enviado para aprovação.")}>
        Enviar para aprovação
      </Button>
    );
  }

  if (status === "em_aprovacao" && papel === "admin") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button disabled={pendente} onClick={() => rodar(() => aprovarPedidoAction(pedidoId), "Pedido aprovado — gerando contrato…")}>
          Aprovar
        </Button>
        <ComComentario
          rotuloBotao="Reprovar"
          placeholder="Motivo da reprovação (obrigatório)"
          variant="destructive"
          onConfirmar={(c) => rodar(() => reprovarPedidoAction(pedidoId, c), "Pedido reprovado.")}
        />
      </div>
    );
  }

  if (status === "aprovado" && (papel === "admin" || papel === "juridico")) {
    return (
      <Button disabled={pendente} onClick={() => rodar(() => tentarGerarNovamenteAction(pedidoId), "Tentando gerar o contrato novamente…")}>
        Tentar gerar contrato novamente
      </Button>
    );
  }

  if (status === "em_revisao_juridica" && (papel === "juridico" || papel === "admin")) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pendente}
          onClick={() => rodar(() => liberarParaAssinaturaAction(pedidoId), "Liberado para assinatura.")}
        >
          Liberar para assinatura
        </Button>
        <ComComentario
          rotuloBotao="Rejeitar contrato (regenerar)"
          placeholder="O que precisa mudar? (obrigatório)"
          variant="outline"
          onConfirmar={(c) => rodar(() => rejeitarContratoAction(pedidoId, c), "Contrato rejeitado — regenerando…")}
        />
      </div>
    );
  }

  if (status === "pronto_para_assinatura" && (papel === "juridico" || papel === "admin")) {
    return (
      <Button
        disabled={pendente}
        onClick={() => rodar(() => enviarParaAssinaturaStubAction(pedidoId), "Marcado como enviado para assinatura (stub — Fase 3).")}
      >
        Enviar para assinatura
      </Button>
    );
  }

  return null;
}
