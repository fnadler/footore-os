import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Cliente para Server Components / Server Actions / Route Handlers. `cookies()`
// é assíncrono no Next 16 — por isso esta função também é assíncrona.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component chamando setAll (não pode escrever cookie) —
            // ok ignorar aqui porque o proxy.ts já cuida do refresh de sessão
            // a cada request.
          }
        },
      },
    },
  );
}
