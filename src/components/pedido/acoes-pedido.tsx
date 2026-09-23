"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadNovaVersao } from "@/components/pedido/upload-nova-versao";
import {
  aprovarPedidoAction,
  reprovarPedidoAction,
  tentarGerarNovamenteAction,
  liberarParaAssinaturaAction,
  rejeitarContratoAction,
  enviarParaAssinaturaAction,
  enviarParaAprovacaoAction,
  cancelarAssinaturaAction,
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
        <RegenerarContratoDialog pedidoId={pedidoId} />
        <SubirNovaVersaoDialog pedidoId={pedidoId} />
      </div>
    );
  }

  if (status === "pronto_para_assinatura" && (papel === "juridico" || papel === "admin")) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pendente}
          onClick={() => rodar(() => enviarParaAssinaturaAction(pedidoId), "Enviado para assinatura via Clicksign.")}
        >
          Enviar para assinatura
        </Button>
        <CancelarAssinaturaDialog pedidoId={pedidoId} />
      </div>
    );
  }

  if (status === "enviado_para_assinatura" && (papel === "juridico" || papel === "admin")) {
    return <CancelarAssinaturaDialog pedidoId={pedidoId} />;
  }

  return null;
}

function CancelarAssinaturaDialog({ pedidoId }: { pedidoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [comentario, setComentario] = useState("");
  const { pendente, rodar } = useAcao();

  function confirmar() {
    rodar(async () => {
      await cancelarAssinaturaAction(pedidoId, comentario || undefined);
      setAberto(false);
      setComentario("");
    }, "Processo de assinatura cancelado — pedido voltou para revisão jurídica.");
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>Cancelar assinatura</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar processo de assinatura</DialogTitle>
          <DialogDescription>
            O pedido volta para &quot;em revisão jurídica&quot; e passa a poder ser editado pelo vendedor de novo.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Motivo do cancelamento (opcional)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Voltar</DialogClose>
          <Button type="button" variant="destructive" disabled={pendente} onClick={confirmar}>
            {pendente ? "Cancelando…" : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RegenerarContratoDialog({ pedidoId }: { pedidoId: string }) {
  const [aberto, setAberto] = useState(false);
  const [comentario, setComentario] = useState("");
  const { pendente, rodar } = useAcao();

  function confirmar() {
    rodar(async () => {
      await rejeitarContratoAction(pedidoId, comentario);
      setAberto(false);
      setComentario("");
    }, "Contrato marcado para regeneração.");
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>Regenerar</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerar contrato</DialogTitle>
          <DialogDescription>
            O pedido volta para &quot;aprovado&quot; e o contrato é gerado novamente. Descreva o que precisa mudar.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="O que precisa mudar? (obrigatório)"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
        />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button type="button" disabled={pendente || !comentario.trim()} onClick={confirmar}>
            {pendente ? "Enviando…" : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubirNovaVersaoDialog({ pedidoId }: { pedidoId: string }) {
  const [aberto, setAberto] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>Subir nova versão</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir nova versão do contrato</DialogTitle>
          <DialogDescription>Envie o .docx editado manualmente — vira a versão mais recente do contrato.</DialogDescription>
        </DialogHeader>
        <UploadNovaVersao
          pedidoId={pedidoId}
          onSucesso={() => {
            setAberto(false);
            router.refresh();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
