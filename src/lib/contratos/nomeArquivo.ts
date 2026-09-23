// Nome legível do contrato — usado tanto no download assinado por link
// (createSignedUrl) quanto no nome do envelope/documento enviado à Clicksign
// (Fase 3), pra manter os dois pontos consistentes.
export function nomeArquivoContrato(razaoSocial: string, geradoEm: string, versao: number): string {
  const data = geradoEm.slice(0, 10); // gerado_em é timestamptz — os 10 primeiros chars já são AAAA-MM-DD
  const nomeSanitizado = razaoSocial.replace(/[\\/:*?"<>|]/g, "-").trim();
  return `${nomeSanitizado} - Contrato Footlink - ${data} - ${versao}.docx`;
}
