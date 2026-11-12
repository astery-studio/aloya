import {
    criarDiaryService,
    normalizarResumoRegistro,
    validarDetalhe,
    validarPaginaHistorico,
    validarPrincipal,
    validarResumoDiario
} from '../../../../src/features/diary/services/diaryService';

const resumo = {
    id: 4,
    data: '2026-11-04',
    fase: 'menstrual',
    principais: [
        {
            categoriaId: 'pele',
            categoria: 'Pele',
            valor: 'Espinhas',
            macrocategoriaId: 'corpo_sintomas_fisicos'
        }
    ],
    maisQuantidade: 1,
    trechoAnotacao: ' Anotação ',
    versao: 2,
    atualizadoEm: '2026-11-04T12:00:00.000Z'
};

const detalhe = {
    id: 4,
    data: '2026-11-04',
    fase: 'menstrual',
    ciclo: { dia: 21, numero: 3 },
    versao: 2,
    categorias: [
        {
            id: 'pele',
            macrocategoria: 'Corpo',
            nome: 'Pele',
            opcoes: [{ id: 'pele_espinhas', grupo: 'caracteristicas', nome: 'Espinhas' }]
        }
    ]
};

describe('histórico no diaryService', () => {
    test('lista páginas autenticadas e normaliza o resumo', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            itens: [resumo],
            proximoCursor: 'cursor_1'
        });
        const service = criarDiaryService({ requisicaoAutenticada });
        const signal = new AbortController().signal;
        const pagina = await service.listarHistorico({ limite: 10, cursor: 'anterior_1', signal });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/api/diario/registros?limite=10&cursor=anterior_1',
            signal
        });
        expect(pagina.itens[0]).toMatchObject({
            trechoAnotacao: 'Anotação',
            principais: [
                {
                    categoriaId: 'pele',
                    categoria: 'Pele',
                    valor: 'Espinhas',
                    macrocategoriaId: 'corpo_sintomas_fisicos'
                }
            ]
        });
        expect(Object.isFrozen(pagina)).toBe(true);
    });

    test('serializa filtros combinados e ordenados no histórico', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            itens: [],
            proximoCursor: null
        });
        const service = criarDiaryService({ requisicaoAutenticada });

        await service.listarHistorico({
            filtros: {
                dataInicio: '2026-11-01',
                dataFim: '2026-11-12',
                categorias: ['pele', 'fluxo_menstrual'],
                fases: ['lutea', 'menstrual']
            }
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho:
                '/api/diario/registros?limite=20&dataInicio=2026-11-01&dataFim=2026-11-12&categorias=fluxo_menstrual%2Cpele&fases=lutea%2Cmenstrual'
        });
    });

    test('preserva registros antigos sem fase sem rejeitar a página inteira', () => {
        const legado = { ...resumo, id: 5, fase: null };

        expect(
            validarPaginaHistorico({ itens: [resumo, legado], proximoCursor: null }).itens
        ).toHaveLength(2);
        expect(normalizarResumoRegistro(legado).fase).toBeNull();
        expect(validarDetalhe({ ...detalhe, fase: null }).fase).toBeNull();
    });

    test('aceita ausência explícita de ciclo e rejeita contexto menstrual inválido', () => {
        expect(validarDetalhe({ ...detalhe, ciclo: null }).ciclo).toBeNull();
        expect(() => validarDetalhe({ ...detalhe, ciclo: { dia: 0, numero: 3 } })).toThrow(
            'carregar este registro'
        );
    });

    test('busca detalhe e exclui com If-Match versionado', async () => {
        const requisicaoAutenticada = jest
            .fn()
            .mockResolvedValueOnce(detalhe)
            .mockResolvedValueOnce(null);
        const service = criarDiaryService({ requisicaoAutenticada });
        await expect(service.buscarDetalhe(4)).resolves.toBe(detalhe);
        await expect(service.excluirRegistro(4, 2)).resolves.toBe(true);
        expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, {
            metodo: 'GET',
            caminho: '/api/diario/registros/4'
        });
        expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, {
            metodo: 'DELETE',
            caminho: '/api/diario/registros/4',
            ifMatch: '"2"'
        });
    });

    test('rejeita identificadores, versões, limites e cursores inválidos', async () => {
        const service = criarDiaryService({ requisicaoAutenticada: jest.fn() });
        await expect(service.buscarDetalhe(0)).rejects.toThrow('identificador');
        await expect(service.excluirRegistro(1, -1)).rejects.toThrow('versão');
        await expect(service.listarHistorico({ limite: 0 })).rejects.toThrow('limite');
        await expect(service.listarHistorico({ cursor: 'cursor com espaço' })).rejects.toThrow(
            'cursor'
        );
    });

    test('nunca aceita saúde sexual no resumo', () => {
        expect(() =>
            normalizarResumoRegistro({
                ...resumo,
                principais: [
                    {
                        categoriaId: 'atividade_sexual',
                        categoria: 'Atividade sexual',
                        valor: 'Dado íntimo'
                    }
                ]
            })
        ).toThrow('histórico do Diário');
    });

    test('valida a macrocategoria usada pelo ícone do resumo', () => {
        const principal = {
            categoriaId: 'pele',
            categoria: 'Pele',
            valor: 'Espinhas',
            macrocategoriaId: 'corpo_sintomas_fisicos'
        };
        expect(validarPrincipal(principal)).toBe(true);
        expect(validarPrincipal({ ...principal, macrocategoriaId: '' })).toBe(false);
    });

    test.each([
        null,
        {},
        { itens: [], proximoCursor: 1 },
        { itens: new Array(51).fill(resumo), proximoCursor: null }
    ])('rejeita página inválida %#', (resposta) => {
        expect(() => validarPaginaHistorico(resposta)).toThrow('histórico do Diário');
    });

    test('rejeita detalhe e opções malformados', () => {
        expect(() => validarDetalhe(null)).toThrow('carregar este registro');
        expect(() => validarDetalhe({ ...detalhe, categorias: [null] })).toThrow(
            'carregar este registro'
        );
        expect(() =>
            validarDetalhe({
                ...detalhe,
                categorias: [{ ...detalhe.categorias[0], opcoes: [{ nome: 1 }] }]
            })
        ).toThrow('carregar este registro');
    });

    test('cobre opções e parâmetros opcionais sem ampliar o contrato', async () => {
        expect(
            normalizarResumoRegistro({
                ...resumo,
                trechoAnotacao: null,
                atualizadoEm: undefined
            })
        ).toMatchObject({ trechoAnotacao: null, atualizadoEm: null });
        expect(
            validarDetalhe({
                ...detalhe,
                categorias: [{ ...detalhe.categorias[0], opcoes: undefined }]
            })
        ).toBeTruthy();

        const signal = new AbortController().signal;
        const requisicaoAutenticada = jest
            .fn()
            .mockResolvedValueOnce({ itens: [], proximoCursor: null })
            .mockResolvedValueOnce(detalhe)
            .mockResolvedValueOnce(null);
        const service = criarDiaryService({ requisicaoAutenticada });
        await service.listarHistorico();
        await service.buscarDetalhe(4, { signal });
        await service.excluirRegistro(4, 2, { signal });

        expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, {
            metodo: 'GET',
            caminho: '/api/diario/registros?limite=20'
        });
        expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, {
            metodo: 'GET',
            caminho: '/api/diario/registros/4',
            signal
        });
        expect(requisicaoAutenticada).toHaveBeenNthCalledWith(3, {
            metodo: 'DELETE',
            caminho: '/api/diario/registros/4',
            ifMatch: '"2"',
            signal
        });
    });

    test('preserva conflitos e oculta falhas técnicas de exclusão', async () => {
        const conflito = Object.assign(new Error('técnico'), { status: 409, codigo: 'CONFLITO' });
        const serviceConflito = criarDiaryService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(conflito)
        });
        await expect(serviceConflito.excluirRegistro(1, 0)).rejects.toBe(conflito);

        const serviceFalha = criarDiaryService({
            requisicaoAutenticada: jest.fn().mockRejectedValue(new Error('SQL privado'))
        });
        await expect(serviceFalha.excluirRegistro(1, 0)).rejects.toMatchObject({
            mensagemUsuario:
                'Ocorreu um erro ao excluir registro. Verifique sua conexão e tente novamente.'
        });
    });

    test('busca e valida o resumo personalizado da fase', async () => {
        const resposta = {
            fase: 'ovulatoria',
            diasRegistrados: 8,
            quantidadeRegistrosFase: 3,
            informacoesSuficientes: true,
            destaques: [{ categoriaId: 'sintomas_fisicos', valor: ' Fadiga ', ocorrencias: 2 }]
        };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);
        const service = criarDiaryService({ requisicaoAutenticada });
        const signal = new AbortController().signal;
        await expect(service.buscarResumo('ovulacao', { signal })).resolves.toMatchObject({
            destaques: [{ valor: 'Fadiga' }]
        });
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/api/diario/resumo?fase=ovulatoria',
            signal
        });
        await service.buscarResumo('ovulacao');
        expect(requisicaoAutenticada).toHaveBeenLastCalledWith({
            metodo: 'GET',
            caminho: '/api/diario/resumo?fase=ovulatoria'
        });
        await expect(service.buscarResumo('desconhecida')).rejects.toThrow('fase do resumo');
        expect(() =>
            validarResumoDiario(
                { ...resposta, informacoesSuficientes: true, destaques: [] },
                'ovulatoria'
            )
        ).toThrow('histórico do Diário');
        expect(() =>
            validarResumoDiario(
                {
                    ...resposta,
                    destaques: [
                        {
                            categoriaId: 'atividade_sexual',
                            valor: 'privado',
                            ocorrencias: 2
                        }
                    ]
                },
                'ovulatoria'
            )
        ).toThrow('histórico do Diário');
    });
});
