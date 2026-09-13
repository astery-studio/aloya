-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "email_confirmado_em" DATETIME,
    "senha_hash" TEXT NOT NULL,
    "genero" TEXT,
    "papel" TEXT NOT NULL,
    "status_conta" TEXT NOT NULL DEFAULT 'pendente_confirmacao_email',
    "duracao_ciclo_informada" INTEGER,
    "duracao_menstruacao_informada" INTEGER,
    "duracao_lutea_informada" INTEGER DEFAULT 14,
    "tema_visual" TEXT NOT NULL DEFAULT 'automatico',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "confirmacoes_email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status_confirmacao" TEXT NOT NULL DEFAULT 'pendente',
    "validade_token" DATETIME NOT NULL,
    "usado_em" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "confirmacoes_email_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "consentimentos_parentais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titular_menor_id" INTEGER NOT NULL,
    "email_responsavel_legal" TEXT NOT NULL,
    "token_confirmacao_hash" TEXT NOT NULL,
    "status_consentimento" TEXT NOT NULL DEFAULT 'pendente',
    "validade_link" DATETIME NOT NULL,
    "respondido_em" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "consentimentos_parentais_titular_menor_id_fkey" FOREIGN KEY ("titular_menor_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "token_sessao_hash" TEXT NOT NULL,
    "dispositivo" TEXT,
    "validade_sessao" DATETIME NOT NULL,
    "revogada_em" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recuperacoes_senha" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "token_recuperacao_hash" TEXT NOT NULL,
    "validade_token" DATETIME NOT NULL,
    "status_link" TEXT NOT NULL DEFAULT 'pendente',
    "usado_em" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recuperacoes_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "registros_ciclo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "data_inicio" DATETIME NOT NULL,
    "data_fim" DATETIME,
    "duracao_menstruacao" INTEGER,
    "duracao_ciclo" INTEGER,
    "classificacao" TEXT NOT NULL DEFAULT 'normal',
    "eh_ciclo_inicial" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "registros_ciclo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dias_menstruacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registro_ciclo_id" INTEGER NOT NULL,
    "data" DATETIME NOT NULL,
    "status_sincronizacao" TEXT NOT NULL DEFAULT 'sincronizado',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dias_menstruacao_registro_ciclo_id_fkey" FOREIGN KEY ("registro_ciclo_id") REFERENCES "registros_ciclo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "previsoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "registro_ciclo_base_id" INTEGER NOT NULL,
    "data_geracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracao_ciclo_prevista" INTEGER NOT NULL,
    "duracao_lutea_usada" INTEGER NOT NULL,
    "duracao_menstruacao_usada" INTEGER NOT NULL,
    "fim_fase_menstrual" DATETIME NOT NULL,
    "inicio_fase_folicular" DATETIME NOT NULL,
    "fim_fase_folicular" DATETIME NOT NULL,
    "data_estimada_ovulacao" DATETIME NOT NULL,
    "inicio_fase_lutea" DATETIME NOT NULL,
    "data_fim_ciclo_previsto" DATETIME NOT NULL,
    "inicio_janela_fertil" DATETIME NOT NULL,
    "fim_janela_fertil" DATETIME NOT NULL,
    "nivel_confianca" TEXT NOT NULL,
    "ciclo_atipico" BOOLEAN NOT NULL DEFAULT false,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "previsoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "previsoes_registro_ciclo_base_id_fkey" FOREIGN KEY ("registro_ciclo_base_id") REFERENCES "registros_ciclo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "registros_diario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "data_registro" DATETIME NOT NULL,
    "sintomas_fisicos" JSONB NOT NULL DEFAULT [],
    "sintomas_emocionais" JSONB NOT NULL DEFAULT [],
    "sintomas_comportamentais" JSONB NOT NULL DEFAULT [],
    "anotacao_livre" TEXT,
    "temperatura_basal_corporal" DECIMAL,
    "ocorrencia_relacao_sexual" BOOLEAN,
    "uso_metodo_protecao" BOOLEAN,
    "fase_ciclo_associada" TEXT,
    "possivel_ovulacao_confirmada" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "registros_diario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "anticoncepcionais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "horarios_programados" JSONB NOT NULL DEFAULT [],
    "frequencia" TEXT,
    "data_validade" DATETIME,
    "nivel_intensidade_alerta" TEXT NOT NULL DEFAULT 'critico',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "anticoncepcionais_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "usos_anticoncepcional" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "anticoncepcional_id" INTEGER NOT NULL,
    "data_uso_programado" DATETIME NOT NULL,
    "horario_programado" TEXT NOT NULL,
    "horario_real_confirmacao" DATETIME,
    "status_uso" TEXT NOT NULL DEFAULT 'pendente',
    "confirmacao_fora_prazo" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "usos_anticoncepcional_anticoncepcional_id_fkey" FOREIGN KEY ("anticoncepcional_id") REFERENCES "anticoncepcionais" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categorias_permissao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titular_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "conjunto_dados_visiveis" JSONB NOT NULL DEFAULT [],
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "categorias_permissao_titular_id_fkey" FOREIGN KEY ("titular_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vinculos_rede_apoio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titular_id" INTEGER NOT NULL,
    "contato_id" INTEGER,
    "email_convidado" TEXT NOT NULL,
    "categoria_id" INTEGER,
    "permissoes_individuais" JSONB NOT NULL DEFAULT [],
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "token_convite_hash" TEXT,
    "data_envio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_expiracao" DATETIME,
    "data_resposta" DATETIME,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "vinculos_rede_apoio_titular_id_fkey" FOREIGN KEY ("titular_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vinculos_rede_apoio_contato_id_fkey" FOREIGN KEY ("contato_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "vinculos_rede_apoio_categoria_id_titular_id_fkey" FOREIGN KEY ("categoria_id", "titular_id") REFERENCES "categorias_permissao" ("id", "titular_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "preferencias_notificacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "ciclo_previsoes_ativo" BOOLEAN NOT NULL DEFAULT true,
    "anticoncepcional_ativo" BOOLEAN NOT NULL DEFAULT true,
    "rede_apoio_ativa" BOOLEAN NOT NULL DEFAULT true,
    "suporte_tecnico_ativo" BOOLEAN NOT NULL DEFAULT true,
    "lembrete_diario_ativo" BOOLEAN NOT NULL DEFAULT true,
    "horario_lembrete_diario" TEXT NOT NULL DEFAULT '20:00',
    "antecedencia_proximo_ciclo" INTEGER NOT NULL DEFAULT 2,
    "antecedencia_aviso_troca" INTEGER NOT NULL DEFAULT 7,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "preferencias_notificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "tipo_origem" TEXT NOT NULL,
    "origem_id" INTEGER,
    "data_hora_programada" DATETIME NOT NULL,
    "data_hora_disparo" DATETIME,
    "intensidade_alerta" TEXT,
    "status_envio" TEXT NOT NULL DEFAULT 'agendada',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversas_suporte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "conversas_suporte_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mensagens_suporte" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conversa_id" INTEGER NOT NULL,
    "remetente" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "status_mensagem" TEXT NOT NULL DEFAULT 'enviando',
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "mensagens_suporte_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas_suporte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "confirmacoes_email_token_hash_key" ON "confirmacoes_email"("token_hash");

-- CreateIndex
CREATE INDEX "confirmacoes_email_usuario_id_status_confirmacao_idx" ON "confirmacoes_email"("usuario_id", "status_confirmacao");

-- CreateIndex
CREATE UNIQUE INDEX "consentimentos_parentais_titular_menor_id_key" ON "consentimentos_parentais"("titular_menor_id");

-- CreateIndex
CREATE UNIQUE INDEX "consentimentos_parentais_token_confirmacao_hash_key" ON "consentimentos_parentais"("token_confirmacao_hash");

-- CreateIndex
CREATE INDEX "consentimentos_parentais_email_responsavel_legal_idx" ON "consentimentos_parentais"("email_responsavel_legal");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_sessao_hash_key" ON "sessoes"("token_sessao_hash");

-- CreateIndex
CREATE INDEX "sessoes_usuario_id_idx" ON "sessoes"("usuario_id");

-- CreateIndex
CREATE INDEX "sessoes_validade_sessao_idx" ON "sessoes"("validade_sessao");

-- CreateIndex
CREATE UNIQUE INDEX "recuperacoes_senha_token_recuperacao_hash_key" ON "recuperacoes_senha"("token_recuperacao_hash");

-- CreateIndex
CREATE INDEX "recuperacoes_senha_usuario_id_status_link_idx" ON "recuperacoes_senha"("usuario_id", "status_link");

-- CreateIndex
CREATE UNIQUE INDEX "registros_ciclo_usuario_id_data_inicio_key" ON "registros_ciclo"("usuario_id", "data_inicio");

-- CreateIndex
CREATE UNIQUE INDEX "dias_menstruacao_registro_ciclo_id_data_key" ON "dias_menstruacao"("registro_ciclo_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "previsoes_usuario_id_key" ON "previsoes"("usuario_id");

-- CreateIndex
CREATE INDEX "previsoes_registro_ciclo_base_id_idx" ON "previsoes"("registro_ciclo_base_id");

-- CreateIndex
CREATE UNIQUE INDEX "registros_diario_usuario_id_data_registro_key" ON "registros_diario"("usuario_id", "data_registro");

-- CreateIndex
CREATE INDEX "anticoncepcionais_usuario_id_idx" ON "anticoncepcionais"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "usos_anticoncepcional_anticoncepcional_id_data_uso_programado_horario_programado_key" ON "usos_anticoncepcional"("anticoncepcional_id", "data_uso_programado", "horario_programado");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_permissao_id_titular_id_key" ON "categorias_permissao"("id", "titular_id");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_permissao_titular_id_nome_key" ON "categorias_permissao"("titular_id", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "vinculos_rede_apoio_token_convite_hash_key" ON "vinculos_rede_apoio"("token_convite_hash");

-- CreateIndex
CREATE INDEX "vinculos_rede_apoio_titular_id_idx" ON "vinculos_rede_apoio"("titular_id");

-- CreateIndex
CREATE INDEX "vinculos_rede_apoio_contato_id_idx" ON "vinculos_rede_apoio"("contato_id");

-- CreateIndex
CREATE INDEX "vinculos_rede_apoio_categoria_id_titular_id_idx" ON "vinculos_rede_apoio"("categoria_id", "titular_id");

-- CreateIndex
CREATE INDEX "vinculos_rede_apoio_email_convidado_status_idx" ON "vinculos_rede_apoio"("email_convidado", "status");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_notificacao_usuario_id_key" ON "preferencias_notificacao"("usuario_id");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_status_envio_idx" ON "notificacoes"("usuario_id", "status_envio");

-- CreateIndex
CREATE INDEX "notificacoes_status_envio_data_hora_programada_idx" ON "notificacoes"("status_envio", "data_hora_programada");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_suporte_usuario_id_key" ON "conversas_suporte"("usuario_id");

-- CreateIndex
CREATE INDEX "mensagens_suporte_conversa_id_criado_em_idx" ON "mensagens_suporte"("conversa_id", "criado_em");
