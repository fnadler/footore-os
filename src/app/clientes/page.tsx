import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listarClientesComContagemPedidos } from "@/lib/clientes/consultas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExcluirClienteDialog } from "@/components/clientes/excluir-cliente-dialog";

export default async function ClientesPage() {
  const supabase = await createClient();
  const clientes = await listarClientesComContagemPedidos(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Button nativeButton={false} render={<Link href="/clientes/novo">Novo cliente</Link>} />
      </div>

      {clientes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado ainda. Clique em &quot;Novo cliente&quot; para começar.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão social</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Foro</TableHead>
              <TableHead>Pedidos</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-foreground">{c.razao_social}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {c.tipo}
                  </Badge>
                </TableCell>
                <TableCell>{c.cnpj}</TableCell>
                <TableCell>{c.foro_preferencial}</TableCell>
                <TableCell>{c.totalPedidos}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/clientes/${c.id}/editar`}>Editar</Link>}
                    />
                    <ExcluirClienteDialog clienteId={c.id} razaoSocial={c.razao_social} totalPedidos={c.totalPedidos} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
