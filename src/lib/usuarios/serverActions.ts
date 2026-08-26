"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigirPapel } from "@/lib/auth/session";
import type { PapelUsuario } from "@/lib/supabase/database.types";

export async function alterarPapelUsuario(userId: string, papel: PapelUsuario) {
  await exigirPapel("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ papel }).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
