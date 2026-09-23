import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listarFilaAprovacao, listarPedidosAprovadosComErro } from "@/lib/pedidos/consultas";
import { urlLogoCliente } from "@/lib/clientes/consultas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { LogoCliente } from "@/components/clientes/logo-cliente";
import { buscarPlanoPorKey } from "@/lib/plans/normalize";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function AdminAprovacaoPage() {
  const supabase = await createClient();
  const [fila, comErro] = await Promise.all([listarFilaAprovacao(supabase), listarPedidosAprovadosComErro(supabase)]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Fila de aprovação</h1>

      {comErro.length > 0 && (
        <div className="flex flex-col gap-2">
          {comErro.map((p) => (
            <Alert key={p.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                Falha ao gerar contrato — {(p.clientes as unknown as { razao_social: string } | null)?.razao_social} (
                {buscarPlanoPorKey(p.plano)?.canonical ?? p.plano})
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>{p.geracao_contrato_erro}</span>
                <Button size="sm" nativeButton={false} render={<Link href={`/pedidos/${p.id}`}>Ver e tentar novamente</Link>} />
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {fila.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido aguardando aprovação.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Cliente</TableHead>
              <TableHead>Vendedor</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {fila.map((p) => {
              const cliente = p.clientes as unknown as { razao_social: string; logo_path: string | null } | null;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <LogoCliente url={urlLogoCliente(supabase, cliente?.logo_path ?? null)} nome={cliente?.razao_social ?? "Cliente"} />
                  </TableCell>
                  <TableCell>{cliente?.razao_social ?? "—"}</TableCell>
                  <TableCell>{(p.profiles as unknown as { nome: string } | null)?.nome ?? "—"}</TableCell>
                  <TableCell>
                    {p.perfil} · {buscarPlanoPorKey(p.plano)?.canonical ?? p.plano}
                  </TableCell>
                  <TableCell>{formatarMoeda(p.valor_total)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" nativeButton={false} render={<Link href={`/pedidos/${p.id}`}>Revisar</Link>} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
