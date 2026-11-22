ALTER TABLE "medicoes_temperatura_basal"
    ADD COLUMN "valor_original" TEXT NOT NULL DEFAULT '';
ALTER TABLE "medicoes_temperatura_basal"
    ADD COLUMN "unidade" TEXT NOT NULL DEFAULT 'celsius';
ALTER TABLE "medicoes_temperatura_basal"
    ADD COLUMN "precisao_casas" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "medicoes_temperatura_basal"
    ADD COLUMN "estado_utilizacao" TEXT NOT NULL DEFAULT 'elegivel';

UPDATE "medicoes_temperatura_basal"
SET "valor_original" = (
    SELECT printf('%.1f', categoria."valor_escalado" / 10.0)
    FROM "registros_diario_categorias" AS categoria
    WHERE categoria."id" = "medicoes_temperatura_basal"."registro_categoria_id"
);

UPDATE "medicoes_temperatura_basal"
SET "estado_utilizacao" = 'nao_utilizada_interferencia'
WHERE "perturbada" = true;

UPDATE "analises_termicas_ciclo"
SET "estado" = 'nenhuma_elevacao_identificada'
WHERE "estado" = 'nenhuma_elevacao_detectada';

UPDATE "analises_termicas_ciclo"
SET "estado" = 'inconclusivo'
WHERE "estado" = 'padrao_termico_ambiguo';
