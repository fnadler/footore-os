import { exigirPapel } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROTULO_PAPEL: Record<string, string> = {
  vendedor: "Vendedor",
  juridico: "Jurídico",
  admin: "Admin",
};

export default async function PerfilPage() {
  const sessao = await exigirPapel("vendedor", "juridico", "admin");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">Meu perfil</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Dados da conta</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Nome</p>
            <p className="mt-1 text-foreground">{sessao.nome}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">E-mail</p>
            <p className="mt-1 text-foreground">{sessao.email ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Papel</p>
            <p className="mt-1 text-foreground">{ROTULO_PAPEL[sessao.papel] ?? sessao.papel}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
