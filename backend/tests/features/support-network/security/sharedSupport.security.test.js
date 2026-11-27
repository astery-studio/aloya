import assert from 'node:assert/strict';
import test from 'node:test';
import { criarSharedSupportRoutes } from '../../../../src/features/support-network/routes/sharedSupport.routes.js';
import { criarSharedSupportAccess } from '../../../../src/features/support-network/services/sharedSupportAccess.service.js';
import { criarSharedSupportData } from '../../../../src/features/support-network/services/sharedSupportData.service.js';
import { criarSharedSupportDiary } from '../../../../src/features/support-network/services/sharedSupportDiary.service.js';

const vinculo = {
    titularId: 4,
    titular: { nome: 'Júlia' },
    categoriaId: null,
    permissoesIndividuais: ['geral.fase_atual', 'corpo.pele']
};

test('limita a consulta ao vínculo ativo do contato autenticado', async () => {
    const access = criarSharedSupportAccess({
        prisma: {
            vinculoRedeApoio: {
                findFirst({ where }) {
                    assert.deepEqual(where, { id: 11, contatoId: 8, status: 'ativo' });
                    return null;
                }
            }
        }
    });
    await assert.rejects(
        access.consultarDados({ contatoId: 8, vinculoId: '11' }, () => assert.fail()),
        { status: 403 }
    );
});

test('usa a categoria vigente em vez das permissões antigas e invalida redução concorrente', async () => {
    let conjuntoDadosVisiveis = ['geral.fase_atual'];
    const access = criarSharedSupportAccess({
        prisma: {
            vinculoRedeApoio: {
                findFirst: () => ({
                    ...vinculo,
                    categoriaId: 5,
                    categoria: { conjuntoDadosVisiveis }
                })
            }
        }
    });
    const consulta = { contatoId: 8, vinculoId: '11' };
    await assert.rejects(
        access.consultarDados({ ...consulta, permissao: 'corpo.pele' }, () => assert.fail()),
        { status: 403 }
    );
    await assert.rejects(
        access.consultarDados({ ...consulta, permissao: 'geral.fase_atual' }, () => {
            conjuntoDadosVisiveis = [];
            return { faseAtual: 'LUTEA' };
        }),
        { status: 403 }
    );
    await assert.rejects(
        access.consultarDados({ ...consulta, permissao: 'geral.fase_atual' }, () => assert.fail()),
        { status: 403 }
    );
});

test('filtra categorias no banco e na resposta e rejeita ID ou filtro fora do acesso', async () => {
    const data = new Date('2026-11-26');
    const registro = {
        id: 7,
        faseCicloAssociada: 'lutea',
        checkInRealizado: true,
        dataRegistro: data,
        criadoEm: data,
        atualizadoEm: data,
        categorias: ['pele', 'anotacao_livre'].map((categoriaId) => ({
            categoriaId,
            categoriaNome: categoriaId === 'pele' ? 'Pele' : 'Anotação livre',
            macrocategoriaNome: 'Corpo e Sintomas Físicos',
            opcoes: categoriaId === 'pele' ? [{ opcaoId: 'espinhas', opcaoNome: 'Espinhas' }] : [],
            valorEscalado: null,
            valorDuracaoMinutos: null,
            valorTexto: categoriaId === 'anotacao_livre' ? 'Informação privada' : null
        }))
    };
    const diary = criarSharedSupportDiary({
        prisma: {
            preferenciaMacrocategoriaDiario: { findMany: () => [] },
            preferenciaCategoriaDiario: { findMany: () => [] },
            registroDiario: {
                findMany({ where, include }) {
                    assert.equal(where.usuarioId, 4);
                    assert.deepEqual(where.AND[0].categorias.some.categoriaId.in, ['pele']);
                    assert.deepEqual(include.categorias.where.categoriaId.in, ['pele']);
                    return [registro];
                },
                findFirst({ where }) {
                    assert.equal(where.usuarioId, 4);
                    assert.deepEqual(where.categorias.some.categoriaId.in, ['pele']);
                    return where.id === 7 ? registro : null;
                }
            }
        }
    });
    const acesso = { titularId: 4, permissoes: ['corpo.pele'] };
    const { itens } = await diary.listar(acesso, {});
    assert.deepEqual(Object.keys(itens[0]), [
        'id',
        'data',
        'principais',
        'maisQuantidade',
        'trechoAnotacao'
    ]);
    assert.deepEqual(
        itens[0].principais.map(({ categoriaId }) => categoriaId),
        ['pele']
    );
    assert.deepEqual(
        (await diary.buscar(acesso, '7')).categorias.map(({ id }) => id),
        ['pele']
    );
    assert.deepEqual(
        (await diary.catalogo(acesso)).macrocategorias[0].categorias.map(({ id }) => id),
        ['pele']
    );
    await assert.rejects(diary.buscar(acesso, '9'), { status: 403 });
    await assert.rejects(diary.listar(acesso, { categorias: 'anotacao_livre' }), { status: 403 });
    await assert.rejects(diary.listar(acesso, { fases: 'lutea' }), { status: 403 });
});

