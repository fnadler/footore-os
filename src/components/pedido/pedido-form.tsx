"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignatarioListEditor, type SignatarioForm } from "./signatario-list-editor";
import { PainelAlertas } from "./painel-alertas";
import { salvarPedido, type SalvarPedidoState } from "@/lib/pedidos/serverActions";
import { gerarAlertas, FORO_DEFAULT } from "@/lib/validacoes/pedido";
import { detectarPlanoLegado } from "@/lib/contratos/legado";
import { PLANOS_CLUBE, PLANOS_AGENTE } from "@/lib/contratos/planos";
import { ROTULO_MULTA, textoMultaDefault } from "@/lib/contratos/multa";
import { ROTULO_MEIO_PAGAMENTO } from "@/lib/contratos/meioPagamento";
import type { MultaTipo, MeioPagamento } from "@/lib/supabase/database.types";

export interface ClienteOption {
  id: string;
  tipo: "clube" | "agente";
  razaoSocial: string;
  cnpj: string;
  endereco: string;
}
export interface RepresentanteFoutureOption {
  id: string;
  nome: string;
}

export interface DadosIniciaisPedido {
  clienteId: string;
  nomePlanoImportado?: string;
  plano: string;
  planoLegadoNomeOriginal?: string | null;
  planoLegadoConfirmado?: boolean;
  incluiApi: boolean;
  licencasPagas: number;
  licencasGratuitas: number;
  formaPagamento: "avista" | "parcelado";
  meioPagamento: MeioPagamento;
  numeroParcelas: number;
  valorMensal: number;
  valorTotal: number;
  valorLicencaAdicional: number;
  valorMensalApi: number;
  valorMensalSoftware: number;
  primeiroPagamento: string;
  diaVencimento: number;
  convencaoParcelas: "calendario" | "ciclo";
  vigenciaInicio: string;
  vigenciaFim: string;
  divulgaParceria: boolean;
  multaTipo: MultaTipo;
  multaTexto: string;
  foro: string;
  condicaoEspecial: string;
  representantesLegais: SignatarioForm[];
  testemunhasCliente: SignatarioForm[];
  representantesFootureIds: string[];
  testemunhasFooture: SignatarioForm[];
}

interface Props {
  clientes: ClienteOption[];
  signatariosPorCliente: Record<string, SignatarioForm[]>;
  representantesFooture: RepresentanteFoutureOption[];
  pedidoId?: string;
  dadosIniciais?: DadosIniciaisPedido;
}

