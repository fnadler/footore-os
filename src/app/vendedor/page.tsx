import Link from "next/link";
import { Pencil, Eye } from "lucide-react";
import { exigirPapel } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listarPedidosDoVendedor } from "@/lib/pedidos/consultas";
import { pedidoEhEditavel } from "@/lib/pedidos/statusEditavel";
import { urlLogoCliente } from "@/lib/clientes/consultas";
import { buscarPlanoPorKey } from "@/lib/plans/normalize";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotuloStatus } from "@/components/rotulo-status";
import { LogoCliente } from "@/components/clientes/logo-cliente";
import { CancelarPedidoDialog } from "@/components/pedido/cancelar-pedido-dialog";

export default async function VendedorPage() {
  const sessao = await exigirPapel("vendedor");
  const supabase = await createClient();
  const pedidos = await listarPedidosDoVendedor(supabase, sessao.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meus pedidos</h1>
        <Button nativeButton={false} render={<Link href="/vendedor/novo">Novo pedido</Link>} />
      </div>

      {pedidos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum pedido ainda. Clique em &quot;Novo pedido&quot; para começar.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead className="whitespace-normal">Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => {
              const cliente = p.clientes as unknown as { razao_social: string; logo_path: string | null } | null;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <LogoCliente url={urlLogoCliente(supabase, cliente?.logo_path ?? null)} nome={cliente?.razao_social ?? "Cliente"} />
                  </TableCell>
                  <TableCell className="max-w-[240px] whitespace-normal break-words">{cliente?.razao_social ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {p.perfil}
                    </Badge>{" "}
                    {buscarPlanoPorKey(p.plano)?.canonical ?? p.plano}
                  </TableCell>
                  <TableCell>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.valor_total)}</TableCell>
                  <TableCell>
                    <RotuloStatus status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        nativeButton={false}
                        render={<Link href={pedidoEhEditavel(p.status) ? `/vendedor/${p.id}/editar` : `/pedidos/${p.id}`} />}
                      >
                        {pedidoEhEditavel(p.status) ? <Pencil className="size-4" /> : <Eye className="size-4" />}
                        {pedidoEhEditavel(p.status) ? "Editar" : "Ver"}
                      </Button>
                      {p.status !== "concluido" && p.status !== "cancelado" && <CancelarPedidoDialog pedidoId={p.id} />}
                    </div>
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
