import { createClient } from "@/lib/supabase/server";
import { buscarConfiguracaoComissionamento } from "@/lib/comissao/configuracoes";
import { BlocoComissionamento } from "@/components/configuracoes/bloco-comissionamento";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const comissionamento = await buscarConfiguracaoComissionamento(supabase);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <BlocoComissionamento
        percentualImposto={comissionamento.percentual_imposto}
        percentualComissaoTotal={comissionamento.percentual_comissao_total}
        percentualComissaoSdr={comissionamento.percentual_comissao_sdr}
        percentualComissaoCloser={comissionamento.percentual_comissao_closer}
      />
    </div>
  );
}
