ALTER TABLE "notificacoes" ADD COLUMN "expira_em" DATETIME;
ALTER TABLE "notificacoes" ADD COLUMN "processando_ate" DATETIME;

CREATE TABLE "dispositivos_push" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuario_id" INTEGER NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "sessao_id" INTEGER NOT NULL,
    "instalacao" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "fuso" TEXT NOT NULL,
    "vinculo" TEXT NOT NULL,
    "invalidado_em" DATETIME,
    "atualizado_em" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "dispositivos_push_instalacao_key" ON "dispositivos_push"("instalacao");
CREATE UNIQUE INDEX "dispositivos_push_token_key" ON "dispositivos_push"("token");
CREATE INDEX "dispositivos_push_usuario_id_invalidado_em_idx" ON "dispositivos_push"("usuario_id", "invalidado_em");
CREATE INDEX "dispositivos_push_sessao_id_idx" ON "dispositivos_push"("sessao_id");

CREATE TABLE "entregas_push" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "notificacao_id" INTEGER NOT NULL REFERENCES "notificacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "dispositivo_id" TEXT NOT NULL REFERENCES "dispositivos_push"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "vinculo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "proxima_tentativa" DATETIME NOT NULL,
    "ticket" TEXT,
    "aceita_em" DATETIME,
    "erro" TEXT,
    "atualizado_em" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "entregas_push_notificacao_id_dispositivo_id_vinculo_key"
    ON "entregas_push"("notificacao_id", "dispositivo_id", "vinculo");
CREATE INDEX "entregas_push_status_proxima_tentativa_idx" ON "entregas_push"("status", "proxima_tentativa");

CREATE TABLE "catalogos_notificacao" (
    "versao" INTEGER NOT NULL PRIMARY KEY,
    "dados" JSONB NOT NULL
);
