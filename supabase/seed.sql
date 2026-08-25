-- Footlink — Sistema de Fechamento de Venda
-- Seed inicial: só os dois representantes fixos da Footure (nome/cargo).
-- email/cpf ficam NULL de propósito — preencher com o dado real pela tela de
-- admin antes de usar esses registros para montar envelopes de assinatura
-- (Fase 3). Nomes conforme _docs/referencia-skill/SKILL.md.

insert into representantes_footure (nome, cargo, ativo) values
  ('Emílio César dos Santos Fialho', 'Representante Legal', true),
  ('Eduardo Robaina Dias', 'Representante Legal', true)
on conflict (nome) do nothing;
