-- Adiciona exclusão lógica para preservar o histórico de usos do anticoncepcional.
ALTER TABLE "anticoncepcionais" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "anticoncepcionais" ADD COLUMN "removido_em" DATETIME;

-- Substitui o índice simples por um índice adequado às listagens de registros ativos.
DROP INDEX "anticoncepcionais_usuario_id_idx";
CREATE INDEX "anticoncepcionais_usuario_id_ativo_idx" ON "anticoncepcionais"("usuario_id", "ativo");