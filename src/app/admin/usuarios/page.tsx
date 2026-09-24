import { createClient } from "@/lib/supabase/server";
import { listarUsuarios } from "@/lib/pedidos/consultas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UsuarioFormDialog } from "@/components/usuarios/usuario-form-dialog";
import { UsuarioAtivoButton } from "@/components/usuarios/usuario-ativo-button";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const usuarios = await listarUsuarios(supabase);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Um e-mail com senha temporária é enviado automaticamente pra quem for cadastrado aqui.
          </p>
        </div>
        <UsuarioFormDialog modo="criar" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((u) => (
            <TableRow key={u.user_id}>
              <TableCell>{u.nome}</TableCell>
              <TableCell className="capitalize">{u.papel}</TableCell>
              <TableCell>
                <Badge variant={u.ativo ? "success" : "destructive"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <UsuarioFormDialog modo="editar" usuario={{ id: u.user_id, nome: u.nome, papel: u.papel }} />
                  <UsuarioAtivoButton userId={u.user_id} ativo={u.ativo} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
