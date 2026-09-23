import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Service role: ignora RLS por completo (bypassrls no Postgres). Só pra código
// que roda sem sessão de usuário — hoje, só o webhook da Clicksign (Fase 3),
// que precisa mover o pedido pra ASSINADO sem que ninguém esteja logado.
export function createServiceClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}
