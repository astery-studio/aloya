CREATE TABLE "configuracoes_diario" (
    "usuario_id" INTEGER NOT NULL PRIMARY KEY,
    "versao" INTEGER NOT NULL DEFAULT 0,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "configuracoes_diario_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "preferencias_macrocategorias_diario" (
    "usuario_id" INTEGER NOT NULL,
    "macrocategoria_id" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" DATETIME NOT NULL,
    PRIMARY KEY ("usuario_id", "macrocategoria_id"),
    CONSTRAINT "preferencias_macrocategorias_diario_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "preferencias_macrocategorias_diario_macrocategoria_id_fkey"
        FOREIGN KEY ("macrocategoria_id") REFERENCES "macrocategorias_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "preferencias_categorias_diario" (
    "usuario_id" INTEGER NOT NULL,
    "categoria_id" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "atualizado_em" DATETIME NOT NULL,
    PRIMARY KEY ("usuario_id", "categoria_id"),
    CONSTRAINT "preferencias_categorias_diario_usuario_id_fkey"
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "preferencias_categorias_diario_categoria_id_fkey"
        FOREIGN KEY ("categoria_id") REFERENCES "categorias_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "preferencias_macrocategorias_diario_macrocategoria_id_idx"
    ON "preferencias_macrocategorias_diario"("macrocategoria_id");
CREATE INDEX "preferencias_categorias_diario_categoria_id_idx"
    ON "preferencias_categorias_diario"("categoria_id");
