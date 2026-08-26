import { createClient } from "@/lib/supabase/server";
import { listarUsuarios } from "@/lib/pedidos/consultas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsuarioPapelSelect } from "@/components/usuario-papel-select";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const usuarios = await listarUsuarios(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Usuários</h1>
      <p className="text-sm text-muted-foreground">
        Novos usuários entram como &quot;vendedor&quot; por padrão (provisionamento automático no primeiro login) — promova aqui.
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Papel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.user_id}>
              <TableCell>{u.nome}</TableCell>
              <TableCell>
                <UsuarioPapelSelect userId={u.user_id} papelAtual={u.papel} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
