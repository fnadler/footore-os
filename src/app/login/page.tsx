"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar, type LoginState } from "./actions";

const ESTADO_INICIAL: LoginState = {};

export default function LoginPage() {
  const [estado, formAction, pendente] = useActionState(entrar, ESTADO_INICIAL);

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Footlink — Fechamento de Venda</CardTitle>
          <CardDescription>Entre com o e-mail e senha da sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" type="password" autoComplete="current-password" required />
            </div>
            {estado.erro && <p className="text-sm text-destructive">{estado.erro}</p>}
            <Button type="submit" disabled={pendente} className="mt-2">
              {pendente ? "Entrando…" : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
