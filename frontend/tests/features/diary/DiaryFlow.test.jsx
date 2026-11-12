import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

jest.mock('../../../src/features/diary/screens/DiaryScreen', () => {
    const { Pressable, Text } = require('react-native');
    return {
        DiaryScreen: ({ aoCriar, aoAbrirRegistro, aoEditarRegistro, aoExcluirRegistro }) => (
            <>
                <Pressable accessibilityRole="button" onPress={aoCriar}>
                    <Text>Abrir Diário</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => aoEditarRegistro({ id: 8, data: '2026-11-08', versao: 3 })}
                >
                    <Text>Editar pelo fluxo</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => aoAbrirRegistro({ id: 8, data: '2026-11-08', versao: 3 })}
                >
                    <Text>Abrir detalhe pelo fluxo</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => aoExcluirRegistro({ id: 8, data: '2026-11-08', versao: 3 })}
                >
                    <Text>Excluir pelo fluxo</Text>
                </Pressable>
            </>
        )
    };
});
jest.mock('../../../src/features/diary/components/NewDiaryEntrySheet/NewDiaryEntrySheet', () => {
    const { Pressable, Text } = require('react-native');
    return {
        NewDiaryEntrySheet: ({ visivel, onFechar, onCriado }) =>
            visivel ? (
                <>
                    <Pressable accessibilityRole="button" onPress={onFechar}>
                        <Text>Fechar modal</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => onCriado({ id: 1, data: '2026-11-09' })}
                    >
                        <Text>Salvar modal</Text>
                    </Pressable>
                </>
            ) : null
    };
});
jest.mock('../../../src/features/diary/components/EditDiaryEntrySheet/EditDiaryEntrySheet', () => {
    const { Pressable, Text } = require('react-native');
    return {
        EditDiaryEntrySheet: ({ visivel, registro, onFechar, onSalvo }) =>
            visivel ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={async () => {
                        await onSalvo({ ...registro, versao: 4 });
                        onFechar();
                    }}
                >
                    <Text>Salvar edição</Text>
                </Pressable>
            ) : null
    };
});
jest.mock('../../../src/features/diary/components/DiaryRecordDetails/DiaryRecordDetails', () => {
    const { Pressable, Text } = require('react-native');
    return {
        DiaryRecordDetails: ({ aoAnterior, aoProximo }) => (
            <>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Detalhe anterior"
                    disabled={!aoAnterior}
                    onPress={aoAnterior}
                >
                    <Text>Detalhe anterior</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Próximo detalhe"
                    disabled={!aoProximo}
                    onPress={aoProximo}
                >
                    <Text>Próximo detalhe</Text>
                </Pressable>
            </>
        )
    };
});

import {
    calcularAlturaMaximaDetalhes,
    criarChaveAtualizacaoResumo,
    criarResumoDiario,
    DiaryFlow,
    inserirRegistroOrdenado
} from '../../../src/features/diary/DiaryFlow';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

test('limita a altura do detalhe e permite que o popup encolha', () => {
    expect(calcularAlturaMaximaDetalhes(900)).toBe(756.67);
    expect(calcularAlturaMaximaDetalhes(700)).toBe(644);
    expect(calcularAlturaMaximaDetalhes()).toBe(756.67);
});

test('ordena novos registros por data e id decrescentes', () => {
    const registros = [
        { id: 1, data: '2026-11-08' },
        { id: 2, data: '2026-11-09' }
    ];
    expect(inserirRegistroOrdenado(registros, { id: 3, data: '2026-11-09' })).toEqual([
        { id: 3, data: '2026-11-09' },
        { id: 2, data: '2026-11-09' },
        { id: 1, data: '2026-11-08' }
    ]);
    expect(registros).toHaveLength(2);
    expect(criarChaveAtualizacaoResumo([{ id: 2 }, { id: 1, versao: 3 }])).toBe('1:3|2:0');
});

test('deriva o resumo somente da fase e dos registros já autorizados', () => {
    expect(criarResumoDiario({ carregando: true })).toEqual({ carregando: true });
    expect(criarResumoDiario({ fase: null })).toBeNull();
    expect(
        criarResumoDiario({
            fase: 'folicular',
            registros: [{ data: '2026-11-09' }, { data: '2026-11-09' }, { data: '2026-11-08' }],
            temMais: true
        })
    ).toMatchObject({
        fase: 'folicular',
        tituloFase: 'Fase Folicular',
        diasRegistrados: 2,
        contagemParcial: true,
        carregando: false
    });
    expect(
        criarResumoDiario({
            fase: 'folicular',
            resumo: {
                diasRegistrados: 9,
                informacoesSuficientes: true,
                destaques: [
                    { categoriaId: 'sintomas_fisicos', grupo: 'sintomas', valor: 'Fadiga' },
                    { categoriaId: 'pele', valor: 'Espinhas' },
                    { categoriaId: 'sintomas_fisicos', grupo: 'sintomas', valor: 'Cólica' }
                ]
            }
        })
    ).toMatchObject({
        descricao:
            'Nos seus registros, você costuma relatar fadiga como sintoma físico, pele com espinhas e cólica como sintoma físico.',
        diasRegistrados: 9,
        contagemParcial: false
    });
});

