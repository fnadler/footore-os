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
};

const VARIANTE_STATUS: Record<StatusPedido, "outline" | "secondary" | "default"> = {
  rascunho: "outline",
  em_aprovacao: "secondary",
  aprovado: "secondary",
  em_revisao_juridica: "secondary",
  pronto_para_assinatura: "default",
  enviado_para_assinatura: "default",
  assinado: "default",
  concluido: "default",
};

export function RotuloStatus({ status }: { status: StatusPedido }) {
  return <Badge variant={VARIANTE_STATUS[status]}>{ROTULO_STATUS[status]}</Badge>;
}
