import { exigirPapel } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoRow } from "@/components/pedido/info-row";

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
        <CardContent className="flex flex-col">
          <InfoRow label="Nome" value={sessao.nome} />
          <InfoRow label="E-mail" value={sessao.email ?? "—"} />
          <InfoRow label="Papel" value={ROTULO_PAPEL[sessao.papel] ?? sessao.papel} />
        </CardContent>
      </Card>
    </div>
  );
}
