// Envio de e-mail transacional via Resend (developers.resend.com, API HTTP
// simples — sem SDK, evita mais uma dependência pra um uso só). Usado hoje
// só pra mandar a senha temporária no cadastro de usuário novo (gestão de
// usuários, admin/usuarios).
export async function enviarEmailSenhaTemporaria(destinatario: string, nome: string, senhaTemporaria: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const remetente = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !remetente) throw new Error("RESEND_API_KEY / RESEND_FROM_EMAIL não configurados.");

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: remetente,
      to: destinatario,
      subject: "Seu acesso ao Footlink",
      html: `
        <p>Olá, ${nome}.</p>
        <p>Uma conta foi criada pra você no Footlink. Use os dados abaixo para entrar:</p>
        <p><strong>E-mail:</strong> ${destinatario}<br><strong>Senha temporária:</strong> ${senhaTemporaria}</p>
        <p>Recomendamos trocar essa senha assim que possível após o primeiro acesso.</p>
      `,
    }),
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao enviar e-mail via Resend (${resposta.status}): ${await resposta.text()}`);
  }
}
