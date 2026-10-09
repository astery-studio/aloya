//Testa calendário, autenticação e isolamento entre usuárias usando SQLite real.
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {
    mkdtempSync,
    readFileSync,
    rmSync
} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import test from 'node:test';
import {DatabaseSync as Database} from 'node:sqlite';
import {fileURLToPath} from 'node:url';

import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3';
import prismaPackage from '@prisma/client';
import express from 'express';

import { criarCalendarModule } from '../../../../src/features/calendar/calendar.module.js';
import { criarCalendarRoutes } from '../../../../src/features/calendar/routes/calendar.routes.js';
import { criarAuthMiddleware } from '../../../../src/shared/middleware/auth.middleware.js';
import { tratarErros } from '../../../../src/shared/middleware/error.middleware.js';

const {PrismaClient} = prismaPackage;

const CAMINHO_MIGRATION_INICIAL = fileURLToPath(
    new URL(
        '../../../../prisma/migrations/20260913221156_estrutura_inicial/migration.sql',
        import.meta.url
    )
);

function criarBancoTemporario() {
    const diretorio = mkdtempSync(
        join(tmpdir(), 'aloya-calendario-')
    );
    const caminhoBanco = join(diretorio, 'teste.db');
    const banco = new Database(caminhoBanco);

    banco.exec('PRAGMA foreign_keys = ON');
    banco.exec(
        readFileSync(
            CAMINHO_MIGRATION_INICIAL,
            'utf8'
        )
    );

    banco.exec(`
        INSERT INTO usuarios (
            id,
            nome,
            data_nascimento,
            email,
            senha_hash,
            papel,
            status_conta,
            duracao_lutea_informada,
            criado_em,
            atualizado_em
        )
        VALUES
        (
            1,
            'Ana',
            '2000-01-01T00:00:00.000Z',
            'ana@example.com',
            'hash-ana',
            'principal',
            'ativa',
            14,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ),
        (
            2,
            'Carla',
            '2000-02-01T00:00:00.000Z',
            'carla@example.com',
            'hash-carla',
            'principal',
            'ativa',
            14,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        INSERT INTO sessoes (
            id,
            usuario_id,
            token_sessao_hash,
            validade_sessao,
            atualizado_em
        )
        VALUES (
            1,
            1,
            'hash-token-ana',
            '2099-01-01T00:00:00.000Z',
            CURRENT_TIMESTAMP
        );

        INSERT INTO registros_ciclo (
            id,
            usuario_id,
            data_inicio,
            data_fim,
            duracao_menstruacao,
            duracao_ciclo,
            classificacao,
            eh_ciclo_inicial,
            criado_em,
            atualizado_em
        )
        VALUES
        (
            10,
            1,
            '2026-09-01T00:00:00.000Z',
            '2026-09-05T00:00:00.000Z',
            5,
            28,
            'normal',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ),
        (
            11,
            1,
            '2026-09-29T00:00:00.000Z',
            '2026-10-03T00:00:00.000Z',
            5,
            28,
            'normal',
            false,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        ),
        (
            20,
            2,
            '2026-10-01T00:00:00.000Z',
            '2026-10-05T00:00:00.000Z',
            5,
            28,
            'normal',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        INSERT INTO dias_menstruacao (
            id,
            registro_ciclo_id,
            data,
            status_sincronizacao,
            criado_em
        )
        VALUES
        (
            100,
            11,
            '2026-10-01T00:00:00.000Z',
            'sincronizado',
            CURRENT_TIMESTAMP
        ),
        (
            101,
            11,
            '2026-10-03T00:00:00.000Z',
            'sincronizado',
            CURRENT_TIMESTAMP
        ),
        (
            200,
            20,
            '2026-10-02T00:00:00.000Z',
            'sincronizado',
            CURRENT_TIMESTAMP
        );
    `);

    banco.close();

    return {
        caminhoBanco,
        diretorio
    };
}

