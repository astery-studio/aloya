//Testa o cadastro e a listagem segura dos anticoncepcionais ativos.
import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContraceptiveService } from '../../../../src/features/contraceptives/services/contraceptive.service.js';

const agora = new Date('2026-09-24T07:00:00.000Z');

//Cria um registro semelhante ao devolvido pelo Prisma.
function registro(dados = {}) {
    return {
        id: 7,
        usuarioId: 3,
        nome: 'Mercilon',
        tipo: 'pilula',
        horariosProgramados: ['08:00'],
        frequencia: 'uso_21_dias_pausa_7_dias',
        dataInicioUso: new Date('2026-09-01T00:00:00.000Z'),
        dataValidade: null,
        nivelIntensidadeAlerta: 'critico',
        periodosPausa: [],
        ativo: true,
        removidoEm: null,
        criadoEm: agora,
        ...dados
    };
}

test('persiste cadastro vinculado exclusivamente ao usuário autenticado', async () => {
    let criacao;

    const prisma = {
        anticoncepcional: {
            async create(argumento) {
                criacao = argumento.data;
                return registro({
                    ...argumento.data,
                    id: 7,
                    criadoEm: agora
                });
            }
        }
    };

    const service = criarContraceptiveService(prisma, () => agora);

    const resultado = await service.cadastrar(3, {
        nome: 'Mercilon',
        tipo: 'pilula',
        frequenciaId: 'pilula_21_7',
        horarios: ['08:00'],
        dataPrimeiroUso: '2026-09-01'
    });

    assert.equal(criacao.usuarioId, 3);
    assert.equal(criacao.dataInicioUso.toISOString(), '2026-09-01T00:00:00.000Z');
    assert.equal(criacao.nivelIntensidadeAlerta, 'critico');
    assert.equal(criacao.periodosPausa[0].inicio, '2026-09-22');
    assert.equal(resultado.id, 7);
    assert.equal(resultado.proximoUsoPrevisto, '2026-09-29T08:00:00.000Z');
});

test('lista somente registros ativos do usuário e ordena pelos mais recentes', async () => {
    let consulta;

    const prisma = {
        anticoncepcional: {
            async findMany(argumento) {
                consulta = argumento;
                return [registro({
                    frequencia: 'uso_continuo'
                })];
            }
        }
    };

    const service = criarContraceptiveService(prisma, () => agora);
    const resultado = await service.listar(9);

    assert.deepEqual(consulta.where, {
        usuarioId: 9,
        ativo: true
    });

    assert.deepEqual(consulta.orderBy, {
        criadoEm: 'desc'
    });

    assert.equal(resultado[0].nome, 'Mercilon');
});