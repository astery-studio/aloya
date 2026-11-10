import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_REENVIO,
    useSupportContacts
} from '../../../../src/features/support-network/hooks/useSupportContacts';

function criarContato({ id = 1, status = 'pendente' } = {}) {
    return Object.freeze({
        id,
        nome: 'Ana',
        email: 'ana@example.com',
        identificacao: 'Ana',
        iconeId: 'coracao',
        corId: 'coral',
        status,
        statusRotulo: status === 'pendente' ? 'Pendente' : 'Ativo',
        vinculo: Object.freeze({
            tipo: 'individual',
            rotulo: 'Permissão individual',
            categoria: null,
            permissoes: Object.freeze(['geral.fase_atual'])
        }),
        dataConvite: '2026-11-01T12:00:00.000Z',
        aguardando:
            status === 'pendente'
                ? Object.freeze({
                      dias: 9,
                      atrasado: true,
                      rotulo: 'Aguardando há 9 dias'
                  })
                : null,
        acoes: Object.freeze({
            podeAlterarVinculo: status === 'ativo',
            podeRemover: true,
            podeReenviarConvite: status === 'pendente'
        })
    });
}

function criarListagem(contatos = [criarContato()]) {
    return Object.freeze({
        contatos: Object.freeze(contatos),
        resumo: Object.freeze({
            total: contatos.length,
            pendentes: contatos.filter(({ status }) => status === 'pendente').length,
            ativos: contatos.filter(({ status }) => status === 'ativo').length,
            inativos: contatos.filter(({ status }) => status === 'inativo').length,
            recusados: contatos.filter(({ status }) => status === 'recusado').length
        })
    });
}

