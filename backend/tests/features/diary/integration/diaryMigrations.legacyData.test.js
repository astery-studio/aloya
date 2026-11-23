import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import Database from 'better-sqlite3';

const migrationsDirectory = fileURLToPath(
    new URL('../../../../prisma/migrations/', import.meta.url)
);
const primeiraMigration = '20260913221156_estrutura_inicial';

function carregarMigracoes() {
    return readdirSync(migrationsDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
}

function inserirDadosLegados(database) {
    const usuario = database
        .prepare(
            `INSERT INTO usuarios
                (nome, data_nascimento, email, senha_hash, papel, atualizado_em)
             VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run('Pessoa de teste', '1990-01-01', 'migration@example.test', 'hash-de-teste', 'titular', '2026-01-01');

    const camposLegados = {
        usuarioId: Number(usuario.lastInsertRowid),
        data: '2026-10-01',
        sintomasFisicos: JSON.stringify(['Cólicas moderadas']),
        sintomasEmocionais: JSON.stringify(['Tranquila']),
        sintomasComportamentais: JSON.stringify(['Sono leve']),
        anotacao: 'Registro legado para validar migrações.',
        temperatura: 36.5,
        relacaoSexual: 1,
        protecao: 1,
        fase: 'folicular',
        atualizadoEm: '2026-10-01'
    };

    const registro = database
        .prepare(
            `INSERT INTO registros_diario
                (usuario_id, data_registro, sintomas_fisicos, sintomas_emocionais,
                 sintomas_comportamentais, anotacao_livre, temperatura_basal_corporal,
                 ocorrencia_relacao_sexual, uso_metodo_protecao, fase_ciclo_associada,
                 atualizado_em)
             VALUES
                (@usuarioId, @data, @sintomasFisicos, @sintomasEmocionais,
                 @sintomasComportamentais, @anotacao, @temperatura, @relacaoSexual,
                 @protecao, @fase, @atualizadoEm)`
        )
        .run(camposLegados);

    return { ...camposLegados, registroId: Number(registro.lastInsertRowid) };
}

test('migrações preservam registros legados do Diário', () => {
    const database = new Database(':memory:');
    database.pragma('foreign_keys = ON');

    try {
        let registroLegado;

        for (const migration of carregarMigracoes()) {
            const sql = readFileSync(join(migrationsDirectory, migration, 'migration.sql'), 'utf8');
            database.exec(sql);

            if (migration === primeiraMigration) {
                registroLegado = inserirDadosLegados(database);
            }
        }

        const registroMigrado = database
            .prepare(
                `SELECT usuario_id, data_registro, sintomas_fisicos, sintomas_emocionais,
                        sintomas_comportamentais, anotacao_livre, temperatura_basal_corporal,
                        ocorrencia_relacao_sexual, uso_metodo_protecao, fase_ciclo_associada,
                        versao
                 FROM registros_diario WHERE id = ?`
            )
            .get(registroLegado.registroId);

        assert.deepEqual(registroMigrado, {
            usuario_id: registroLegado.usuarioId,
            data_registro: registroLegado.data,
            sintomas_fisicos: registroLegado.sintomasFisicos,
            sintomas_emocionais: registroLegado.sintomasEmocionais,
            sintomas_comportamentais: registroLegado.sintomasComportamentais,
            anotacao_livre: registroLegado.anotacao,
            temperatura_basal_corporal: registroLegado.temperatura,
            ocorrencia_relacao_sexual: registroLegado.relacaoSexual,
            uso_metodo_protecao: registroLegado.protecao,
            fase_ciclo_associada: registroLegado.fase,
            versao: 0
        });

        assert.deepEqual(database.pragma('foreign_key_check'), []);
    } finally {
        database.close();
    }
});
