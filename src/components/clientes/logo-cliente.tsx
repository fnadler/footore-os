import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoCliente({
  url,
  nome,
  tamanho = "sm",
  className,
}: {
  url: string | null;
  nome: string;
  tamanho?: "sm" | "md";
  className?: string;
}) {
  const dimensao = tamanho === "sm" ? "size-9" : "size-16";

  if (!url) {
    return (
      <div
        className={cn(
          dimensao,
          "flex shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-muted-foreground",
          className,
        )}
      >
        <Building2 className={tamanho === "sm" ? "size-4" : "size-6"} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- URL pública do Storage, sem otimização necessária
    <img
      src={url}
      alt={`Logo de ${nome}`}
      className={cn(dimensao, "shrink-0 rounded-lg border border-border bg-muted object-contain p-1", className)}
    />
  );
}
