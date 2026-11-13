CREATE TABLE "macrocategorias_diario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "nome_compacto" TEXT,
    "ordem" INTEGER NOT NULL,
    "sensivel" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "categorias_diario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "macrocategoria_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo_valor" TEXT NOT NULL DEFAULT 'opcoes',
    "sensivel" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "categorias_diario_macrocategoria_id_fkey"
        FOREIGN KEY ("macrocategoria_id") REFERENCES "macrocategorias_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "opcoes_diario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoria_id" TEXT NOT NULL,
    "grupo" TEXT,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    CONSTRAINT "opcoes_diario_categoria_id_fkey"
        FOREIGN KEY ("categoria_id") REFERENCES "categorias_diario" ("id")
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "macrocategorias_diario_ordem_key"
    ON "macrocategorias_diario"("ordem");
CREATE INDEX "categorias_diario_macrocategoria_id_idx"
    ON "categorias_diario"("macrocategoria_id");
CREATE UNIQUE INDEX "categorias_diario_macrocategoria_id_ordem_key"
    ON "categorias_diario"("macrocategoria_id", "ordem");
CREATE INDEX "opcoes_diario_categoria_id_idx"
    ON "opcoes_diario"("categoria_id");
CREATE UNIQUE INDEX "opcoes_diario_categoria_id_ordem_key"
    ON "opcoes_diario"("categoria_id", "ordem");
