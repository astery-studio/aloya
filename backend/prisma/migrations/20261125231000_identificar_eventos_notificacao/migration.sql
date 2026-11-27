ALTER TABLE "notificacoes" ADD COLUMN "evento" TEXT;
ALTER TABLE "notificacoes" ADD COLUMN "ocorrencia" TEXT;
CREATE UNIQUE INDEX "notificacoes_usuario_id_evento_ocorrencia_key"
    ON "notificacoes"("usuario_id", "evento", "ocorrencia");
