import { Badge } from "@/components/ui/badge";
import type { StatusPedido } from "@/lib/supabase/database.types";

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  rascunho: "Rascunho",
  em_aprovacao: "Em aprovação",
  aprovado: "Aprovado",
  em_revisao_juridica: "Em revisão jurídica",
  pronto_para_assinatura: "Pronto para assinatura",
  enviado_para_assinatura: "Enviado para assinatura",
  assinado: "Assinado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

// Segue o padrão de status pill do design_system.html real (Pendente/Novo/
// Ativo/Encerrado) — rascunho é neutro, em_aprovacao/em_revisao_juridica
// pendem de ação de alguém (warning), aprovado/enviado estão "em trânsito"
// (info), pronto_para_assinatura é a única cor de marca (ação imediata
// esperada), assinado/concluído são sucesso.
const VARIANTE_STATUS: Record<StatusPedido, "neutral" | "warning" | "info" | "default" | "success" | "destructive"> = {
  rascunho: "neutral",
  em_aprovacao: "warning",
  aprovado: "info",
  em_revisao_juridica: "warning",
  pronto_para_assinatura: "default",
  enviado_para_assinatura: "info",
  assinado: "success",
  concluido: "success",
  cancelado: "destructive",
};

export function RotuloStatus({ status }: { status: StatusPedido }) {
  return (
    <Badge variant={VARIANTE_STATUS[status]} className="text-[11px] font-bold tracking-wide uppercase">
      {ROTULO_STATUS[status]}
    </Badge>
  );
}
