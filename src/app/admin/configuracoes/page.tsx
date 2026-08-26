import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Info } from "lucide-react";
import { REGRA_DEFAULT_PROVISORIA } from "@/lib/comissao/calcularComissao";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: regras } = await supabase.from("regras_comissao").select("*").order("vigencia_inicio", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Configurações — Comissionamento</h1>
      <p className="text-sm text-muted-foreground">
        Porta da Fase 2 (PROMPT.md 7.2) — tabelas e cálculo já existem, mas a tela de comissão do vendedor/admin e a
        cobrança de números em produção ficam fora da Fase 1.
      </p>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Parâmetro provisório, confirmar antes de produção</AlertTitle>
        <AlertDescription>
          Sem regra cadastrada, o cálculo usa {REGRA_DEFAULT_PROVISORIA.percentual}% sobre{" "}
          {REGRA_DEFAULT_PROVISORIA.base_calculo === "valor_total" ? "valor total" : "valor recebido"}, escopo{" "}
          {REGRA_DEFAULT_PROVISORIA.escopo_tipo}.
        </AlertDescription>
      </Alert>

      {!regras || regras.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma regra cadastrada ainda.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Percentual</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead>Vigência</TableHead>
              <TableHead>Ativa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regras.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.percentual}%</TableCell>
                <TableCell>{r.base_calculo}</TableCell>
                <TableCell>
                  {r.escopo_tipo}
                  {r.escopo_valor ? ` (${r.escopo_valor})` : ""}
                </TableCell>
                <TableCell>{r.vigencia_inicio}</TableCell>
                <TableCell>{r.ativo ? "Sim" : "Não"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
