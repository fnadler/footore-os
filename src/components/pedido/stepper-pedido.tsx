import { Ban, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusPedido } from "@/lib/supabase/database.types";

const ETAPAS: { status: StatusPedido; label: string }[] = [
  { status: "rascunho", label: "Rascunho" },
  { status: "em_aprovacao", label: "Em aprovação" },
  { status: "aprovado", label: "Aprovado" },
  { status: "em_revisao_juridica", label: "Revisão jurídica" },
  { status: "pronto_para_assinatura", label: "Pronto p/ assinatura" },
  { status: "enviado_para_assinatura", label: "Enviado p/ assinatura" },
  { status: "assinado", label: "Assinado" },
  { status: "concluido", label: "Concluído" },
];

export function StepperPedido({ status }: { status: StatusPedido }) {
  // Cancelado é um estado divergente, não um passo a mais na sequência linear
  // (pode ter acontecido a partir de qualquer etapa — ver a linha do tempo).
  if (status === "cancelado") {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-destructive">
        <Ban className="size-5" />
        Pedido cancelado
      </div>
    );
  }

  const indiceAtual = ETAPAS.findIndex((e) => e.status === status);

  return (
    <ol className="flex w-full items-start overflow-x-auto pb-1">
      {ETAPAS.map((etapa, i) => {
        const concluida = i < indiceAtual;
        const atual = i === indiceAtual;
        const ultima = i === ETAPAS.length - 1;

        return (
          <li key={etapa.status} className="flex flex-1 min-w-[92px] flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  concluida && "border-primary bg-primary text-primary-foreground",
                  atual && "border-primary bg-primary/15 text-primary ring-4 ring-primary/15",
                  !concluida && !atual && "border-border bg-card text-muted-foreground",
                )}
              >
                {concluida ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </div>
              {!ultima && (
                <div className={cn("h-0.5 flex-1 transition-colors", concluida ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <span
              className={cn(
                "mt-2 px-1 text-center text-[11px] leading-tight",
                atual && "font-bold text-foreground",
                concluida && "font-medium text-foreground",
                !concluida && !atual && "text-muted-foreground",
              )}
            >
              {etapa.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