describe('useSupportContacts', () => {
    test('carrega a lista e encaminha o AbortSignal', async () => {
        const service = {
            listar: jest.fn().mockResolvedValue(criarListagem()),
            reenviarConvite: jest.fn()
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(service.listar).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal)
        });

        expect(result.current.contatos).toHaveLength(1);

        expect(result.current.resumo).toEqual({
            total: 1,
            pendentes: 1,
            ativos: 0,
            inativos: 0,
            recusados: 0
        });

        expect(result.current.erro).toBeNull();
    });

    test('mantém os contatos visíveis durante atualização', async () => {
        let concluirAtualizacao;

        const service = {
            listar: jest
                .fn()
                .mockResolvedValueOnce(criarListagem())
                .mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            concluirAtualizacao = resolve;
                        })
                ),
            reenviarConvite: jest.fn()
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        let atualizacao;

        await act(async () => {
            atualizacao = result.current.atualizarLista();

            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.atualizando).toBe(true);
        });

        expect(result.current.contatos).toHaveLength(1);

        await act(async () => {
            concluirAtualizacao(criarListagem([criarContato({ id: 2 })]));

            await atualizacao;
        });

        expect(result.current.contatos[0].id).toBe(2);

        expect(result.current.atualizando).toBe(false);
    });

    test('reaproveita a listagem já em andamento', async () => {
        let concluir;

        const service = {
            listar: jest.fn(
                () =>
                    new Promise((resolve) => {
                        concluir = resolve;
                    })
            ),
            reenviarConvite: jest.fn()
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(service.listar).toHaveBeenCalledTimes(1);
        });

        let segundaRequisicao;

        await act(async () => {
            segundaRequisicao = result.current.atualizarLista();

            await Promise.resolve();
        });

        expect(service.listar).toHaveBeenCalledTimes(1);

        await act(async () => {
            concluir(criarListagem());
            await segundaRequisicao;
        });

        expect(result.current.carregando).toBe(false);
    });

    test('reenvia convite e atualiza o tempo localmente', async () => {
        const service = {
            listar: jest.fn().mockResolvedValue(criarListagem()),
            reenviarConvite: jest.fn().mockResolvedValue({
                mensagem: 'Convite reenviado com sucesso.',
                convite: {
                    id: 1,
                    email: 'ana@example.com',
                    status: 'pendente',
                    dataEnvio: '2026-11-10T12:00:00.000Z',
                    dataExpiracao: '2026-11-17T12:00:00.000Z'
                }
            })
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        await act(async () => {
            await result.current.reenviarConvite(1);
        });

        expect(service.reenviarConvite).toHaveBeenCalledWith(1);

        expect(result.current.contatos[0]).toMatchObject({
            dataConvite: '2026-11-10T12:00:00.000Z',
            aguardando: {
                dias: 0,
                atrasado: false,
                rotulo: 'Aguardando há 0 dias'
            }
        });

        expect(result.current.resultadoAcao).toEqual({
            tipo: 'reenviar',
            mensagem: 'Convite reenviado com sucesso.',
            contatoId: 1
        });

        expect(result.current.resumo).toEqual({
            total: 1,
            pendentes: 1,
            ativos: 0,
            inativos: 0,
            recusados: 0
        });
    });

    test('impede dois reenvios simultâneos', async () => {
        let concluirReenvio;

        const service = {
            listar: jest.fn().mockResolvedValue(criarListagem()),
            reenviarConvite: jest.fn(
                () =>
                    new Promise((resolve) => {
                        concluirReenvio = resolve;
                    })
            )
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        let primeiroReenvio;

        await act(async () => {
            primeiroReenvio = result.current.reenviarConvite(1);

            await Promise.resolve();
        });

        await waitFor(() => {
            expect(result.current.acaoEmAndamento).toBe('reenviar');
        });

        let segundoResultado;

        await act(async () => {
            segundoResultado = await result.current.reenviarConvite(2);
        });

        expect(segundoResultado).toBe(false);

        expect(service.reenviarConvite).toHaveBeenCalledTimes(1);

        await act(async () => {
            concluirReenvio({
                mensagem: 'Convite reenviado com sucesso.',
                convite: {
                    id: 1,
                    email: 'ana@example.com',
                    status: 'pendente',
                    dataEnvio: '2026-11-10T12:00:00.000Z',
                    dataExpiracao: '2026-11-17T12:00:00.000Z'
                }
            });

            await primeiroReenvio;
        });

        expect(result.current.acaoEmAndamento).toBeNull();
    });

    test('mantém os contatos quando o reenvio falha', async () => {
        const service = {
            listar: jest.fn().mockResolvedValue(criarListagem()),
            reenviarConvite: jest.fn().mockRejectedValue(new Error('falha privada'))
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        await act(async () => {
            await result.current.reenviarConvite(1);
        });

        expect(result.current.contatos).toHaveLength(1);

        expect(result.current.erroAcao).toBe(MENSAGEM_ERRO_REENVIO);
    });

    test('apresenta erro controlado sem serviço válido', async () => {
        const { result } = await renderHook(() => useSupportContacts());

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(result.current.contatos).toEqual([]);
        expect(result.current.erro).toBe(MENSAGEM_ERRO_LISTAGEM);
    });

    test('cancela a listagem ao desmontar', async () => {
        let sinalRecebido;

        const service = {
            listar: jest.fn(({ signal }) => {
                sinalRecebido = signal;

                return new Promise(() => {});
            }),
            reenviarConvite: jest.fn()
        };

        const { unmount } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(sinalRecebido).toBeDefined();
        });

        await act(async () => {
            unmount();
            await Promise.resolve();
        });

        expect(sinalRecebido.aborted).toBe(true);
    });

    test('encaminha sessão expirada sem mostrar erro genérico', async () => {
        const falha = Object.assign(new Error('sessão expirada'), {
            status: 401,
            codigo: 'TOKEN_INVALIDO'
        });

        const onSessaoExpirada = jest.fn();

        const service = {
            listar: jest.fn().mockRejectedValue(falha),
            reenviarConvite: jest.fn()
        };

        const { result } = await renderHook(() =>
            useSupportContacts({
                service,
                onSessaoExpirada
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(onSessaoExpirada).toHaveBeenCalledWith({
            mensagem: 'Sua sessão expirou. Entre novamente.'
        });

        expect(result.current.erro).toBeNull();
    });

    test('limpa mensagens da última ação', async () => {
        const service = {
            listar: jest.fn().mockResolvedValue(criarListagem()),
            reenviarConvite: jest.fn().mockRejectedValue(new Error('falha'))
        };

        const { result } = await renderHook(() => useSupportContacts({ service }));

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        await act(async () => {
            await result.current.reenviarConvite(1);
        });

        expect(result.current.erroAcao).toBe(MENSAGEM_ERRO_REENVIO);

        await act(async () => {
            result.current.limparResultadoAcao();
        });

        expect(result.current.erroAcao).toBeNull();
        expect(result.current.resultadoAcao).toBeNull();
    });
});
