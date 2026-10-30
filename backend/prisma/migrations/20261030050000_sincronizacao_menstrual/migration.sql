CREATE TABLE "sincronizacoes_menstruais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "chave" TEXT NOT NULL,
    "solicitacao" JSONB NOT NULL,
    "resultado" JSONB NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sincronizacoes_menstruais_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "sincronizacoes_menstruais_usuario_id_chave_key" ON "sincronizacoes_menstruais"("usuario_id", "chave");
