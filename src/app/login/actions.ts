"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  erro?: string;
}

export async function entrar(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { erro: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    return { erro: "E-mail ou senha inválidos." };
  }

  const { data: profile } = await supabase.from("profiles").select("ativo").eq("user_id", data.user.id).single();
  if (!profile?.ativo) {
    await supabase.auth.signOut();
    return { erro: "Esta conta está inativa. Fale com um administrador." };
  }

  // Redireciona para "/", que decide a área por papel (ver src/app/page.tsx).
  redirect("/");
}