async function executarComApi(executar) {
    const {
        caminhoBanco,
        diretorio
    } = criarBancoTemporario();
    const adapter = new PrismaBetterSqlite3({
        url: `file:${caminhoBanco.replaceAll('\\', '/')}`
    });
    const prisma = new PrismaClient({
        adapter
    });
    const calendarModule = criarCalendarModule({
        prisma
    });
    const authMiddleware = criarAuthMiddleware({
        prisma,
        tokenService: {
            validarTokenSessao(token) {
                assert.equal(token, 'token-ana');

                return {
                    usuarioId: 1
                };
            },

            gerarHashToken(token) {
                assert.equal(token, 'token-ana');

                return 'hash-token-ana';
            }
        }
    });
    const app = express();

    app.use(
        '/api/cycles',
        criarCalendarRoutes({
            Router: express.Router,
            authMiddleware,
            calendarController:
                calendarModule.calendarController
        })
    );

    app.use(tratarErros);

    const servidor = app.listen(
        0,
        '127.0.0.1'
    );

    try {
        await once(servidor, 'listening');

        const endereco = servidor.address();

        return await executar(
            `http://127.0.0.1:${endereco.port}/api/cycles/calendar`
        );
    } finally {
        await new Promise((resolve, reject) => {
            servidor.close((erro) => {
                if (erro) {
                    reject(erro);
                    return;
                }

                resolve();
            });
        });

        await prisma.$disconnect();

        rmSync(diretorio, {
            recursive: true,
            force: true
        });
    }
}

test('protege e carrega somente o calendário da usuária autenticada', async () => {
    await executarComApi(async (url) => {
        const respostaSemToken = await fetch(
            `${url}?mes=2026-10`
        );
        const corpoSemToken = await respostaSemToken.json();

        assert.equal(respostaSemToken.status, 401);
        assert.equal(
            corpoSemToken.erro.codigo,
            'NAO_AUTENTICADO'
        );

        const resposta = await fetch(
            `${url}?mes=2026-10`,
            {
                headers: {
                    Authorization: 'Bearer token-ana'
                }
            }
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 200);
        assert.equal(
            resposta.headers.get('cache-control'),
            'private, no-store'
        );
        assert.equal(
            corpo.calendario.mes,
            '2026-10'
        );
        assert.equal(
            corpo.calendario.possuiCiclos,
            true
        );
        assert.deepEqual(
            corpo.calendario.diasMenstruacao,
            [
                {
                    data: '2026-10-01',
                    registroCicloId: 11
                },
                {
                    data: '2026-10-03',
                    registroCicloId: 11
                }
            ]
        );
        assert.equal(
            corpo.calendario.previsao.ovulacao,
            '2026-10-12'
        );
        assert.deepEqual(
            corpo.calendario.previsao.janelaFertil,
            {
                inicio: '2026-10-07',
                fim: '2026-10-12'
            }
        );

        assert.equal(
            JSON.stringify(corpo).includes('"registroCicloId":20'),
            false
        );
        assert.equal(
            JSON.stringify(corpo).includes('2026-10-02'),
            false
        );

        const respostaNovembro = await fetch(`${url}?mes=2026-11`, {
            headers: {Authorization: 'Bearer token-ana'}
        });
        const novembro = await respostaNovembro.json();
        assert.equal(respostaNovembro.status, 200);
        const ultimoPeriodo = novembro.calendario.previsao.periodos.at(-1);
        assert.equal(ultimoPeriodo.previsto, true);
        assert.deepEqual(ultimoPeriodo.menstruacaoPrevista, {
            inicio: '2026-11-24', fim: '2026-11-28'
        });
        assert.deepEqual(ultimoPeriodo.faseFolicular, {
            inicio: '2026-11-29', fim: '2026-11-30'
        });
        assert.deepEqual(novembro.calendario.diasMenstruacao, []);
    });
});

test('rejeita mês inválido pela API sem acessar dados de outro período', async () => {
    await executarComApi(async (url) => {
        const resposta = await fetch(
            `${url}?mes=2026-13`,
            {
                headers: {
                    Authorization: 'Bearer token-ana'
                }
            }
        );
        const corpo = await resposta.json();

        assert.equal(resposta.status, 422);
        assert.equal(
            corpo.erro.codigo,
            'MES_CALENDARIO_INVALIDO'
        );
        assert.equal(
            corpo.erro.mensagem,
            'Informe o mês no formato AAAA-MM.'
        );
    });
});
