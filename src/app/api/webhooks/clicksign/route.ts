// Porta da Fase 3 (PROMPT.md 8) — endpoint criado, mas inativo: só confirma
// que existe e loga o payload recebido, não processa nada nem move o pedido
// para ASSINADO ainda. Implementar a verificação de assinatura do webhook e
// a transição `enviado_para_assinatura -> assinado` (via service role, ver
// supabase/migrations/0004_transicoes_rpc.sql) quando a Fase 3 começar.
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  console.info("[stub] webhook Clicksign recebido, Fase 3 ainda não implementada:", payload);
  return NextResponse.json({ status: "recebido, não processado (Fase 3 pendente)" }, { status: 200 });
}
