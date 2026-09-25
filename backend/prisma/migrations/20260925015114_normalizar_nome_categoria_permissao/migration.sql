/*
  Warnings:

  - Added the required column `nome_normalizado` to the `categorias_permissao` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categorias_permissao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titular_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_normalizado" TEXT NOT NULL,
    "conjunto_dados_visiveis" JSONB NOT NULL DEFAULT [],
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "categorias_permissao_titular_id_fkey" FOREIGN KEY ("titular_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_categorias_permissao" ("atualizado_em", "conjunto_dados_visiveis", "criado_em", "id", "nome", "titular_id") SELECT "atualizado_em", "conjunto_dados_visiveis", "criado_em", "id", "nome", "titular_id" FROM "categorias_permissao";
DROP TABLE "categorias_permissao";
ALTER TABLE "new_categorias_permissao" RENAME TO "categorias_permissao";
CREATE UNIQUE INDEX "categorias_permissao_id_titular_id_key" ON "categorias_permissao"("id", "titular_id");
CREATE UNIQUE INDEX "categorias_permissao_titular_id_nome_normalizado_key" ON "categorias_permissao"("titular_id", "nome_normalizado");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
