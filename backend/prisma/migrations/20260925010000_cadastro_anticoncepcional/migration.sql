ALTER TABLE "anticoncepcionais" ADD COLUMN "data_primeiro_uso" DATETIME;
ALTER TABLE "anticoncepcionais" ADD COLUMN "periodos_pausa" JSONB NOT NULL DEFAULT '[]';
