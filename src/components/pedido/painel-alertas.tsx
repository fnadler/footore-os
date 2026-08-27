import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AlertaPedido } from "@/lib/validacoes/pedido";

export function PainelAlertas({ alertas }: { alertas: AlertaPedido[] }) {
  if (alertas.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {alertas.map((a) => (
        <Alert key={a.codigo} variant={a.severidade === "erro" ? "destructive" : "warning"}>
          {a.severidade === "erro" ? <ShieldAlert className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{a.severidade === "erro" ? "Impeditivo para assinatura" : "Atenção"}</AlertTitle>
          <AlertDescription>{a.mensagem}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