test('separa calendário, dicas, fase e intensidade do alerta', async () => {
    const data = criarSharedSupportData({
        calendarService: {
            buscarMes(consulta) {
                assert.deepEqual(consulta, { usuarioId: 4, mes: '2026-11' });
                return {
                    mes: '2026-11',
                    possuiCiclos: true,
                    diasMenstruacao: [{ data: '2026-11-02', registroCicloId: 19 }],
                    previsao: {
                        nivelConfianca: 'alta',
                        versaoAlgoritmo: 'privada',
                        periodos: [{ previsto: true, ovulacao: '2026-11-16', registroCicloId: 19 }]
                    }
                };
            }
        },
        currentCycleService: {
            buscarEstadoAtual: () => ({ faseAtual: 'LUTEA', proximoInicioEstimado: '2026-12-02' })
        },
        contraceptiveService: {
            listar: () => [
                {
                    id: 4,
                    horarios: ['12:00'],
                    intensidadeAlerta: 'critico',
                    historico: [],
                    statusUltimoUso: 'confirmado'
                }
            ]
        }
    });
    assert.deepEqual(await data.fase(vinculo), { faseAtual: 'LUTEA' });
    assert.deepEqual(data.dicas().fases, ['menstrual', 'folicular', 'ovulatoria', 'lutea']);
    const historicoAutorizado = { titularId: 4, permissoes: ['geral.historico_ciclo'] };
    assert.deepEqual(await data.calendario(historicoAutorizado, { mes: '2026-11' }), {
        mes: '2026-11',
        possuiCiclos: true,
        diasMenstruacao: ['2026-11-02'],
        permitePrevisoes: false,
        previsao: null
    });
    const comPrevisao = await data.calendario(
        { titularId: 4, permissoes: ['geral.historico_ciclo', 'geral.fase_atual'] },
        { mes: '2026-11' }
    );
    assert.equal(comPrevisao.permitePrevisoes, true);
    assert.deepEqual(JSON.parse(JSON.stringify(comPrevisao.previsao)), {
        periodos: [{ previsto: true, ovulacao: '2026-11-16' }]
    });
    const { itens } = await data.anticoncepcionais(vinculo, {});
    assert.equal(Object.hasOwn(itens[0], 'intensidadeAlerta'), false);
    assert.deepEqual(itens[0].horarios, ['12:00']);
    assert.equal(itens[0].statusUltimoUso, 'confirmado');
});

test('encaminha identidade da sessão e proíbe cache nas rotas de leitura', async () => {
    const rotas = new Map();
    const autenticar = () => {};
    const exigirAcessoRedeApoio = () => {};
    const access = criarSharedSupportAccess({
        prisma: { vinculoRedeApoio: { findFirst: () => vinculo } }
    });
    criarSharedSupportRoutes({
        Router: () => ({ get: (caminho, ...handlers) => rotas.set(caminho, handlers) }),
        authMiddleware: { autenticar },
        parentalConsentMiddleware: { exigirAcessoRedeApoio },
        sharedSupport: { access, data: { fase: () => ({ faseAtual: 'LUTEA' }) }, diary: {} }
    });
    const [auth, consentimento, handler] = rotas.get('/received-contacts/:vinculoId/shared/fase');
    assert.equal(auth, autenticar);
    assert.equal(consentimento, exigirAcessoRedeApoio);
    const resposta = await handler(
        { usuario: { id: 8 }, params: { vinculoId: '11' }, query: { usuarioId: '10' } },
        {
            set: (chave, valor) =>
                assert.deepEqual([chave, valor], ['Cache-Control', 'private, no-store']),
            json: (resultado) => resultado
        },
        (erro) => {
            throw erro;
        }
    );
    assert.deepEqual(resposta, {
        permissoes: ['geral.fase_atual', 'corpo.pele'],
        dados: { faseAtual: 'LUTEA' }
    });
});
