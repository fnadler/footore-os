export interface Pessoa {
  nome: string;
  email?: string | null;
  cpf?: string | null;
}

export function ListaPessoas({
  titulo,
  pessoas,
  vazio = "Nenhum cadastrado.",
}: {
  titulo: string;
  pessoas: Pessoa[];
  vazio?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{titulo}</p>
      {pessoas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pessoas.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/40 px-3 py-2">
              <p className="text-sm font-semibold text-foreground">{p.nome}</p>
              <p className="text-xs text-muted-foreground">
                {p.email || "e-mail não informado"} · {p.cpf || "CPF não informado"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
