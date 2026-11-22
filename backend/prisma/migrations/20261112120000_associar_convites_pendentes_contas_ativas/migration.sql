-- Repara convites antigos criados antes de contas principais também poderem
-- atuar como contato de apoio. A associação não aceita o convite nem concede
-- acesso: apenas permite que a conta destinatária o visualize e decida.
UPDATE "vinculos_rede_apoio" AS "vinculo"
SET "contato_id" = (
    SELECT "usuario"."id"
    FROM "usuarios" AS "usuario"
    WHERE LOWER(TRIM("usuario"."email")) = LOWER(TRIM("vinculo"."email_convidado"))
      AND "usuario"."status_conta" = 'ativa'
    LIMIT 1
)
WHERE "vinculo"."contato_id" IS NULL
  AND "vinculo"."status" = 'pendente'
  AND EXISTS (
      SELECT 1
      FROM "usuarios" AS "usuario"
      WHERE LOWER(TRIM("usuario"."email")) = LOWER(TRIM("vinculo"."email_convidado"))
        AND "usuario"."status_conta" = 'ativa'
  );
