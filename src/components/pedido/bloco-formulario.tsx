import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BlocoFormulario({
  numero,
  titulo,
  descricao,
  icon: Icon,
  children,
}: {
  numero: number;
  titulo: string;
  descricao?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {numero}
        </span>
        <div className="flex flex-col gap-0.5 pt-0.5">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-primary" strokeWidth={2} />
            <h2 className="text-base font-bold text-foreground">{titulo}</h2>
          </div>
          {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
