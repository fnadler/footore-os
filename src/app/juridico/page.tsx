import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listarFilaJuridico } from "@/lib/pedidos/consultas";
import { urlLogoCliente } from "@/lib/clientes/consultas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RotuloStatus } from "@/components/rotulo-status";
import { LogoCliente } from "@/components/clientes/logo-cliente";

function formatarMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export default async function JuridicoPage() {
  const supabase = await createClient();
  const fila = await listarFilaJuridico(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Contratos para revisão</h1>

      {fila.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum contrato em revisão, pronto ou enviado para assinatura no momento.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead />
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Valor total</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell>
                    {p.perfil} · {p.plano}
                  </TableCell>
                  <TableCell>{formatarMoeda(p.valor_total)}</TableCell>
                  <TableCell>
                    <RotuloStatus status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" nativeButton={false} render={<Link href={`/pedidos/${p.id}`}>Abrir</Link>} />
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