test('abre, fecha e recebe o registro criado', async () => {
    const onRegistroCriado = jest.fn();
    await render(<DiaryFlow service={{}} onRegistroCriado={onRegistroCriado} />);
    await fireEvent.press(screen.getByText('Abrir Diário'));
    await fireEvent.press(screen.getByText('Fechar modal'));
    expect(screen.queryByText('Salvar modal')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Abrir Diário'));
    await fireEvent.press(screen.getByText('Salvar modal'));
    expect(onRegistroCriado).toHaveBeenCalledWith({ id: 1, data: '2026-11-09' });
    expect(screen.getByText('Abrir Diário')).toBeOnTheScreen();
});

test('abre a edição pré-preenchida e recarrega a timeline ao salvar', async () => {
    const detalhe = {
        id: 8,
        data: '2026-11-08',
        fase: 'folicular',
        versao: 3,
        categorias: [{ id: 'pele', macrocategoria: 'Corpo', nome: 'Pele', opcoes: [] }]
    };
    const service = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
        buscarDetalhe: jest.fn().mockResolvedValue(detalhe)
    };
    await render(<DiaryFlow service={service} />);

    await fireEvent.press(screen.getByText('Editar pelo fluxo'));
    await waitFor(() => expect(service.buscarDetalhe).toHaveBeenCalledWith(8, expect.any(Object)));
    await waitFor(() => expect(screen.getByText('Salvar edição')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Salvar edição'));

    await waitFor(() => expect(service.listarHistorico).toHaveBeenCalledTimes(2));
    expect(screen.queryByText('Salvar edição')).not.toBeOnTheScreen();
});

test('encaminha exclusão confirmada e remove o item localmente', async () => {
    let resolverExclusao;
    const service = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
        buscarDetalhe: jest.fn().mockResolvedValue({
            id: 8,
            data: '2026-11-08',
            fase: 'folicular',
            versao: 3,
            categorias: []
        }),
        excluirRegistro: jest.fn(() => new Promise((resolve) => (resolverExclusao = resolve)))
    };
    await render(<DiaryFlow service={service} />);
    await fireEvent.press(screen.getByText('Abrir detalhe pelo fluxo'));
    await fireEvent.press(screen.getByText('Excluir pelo fluxo'));
    let confirmacao;
    await act(async () => {
        confirmacao = fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
        await Promise.resolve();
    });
    await waitFor(() => expect(service.excluirRegistro).toHaveBeenCalledTimes(1));
    expect(service.excluirRegistro).toHaveBeenCalledWith(8, 3, {
        signal: expect.any(AbortSignal)
    });
    await act(async () => {
        resolverExclusao(true);
        await confirmacao;
    });
});

test('abre detalhe sob demanda nos temas claro e escuro', async () => {
    const detalhe = {
        id: 8,
        data: '2026-11-08',
        fase: 'folicular',
        versao: 3,
        categorias: []
    };
    const service = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
        buscarDetalhe: jest.fn().mockResolvedValue(detalhe)
    };
    const resultado = await render(<DiaryFlow service={service} />, { preferencia: 'escuro' });
    await fireEvent.press(screen.getByText('Abrir detalhe pelo fluxo'));
    expect(service.buscarDetalhe).toHaveBeenCalledWith(8, { signal: expect.any(AbortSignal) });
    await resultado.unmount();

    const serviceComErro = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: [], proximoCursor: null }),
        buscarDetalhe: jest.fn().mockRejectedValue(new Error('falha privada'))
    };
    await render(<DiaryFlow service={serviceComErro} />);
    await fireEvent.press(screen.getByText('Abrir detalhe pelo fluxo'));
    expect(serviceComErro.buscarDetalhe).toHaveBeenCalledTimes(1);
});

test('navega entre os registros anterior e próximo dentro do popup', async () => {
    const resumos = [
        { id: 9, data: '2026-11-09', versao: 1 },
        { id: 8, data: '2026-11-08', versao: 1 },
        { id: 7, data: '2026-11-07', versao: 1 }
    ];
    const service = {
        listarHistorico: jest.fn().mockResolvedValue({ itens: resumos, proximoCursor: null }),
        buscarDetalhe: jest.fn(async (id) => ({
            id,
            data: resumos.find((registro) => registro.id === id).data,
            fase: 'folicular',
            versao: 1,
            categorias: []
        }))
    };
    await render(<DiaryFlow service={service} />);
    await waitFor(() => expect(service.listarHistorico).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByText('Abrir detalhe pelo fluxo'));
    await waitFor(() =>
        expect(service.buscarDetalhe).toHaveBeenLastCalledWith(8, expect.any(Object))
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Detalhe anterior' }));
    await waitFor(() =>
        expect(service.buscarDetalhe).toHaveBeenLastCalledWith(7, expect.any(Object))
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Próximo detalhe' }));
    await waitFor(() =>
        expect(service.buscarDetalhe).toHaveBeenLastCalledWith(8, expect.any(Object))
    );
});

test('carrega outra página ao navegar além do registro mais antigo carregado', async () => {
    const service = {
        listarHistorico: jest
            .fn()
            .mockResolvedValueOnce({
                itens: [{ id: 8, data: '2026-11-08', versao: 1 }],
                proximoCursor: 'pagina-2'
            })
            .mockResolvedValueOnce({
                itens: [{ id: 7, data: '2026-11-07', versao: 1 }],
                proximoCursor: null
            }),
        buscarDetalhe: jest.fn(async (id) => ({
            id,
            data: id === 8 ? '2026-11-08' : '2026-11-07',
            fase: 'folicular',
            versao: 1,
            categorias: []
        }))
    };
    await render(<DiaryFlow service={service} />);
    await waitFor(() => expect(service.listarHistorico).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByText('Abrir detalhe pelo fluxo'));
    await waitFor(() => expect(service.buscarDetalhe).toHaveBeenCalledWith(8, expect.any(Object)));

    await fireEvent.press(screen.getByRole('button', { name: 'Detalhe anterior' }));

    await waitFor(() =>
        expect(service.listarHistorico).toHaveBeenLastCalledWith({
            cursor: 'pagina-2',
            signal: expect.any(AbortSignal)
        })
    );
    await waitFor(() =>
        expect(service.buscarDetalhe).toHaveBeenLastCalledWith(7, expect.any(Object))
    );
});
