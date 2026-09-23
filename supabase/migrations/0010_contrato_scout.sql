-- Footlink — Sistema de Fechamento de Venda
-- 0010_contrato_scout.sql: absorve as regras novas do pacote de referência
-- "footlink-contract" (linha Scout, linhagem enxuta/robusta, divulgação em 3
-- níveis, 2 modelos de cobrança de API) no motor de geração de contrato.
--
-- Reverte a decisão registrada em 0006 de que o meio de pagamento nunca muda
-- o texto do contrato: PIX agora tem cláusula própria (bloco de dados
-- bancários, NF, dia 25) — decisão atualizada com o usuário nesta rodada.

create type divulgacao_pedido as enum ('nenhuma', 'simples', 'obrigacao');
create type api_modelo as enum ('combinado', 'distintos');

alter table pedidos add column robusta boolean not null default false;
alter table pedidos add column divulgacao divulgacao_pedido not null default 'nenhuma';
alter table pedidos add column percentual_desconto_divulgacao numeric(5, 2);
alter table pedidos add column post_divulgacao text;
alter table pedidos add column api_modelo api_modelo;

update pedidos set divulgacao = 'simples' where divulga_parceria = true;
alter table pedidos drop column divulga_parceria;

-- Nomenclatura de agente muda de tier: {Single, Starter, Growth, Pro, Prime}
-- (antigo) -> {Single, Basic, Essential, Prime, Elite} (novo, com prefixo
-- "Scout" aplicado só na hora de montar o contrato, não armazenado aqui).
-- Migra os pedidos de teste já criados nesta conta com nomes antigos.
update pedidos set plano = case plano
  when 'Starter' then 'Basic'
  when 'Growth' then 'Essential'
  when 'Pro' then 'Prime'
  when 'Prime' then 'Elite'
  else plano
end
where perfil = 'agente';
