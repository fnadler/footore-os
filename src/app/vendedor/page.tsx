import Link from "next/link";
import { exigirPapel } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listarPedidosDoVendedor } from "@/lib/pedidos/consultas";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RotuloStatus } from "@/components/rotulo-status";

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
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pedidos.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{(p.clientes as unknown as { razao_social: string } | null)?.razao_social ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {p.perfil}
                  </Badge>{" "}
                  {p.plano}
                </TableCell>
                <TableCell>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.valor_total)}</TableCell>
                <TableCell>
                  <RotuloStatus status={p.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <Link href={p.status === "rascunho" ? `/vendedor/${p.id}/editar` : `/pedidos/${p.id}`}>
                        {p.status === "rascunho" ? "Editar" : "Ver"}
                      </Link>
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
