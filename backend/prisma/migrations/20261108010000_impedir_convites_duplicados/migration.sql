-- Impede dois vínculos simultâneos para o mesmo contato e titular.
-- Registros revogados e recusados permanecem no histórico e podem ser recriados.
CREATE UNIQUE INDEX
    "vinculos_rede_apoio_titular_email_pendente_ativo_key"
ON "vinculos_rede_apoio"("titular_id", "email_convidado")
WHERE "status" IN ('pendente', 'ativo');
