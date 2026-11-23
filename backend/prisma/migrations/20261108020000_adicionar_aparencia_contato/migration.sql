-- Adiciona a identificação visual persistida dos contatos da Rede de Apoio.
-- Os valores padrão preservam todos os vínculos criados antes desta migration.
ALTER TABLE "vinculos_rede_apoio"
ADD COLUMN "icone_id" TEXT NOT NULL DEFAULT 'pessoa';

ALTER TABLE "vinculos_rede_apoio"
ADD COLUMN "cor_id" TEXT NOT NULL DEFAULT 'branco';