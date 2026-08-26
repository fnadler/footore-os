import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Linha label→valor pra dentro de um bloco de dados: label à esquerda em
 * cinza, valor à direita em negrito, separadas por hairline — exceto
 * `longo`, onde o valor (texto corrido, ex.: multa) quebra abaixo do label
 * em vez de forçar alinhamento à direita numa linha só.
 */
export function InfoRow({ label, value, longo = false }: { label: string; value: ReactNode; longo?: boolean }) {
  if (longo) {
    return (
      <div className="flex flex-col gap-1 border-b border-border py-3 last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm text-foreground">{value}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-foreground", "text-right")}>{value}</span>
    </div>
  );
}