function somarMeses(dataISO: string, meses: number): string {
  if (!dataISO) return "";
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const d = new Date(ano, mes - 1 + meses, dia);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ESTADO_INICIAL: SalvarPedidoState = {};

export function PedidoForm({ clientes, signatariosPorCliente, representantesFooture, pedidoId, dadosIniciais: d }: Props) {
  const [estado, formAction, pendente] = useActionState(salvarPedido, ESTADO_INICIAL);

  const [clienteId, setClienteId] = useState<string>(d?.clienteId ?? "");
  const [cadastrandoNovo, setCadastrandoNovo] = useState(!d && clientes.length === 0);
  const [novoCliente, setNovoCliente] = useState({ tipo: "clube" as "clube" | "agente", razaoSocial: "", cnpj: "", endereco: "" });

  const clienteSelecionado = clientes.find((c) => c.id === clienteId);
  const perfil: "clube" | "agente" = cadastrandoNovo ? novoCliente.tipo : (clienteSelecionado?.tipo ?? "clube");

  const [nomePlanoImportado, setNomePlanoImportado] = useState(d?.nomePlanoImportado ?? "");
  const [plano, setPlano] = useState(d?.plano ?? "");
  const [planoLegadoConfirmado, setPlanoLegadoConfirmado] = useState(d?.planoLegadoConfirmado ?? false);
  const legadoDetectado = useMemo(() => detectarPlanoLegado(perfil, nomePlanoImportado), [perfil, nomePlanoImportado]);

  const [incluiApi, setIncluiApi] = useState(d?.incluiApi ?? false);
  const [licencasPagas, setLicencasPagas] = useState(d?.licencasPagas ?? 1);
  const [licencasGratuitas, setLicencasGratuitas] = useState(d?.licencasGratuitas ?? 0);
  const [formaPagamento, setFormaPagamento] = useState<"avista" | "parcelado">(d?.formaPagamento ?? "parcelado");
  const [meioPagamento, setMeioPagamento] = useState<MeioPagamento>(d?.meioPagamento ?? "boleto");
  const [numeroParcelas, setNumeroParcelas] = useState(d?.numeroParcelas ?? 12);
  const [valorMensal, setValorMensalRaw] = useState(d?.valorMensal ?? 0);
  const [valorTotal, setValorTotal] = useState(d?.valorTotal ?? 0);
  const [valorTotalEditadoManualmente, setValorTotalEditadoManualmente] = useState(!!d);

  // Valor total é sugerido a partir de parcela × nº de parcelas (parcelado),
  // mas continua editável — negociações com desconto/condição especial
  // ainda precisam poder divergir do cálculo puro (ver alerta de coerência).
  function setValorMensal(v: number) {
    setValorMensalRaw(v);
    if (formaPagamento === "parcelado" && !valorTotalEditadoManualmente) {
      setValorTotal(Number((v * numeroParcelas).toFixed(2)));
    }
  }
  function aoMudarNumeroParcelas(n: number) {
    setNumeroParcelas(n);
    if (formaPagamento === "parcelado" && !valorTotalEditadoManualmente) {
      setValorTotal(Number((valorMensal * n).toFixed(2)));
    }
  }
  const [valorLicencaAdicional, setValorLicencaAdicional] = useState(d?.valorLicencaAdicional ?? 0);
  const [valorMensalApi, setValorMensalApi] = useState(d?.valorMensalApi ?? 0);
  const [valorMensalSoftware, setValorMensalSoftware] = useState(d?.valorMensalSoftware ?? 0);
  const [primeiroPagamento, setPrimeiroPagamento] = useState(d?.primeiroPagamento ?? "");
  const [diaVencimento, setDiaVencimento] = useState(d?.diaVencimento ?? 10);
  const [convencaoParcelas, setConvencaoParcelas] = useState<"calendario" | "ciclo">(d?.convencaoParcelas ?? "calendario");
  const [vigenciaInicio, setVigenciaInicio] = useState(d?.vigenciaInicio ?? "");
  const [vigenciaFim, setVigenciaFim] = useState(d?.vigenciaFim ?? "");
  const [divulgaParceria, setDivulgaParceria] = useState(d?.divulgaParceria ?? false);
  const [multaTipo, setMultaTipo] = useState<MultaTipo>(d?.multaTipo ?? "tres_mensalidades");
  const [multaTexto, setMultaTexto] = useState(d?.multaTexto ?? textoMultaDefault("tres_mensalidades"));
  const [foro, setForo] = useState(d?.foro ?? FORO_DEFAULT);
  const [condicaoEspecial, setCondicaoEspecial] = useState(d?.condicaoEspecial ?? "");

  const [representantesLegais, setRepresentantesLegais] = useState<SignatarioForm[]>(d?.representantesLegais ?? []);
  const [testemunhasCliente, setTestemunhasCliente] = useState<SignatarioForm[]>(d?.testemunhasCliente ?? []);
  const [representantesFootureIds, setRepresentantesFootureIds] = useState<string[]>(d?.representantesFootureIds ?? []);
  const [testemunhasFooture, setTestemunhasFooture] = useState<SignatarioForm[]>(d?.testemunhasFooture ?? []);

  const alertas = useMemo(
    () =>
      gerarAlertas({
        valorMensal,
        valorTotal,
        formaPagamento,
        numeroParcelas,
        licencasGratuitas,
        foro,
        temRepresentanteLegal: representantesLegais.length > 0,
        planoLegadoDetectado: !!legadoDetectado,
        planoLegadoNomeOriginal: legadoDetectado?.nomeOriginal,
        planoLegadoConfirmado,
      }),
    [
      valorMensal,
      valorTotal,
      formaPagamento,
      numeroParcelas,
      licencasGratuitas,
      foro,
      representantesLegais,
      legadoDetectado,
      planoLegadoConfirmado,
    ],
  );

  const planosDisponiveis = perfil === "clube" ? PLANOS_CLUBE : PLANOS_AGENTE;
  const signatariosDoClienteSelecionado = clienteId ? (signatariosPorCliente[clienteId] ?? []) : [];

  function aoEnviar(formData: FormData) {
    const payload = {
      pedidoId,
      clienteId: cadastrandoNovo ? undefined : clienteId || undefined,
      novoCliente: cadastrandoNovo ? novoCliente : undefined,
      perfil,
      produtos: incluiApi ? ["footlink", "api"] : ["footlink"],
      plano,
      planoLegadoNomeOriginal: legadoDetectado?.nomeOriginal ?? null,
      planoLegadoConfirmado,
      licencasPagas,
      licencasGratuitas,
      formaPagamento,
      meioPagamento,
      numeroParcelas: formaPagamento === "parcelado" ? numeroParcelas : undefined,
      valorMensal,
      valorTotal,
      valorLicencaAdicional: valorLicencaAdicional || undefined,
      valorMensalApi: incluiApi ? valorMensalApi : undefined,
      valorMensalSoftware: incluiApi ? valorMensalSoftware : undefined,
      primeiroPagamento,
      diaVencimento: formaPagamento === "parcelado" ? diaVencimento : undefined,
      convencaoParcelas,
      vigenciaInicio,
      vigenciaFim,
      divulgaParceria,
      multaTipo,
      multaTexto,
      foro,
      condicaoEspecial: condicaoEspecial || undefined,
      representantesLegais,
      testemunhasCliente,
      representantesFootureIds,
      testemunhasFooture,
    };
    formData.set("payload", JSON.stringify(payload));
    return formAction(formData);
  }

  return (
    <form action={aoEnviar} className="flex flex-col gap-6 pb-16">
      <PainelAlertas alertas={alertas} />
      {estado.erro && (
        <p className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{estado.erro}</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cliente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!cadastrandoNovo ? (
            <div className="flex flex-col gap-2">
              <Label>Cliente existente</Label>
              <Select value={clienteId} onValueChange={(v) => setClienteId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.razaoSocial} ({c.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="link" className="self-start px-0" onClick={() => setCadastrandoNovo(true)}>
                + cadastrar novo cliente
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label>Perfil</Label>
                <Select value={novoCliente.tipo} onValueChange={(v) => setNovoCliente({ ...novoCliente, tipo: v as "clube" | "agente" })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clube">Clube</SelectItem>
                    <SelectItem value="agente">Agente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Razão social</Label>
                <Input value={novoCliente.razaoSocial} onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>CNPJ</Label>
                <Input value={novoCliente.cnpj} onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Endereço</Label>
                <Textarea value={novoCliente.endereco} onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })} />
              </div>
              {clientes.length > 0 && (
                <Button type="button" variant="link" className="self-start px-0" onClick={() => setCadastrandoNovo(false)}>
                  usar cliente existente em vez disso
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produto e plano</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox checked disabled />
            <Label>Assinatura Footlink (sempre incluída)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={incluiApi} onCheckedChange={(v) => setIncluiApi(!!v)} />
            <Label>+ API</Label>
          </div>

          {perfil === "agente" && (
            <div className="flex flex-col gap-2">
              <Label>Nome do plano no pedido original (se veio de um pedido antigo/legado)</Label>
              <Input value={nomePlanoImportado} onChange={(e) => setNomePlanoImportado(e.target.value)} placeholder="ex.: Latam" />
              {legadoDetectado && (
                <div className="flex items-center gap-2 rounded-md border border-amber-400 bg-amber-50 p-2 text-sm dark:bg-amber-950">
                  <span>
                    Nome legado &quot;{legadoDetectado.nomeOriginal}&quot; → plano atual sugerido: <strong>{legadoDetectado.planoSugerido}</strong>.
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setPlano(legadoDetectado.planoSugerido);
                      setPlanoLegadoConfirmado(true);
                    }}
                  >
                    Confirmar
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Plano</Label>
            <Select value={plano} onValueChange={(v) => setPlano(v ?? "")}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {planosDisponiveis.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Licenças pagas</Label>
              <Input type="number" min={0} value={licencasPagas} onChange={(e) => setLicencasPagas(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Licenças gratuitas</Label>
              <Input type="number" min={0} value={licencasGratuitas} onChange={(e) => setLicencasGratuitas(Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pagamento e valores</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Forma de pagamento</Label>
              <Select value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as "avista" | "parcelado")}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parcelado">Parcelado</SelectItem>
                  <SelectItem value="avista">À vista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Meio de pagamento</Label>
              <Select value={meioPagamento} onValueChange={(v) => v && setMeioPagamento(v as MeioPagamento)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROTULO_MEIO_PAGAMENTO).map(([valor, rotulo]) => (
                    <SelectItem key={valor} value={valor}>
                      {rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {incluiApi && (
            <div className="grid grid-cols-2 gap-4 rounded-md border p-3">
              <div className="flex flex-col gap-2">
                <Label>Valor mensal da API</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorMensalApi}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setValorMensalApi(v);
                    setValorMensal(v + valorMensalSoftware);
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Valor mensal do software</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valorMensalSoftware}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setValorMensalSoftware(v);
                    setValorMensal(v + valorMensalApi);
                  }}
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                API e software são sempre discriminados no contrato, tanto parcelado quanto à vista.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {formaPagamento === "parcelado" && (
              <div className="flex flex-col gap-2">
                <Label>Número de parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  value={numeroParcelas}
                  onChange={(e) => aoMudarNumeroParcelas(Number(e.target.value))}
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Valor da parcela</Label>
              <Input type="number" step="0.01" value={valorMensal} onChange={(e) => setValorMensal(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>
                Valor total{formaPagamento === "parcelado" ? " (parcela × número de parcelas, editável)" : ""}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={valorTotal}
                onChange={(e) => {
                  setValorTotal(Number(e.target.value));
                  setValorTotalEditadoManualmente(true);
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Valor da licença adicional</Label>
              <Input
                type="number"
                step="0.01"
                value={valorLicencaAdicional}
                onChange={(e) => setValorLicencaAdicional(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>{formaPagamento === "parcelado" ? "Data do primeiro pagamento" : "Data do pagamento"}</Label>
              <Input type="date" value={primeiroPagamento} onChange={(e) => setPrimeiroPagamento(e.target.value)} />
            </div>
            {formaPagamento === "parcelado" && (
              <>
                <div className="flex flex-col gap-2">
                  <Label>Dia de vencimento recorrente</Label>
                  <Input type="number" min={1} max={31} value={diaVencimento} onChange={(e) => setDiaVencimento(Number(e.target.value))} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Convenção de parcelas</Label>
                  <Select value={convencaoParcelas} onValueChange={(v) => setConvencaoParcelas(v as "calendario" | "ciclo")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calendario">Calendário (padrão)</SelectItem>
                      <SelectItem value="ciclo">Ciclo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Vigência — início</Label>
              <Input
                type="date"
                value={vigenciaInicio}
                onChange={(e) => {
                  setVigenciaInicio(e.target.value);
                  if (!vigenciaFim || vigenciaFim === somarMeses(vigenciaInicio, 12)) {
                    setVigenciaFim(somarMeses(e.target.value, 12));
                  }
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Vigência — fim</Label>
              <Input type="date" value={vigenciaFim} onChange={(e) => setVigenciaFim(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cláusulas negociáveis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Multa de rescisão</Label>
            <Select
              value={multaTipo}
              onValueChange={(v) => {
                const tipo = v as MultaTipo;
                setMultaTipo(tipo);
                setMultaTexto(textoMultaDefault(tipo));
              }}
            >
              <SelectTrigger className="w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROTULO_MULTA).map(([valor, rotulo]) => (
                  <SelectItem key={valor} value={valor}>
                    {rotulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea value={multaTexto} onChange={(e) => setMultaTexto(e.target.value)} rows={3} />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={divulgaParceria} onCheckedChange={(v) => setDivulgaParceria(!!v)} />
            <Label>Cliente autoriza divulgação da parceria</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Foro</Label>
            <Input value={foro} onChange={(e) => setForo(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Condição especial</Label>
            <Textarea value={condicaoEspecial} onChange={(e) => setCondicaoEspecial(e.target.value)} rows={2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signatários</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SignatarioListEditor
            titulo="Representantes legais do cliente"
            itens={representantesLegais}
            onChange={setRepresentantesLegais}
            disponiveisParaReaproveitar={signatariosDoClienteSelecionado.filter((s) => !testemunhasCliente.some((t) => t.id === s.id))}
          />
          <SignatarioListEditor
            titulo="Testemunhas do cliente"
            itens={testemunhasCliente}
            onChange={setTestemunhasCliente}
            disponiveisParaReaproveitar={signatariosDoClienteSelecionado.filter((s) => !representantesLegais.some((r) => r.id === s.id))}
          />

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Representante(s) da Footure</Label>
            {representantesFooture.map((r) => (
              <div key={r.id} className="flex items-center gap-2">
                <Checkbox
                  checked={representantesFootureIds.includes(r.id)}
                  onCheckedChange={(v) =>
                    setRepresentantesFootureIds((prev) => (v ? [...prev, r.id] : prev.filter((id) => id !== r.id)))
                  }
                />
                <Label>{r.nome}</Label>
              </div>
            ))}
          </div>

          <SignatarioListEditor titulo="Testemunhas da Footure" itens={testemunhasFooture} onChange={setTestemunhasFooture} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : "Salvar rascunho"}
        </Button>
      </div>
    </form>
  );
}
