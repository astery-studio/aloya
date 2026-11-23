ALTER TABLE "registros_diario"
    ADD COLUMN "versao" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "registros_diario_categorias" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registro_id" INTEGER NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "macrocategoria_nome" TEXT NOT NULL,
    "categoria_nome" TEXT NOT NULL,
    "valor_escalado" INTEGER,
    "casas_decimais" INTEGER,
    "valor_duracao_minutos" INTEGER,
    "valor_texto" TEXT,
    CONSTRAINT "registros_diario_categorias_registro_id_fkey"
        FOREIGN KEY ("registro_id") REFERENCES "registros_diario" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registros_diario_categorias_categoria_id_fkey"
        FOREIGN KEY ("categoria_id") REFERENCES "categorias_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "registros_diario_opcoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registro_categoria_id" INTEGER NOT NULL,
    "opcao_id" TEXT NOT NULL,
    "grupo" TEXT,
    "opcao_nome" TEXT NOT NULL,
    CONSTRAINT "registros_diario_opcoes_registro_categoria_id_fkey"
        FOREIGN KEY ("registro_categoria_id") REFERENCES "registros_diario_categorias" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "registros_diario_opcoes_opcao_id_fkey"
        FOREIGN KEY ("opcao_id") REFERENCES "opcoes_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "registros_diario_usuario_id_data_registro_id_idx"
    ON "registros_diario"("usuario_id", "data_registro", "id");
CREATE INDEX "registros_diario_categorias_categoria_id_registro_id_idx"
    ON "registros_diario_categorias"("categoria_id", "registro_id");
CREATE UNIQUE INDEX "registros_diario_categorias_registro_id_categoria_id_key"
    ON "registros_diario_categorias"("registro_id", "categoria_id");
CREATE INDEX "registros_diario_opcoes_opcao_id_idx"
    ON "registros_diario_opcoes"("opcao_id");
CREATE UNIQUE INDEX "registros_diario_opcoes_registro_categoria_id_opcao_id_key"
    ON "registros_diario_opcoes"("registro_categoria_id", "opcao_id");

CREATE TABLE "medicoes_temperatura_basal" (
    "registro_categoria_id" INTEGER NOT NULL PRIMARY KEY,
    "perturbada" BOOLEAN NOT NULL DEFAULT false,
    "motivo_perturbacao" TEXT,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "medicoes_temperatura_basal_registro_categoria_id_fkey"
        FOREIGN KEY ("registro_categoria_id") REFERENCES "registros_diario_categorias" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "analises_termicas_ciclo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "registro_ciclo_id" INTEGER NOT NULL,
    "algoritmo" TEXT NOT NULL,
    "versao_algoritmo" TEXT NOT NULL,
    "variante" TEXT NOT NULL,
    "disponibilidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "provisorio" BOOLEAN NOT NULL DEFAULT true,
    "janelas_avaliaveis" INTEGER NOT NULL DEFAULT 0,
    "configuracao" JSONB NOT NULL,
    "sequencias" JSONB NOT NULL,
    "evidencia_aplicada" BOOLEAN NOT NULL DEFAULT false,
    "avaliado_ate" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "analises_termicas_ciclo_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "analises_termicas_ciclo_registro_ciclo_id_fkey"
        FOREIGN KEY ("registro_ciclo_id") REFERENCES "registros_ciclo" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "analises_termicas_ciclo_registro_ciclo_id_versao_algoritmo_variante_disponibilidade_key"
    ON "analises_termicas_ciclo"("registro_ciclo_id", "versao_algoritmo", "variante", "disponibilidade");
CREATE INDEX "analises_termicas_ciclo_usuario_id_registro_ciclo_id_idx"
    ON "analises_termicas_ciclo"("usuario_id", "registro_ciclo_id");
