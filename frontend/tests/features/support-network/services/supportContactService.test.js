import {
    MENSAGEM_ERRO_LISTAGEM,
    MENSAGEM_ERRO_REENVIO,
    criarSupportContactService,
    normalizarContato
} from '../../../../src/features/support-network/services/supportContactService';

function criarContato({
    id = 1,
    nome = 'Ana',
    status = 'pendente',
    vinculo = {
        tipo: 'individual',
        rotulo: 'Permissão individual',
        categoria: null,
        permissoes: ['geral.fase_atual']
    }
} = {}) {
    const configuracoes = {
        pendente: {
            statusRotulo: 'Pendente',
            aguardando: {
                dias: 3,
                atrasado: false,
                rotulo: 'Aguardando há 3 dias'
            },
            acoes: {
                podeAlterarVinculo: false,
                podeRemover: true,
                podeReenviarConvite: true
            }
        },
        ativo: {
            statusRotulo: 'Ativo',
            aguardando: null,
            acoes: {
                podeAlterarVinculo: true,
                podeRemover: true,
                podeReenviarConvite: false
            }
        },
        inativo: {
            statusRotulo: 'Inativo',
            aguardando: {
                dias: 2,
                atrasado: false,
                rotulo: 'Desativado há 2 dias'
            },
            acoes: {
                podeAlterarVinculo: false,
                podeRemover: true,
                podeReenviarConvite: true
            }
        },
        recusado: {
            statusRotulo: 'Recusado',
            aguardando: {
                dias: 1,
                atrasado: false,
                rotulo: 'Recusado há 1 dia'
            },
            acoes: {
                podeAlterarVinculo: false,
                podeRemover: true,
                podeReenviarConvite: true
            }
        }
    };

    return {
        id,
        nome,
        email: `contato${id}@example.com`,
        identificacao: nome ?? `contato${id}@example.com`,
        iconeId: 'coracao',
        corId: 'coral',
        status,
        statusRotulo: configuracoes[status].statusRotulo,
        vinculo,
        dataConvite: '2026-11-01T12:00:00.000Z',
        dataAtivacao: status === 'ativo' ? '2026-11-02T12:00:00.000Z' : null,
        dataDesativacao: status === 'inativo' ? '2026-11-08T12:00:00.000Z' : null,
        dataRecusa: status === 'recusado' ? '2026-11-09T12:00:00.000Z' : null,
        aguardando: configuracoes[status].aguardando,
        acoes: configuracoes[status].acoes
    };
}

function criarRespostaCompleta() {
    return {
        contatos: [
            criarContato({
                id: 1,
                status: 'pendente'
            }),
            criarContato({
                id: 2,
                nome: 'Beatriz',
                status: 'ativo',
                vinculo: {
                    tipo: 'categoria',
                    rotulo: 'Categoria: Família',
                    categoria: {
                        id: 8,
                        nome: 'Família'
                    },
                    permissoes: ['geral.fase_atual', 'geral.proxima_menstruacao']
                }
            }),
            criarContato({
                id: 3,
                nome: 'Carla',
                status: 'inativo'
            }),
            criarContato({
                id: 4,
                nome: 'Daniela',
                status: 'recusado'
            })
        ],
        resumo: {
            total: 4,
            pendentes: 1,
            ativos: 1,
            inativos: 1,
            recusados: 1
        }
    };
}

describe('supportContactService', () => {
    test('rejeita configuração sem requisição autenticada', () => {
        expect(() => criarSupportContactService()).toThrow(
            'Não foi possível configurar o serviço de contatos.'
        );
    });

    test('lista os contatos usando a rota autenticada', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue(criarRespostaCompleta());

        const service = criarSupportContactService({
            requisicaoAutenticada
        });

        const controlador = new AbortController();

        const resultado = await service.listar({
            signal: controlador.signal
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/support-network/contacts',
            signal: controlador.signal
        });

        expect(resultado.resumo).toEqual({
            total: 4,
            pendentes: 1,
            ativos: 1,
            inativos: 1,
            recusados: 1
        });

        expect(resultado.contatos.map(({ status }) => status)).toEqual([
            'pendente',
            'ativo',
            'inativo',
            'recusado'
        ]);
    });

    test('não envia signal quando ele não foi informado', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            contatos: [],
            resumo: {
                total: 0,
                pendentes: 0,
                ativos: 0,
                inativos: 0,
                recusados: 0
            }
        });

        const service = criarSupportContactService({
            requisicaoAutenticada
        });

        await service.listar();

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/support-network/contacts'
        });
    });

    test('preserva a aparência e o vínculo do contato', async () => {
        const resposta = criarRespostaCompleta();

        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(resposta)
        });

        const resultado = await service.listar();
        const contato = resultado.contatos[1];

        expect(contato).toMatchObject({
            iconeId: 'coracao',
            corId: 'coral',
            vinculo: {
                tipo: 'categoria',
                rotulo: 'Categoria: Família',
                categoria: {
                    id: 8,
                    nome: 'Família'
                }
            }
        });

        expect(Object.isFrozen(contato)).toBe(true);
        expect(Object.isFrozen(contato.vinculo)).toBe(true);
        expect(Object.isFrozen(contato.vinculo.permissoes)).toBe(true);
    });

    test('aceita o e-mail como identificação quando não existe nome', () => {
        const contato = criarContato({
            nome: null,
            status: 'pendente'
        });

        const resultado = normalizarContato(contato);

        expect(resultado.nome).toBeNull();
        expect(resultado.identificacao).toBe('contato1@example.com');
    });

    test('rejeita um estado desconhecido', async () => {
        const contato = criarContato();

        contato.status = 'desconhecido';

        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                contatos: [contato],
                resumo: {
                    total: 1,
                    pendentes: 0,
                    ativos: 0,
                    inativos: 0,
                    recusados: 0
                }
            })
        });

        await expect(service.listar()).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONTATOS_INVALIDA',
            mensagemUsuario: MENSAGEM_ERRO_LISTAGEM
        });
    });

    test('rejeita contato sem aparência persistida', async () => {
        const contato = criarContato();

        delete contato.iconeId;

        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                contatos: [contato],
                resumo: {
                    total: 1,
                    pendentes: 1,
                    ativos: 0,
                    inativos: 0,
                    recusados: 0
                }
            })
        });

        await expect(service.listar()).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONTATOS_INVALIDA',
            mensagemUsuario: MENSAGEM_ERRO_LISTAGEM
        });
    });

    test('rejeita vínculo de categoria sem categoria', async () => {
        const contato = criarContato({
            vinculo: {
                tipo: 'categoria',
                rotulo: 'Categoria: Família',
                categoria: null,
                permissoes: []
            }
        });

        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                contatos: [contato],
                resumo: {
                    total: 1,
                    pendentes: 1,
                    ativos: 0,
                    inativos: 0,
                    recusados: 0
                }
            })
        });

        await expect(service.listar()).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONTATOS_INVALIDA'
        });
    });

    test('rejeita resumo diferente dos contatos recebidos', async () => {
        const resposta = criarRespostaCompleta();

        resposta.resumo.total = 50;

        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(resposta)
        });

        await expect(service.listar()).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONTATOS_INVALIDA',
            mensagemUsuario: MENSAGEM_ERRO_LISTAGEM
        });
    });

    test('reenvia o convite de um contato', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            mensagem: 'Convite reenviado com sucesso.',
            convite: {
                id: 19,
                email: 'ana@example.com',
                status: 'pendente',
                dataEnvio: '2026-11-10T12:00:00.000Z',
                dataExpiracao: '2026-11-17T12:00:00.000Z'
            }
        });

        const service = criarSupportContactService({
            requisicaoAutenticada
        });

        await expect(service.reenviarConvite(19)).resolves.toEqual({
            mensagem: 'Convite reenviado com sucesso.',
            convite: {
                id: 19,
                email: 'ana@example.com',
                status: 'pendente',
                dataEnvio: '2026-11-10T12:00:00.000Z',
                dataExpiracao: '2026-11-17T12:00:00.000Z'
            }
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: '/support-network/contacts/19/resend-invitation'
        });
    });

    test('impede duas requisições simultâneas para o mesmo contato', async () => {
        let concluir;

        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolve) => {
                    concluir = resolve;
                })
        );

        const service = criarSupportContactService({
            requisicaoAutenticada
        });

        const primeira = service.reenviarConvite(19);
        const segunda = service.reenviarConvite(19);

        await Promise.resolve();

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        concluir({
            mensagem: 'Convite reenviado com sucesso.',
            convite: {
                id: 19,
                email: 'ana@example.com',
                status: 'pendente',
                dataEnvio: '2026-11-10T12:00:00.000Z',
                dataExpiracao: '2026-11-17T12:00:00.000Z'
            }
        });

        await expect(Promise.all([primeira, segunda])).resolves.toHaveLength(2);
    });

    test('rejeita identificador inválido antes da chamada HTTP', async () => {
        const requisicaoAutenticada = jest.fn();

        const service = criarSupportContactService({
            requisicaoAutenticada
        });

        await expect(service.reenviarConvite(0)).rejects.toMatchObject({
            codigo: 'CONTATO_ID_INVALIDO'
        });

        expect(requisicaoAutenticada).not.toHaveBeenCalled();
    });

    test('rejeita resposta inválida do reenvio', async () => {
        const service = criarSupportContactService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                mensagem: 'Resposta inesperada.'
            })
        });

        await expect(service.reenviarConvite(19)).rejects.toMatchObject({
            codigo: 'RESPOSTA_REENVIO_INVALIDA',
            mensagemUsuario: MENSAGEM_ERRO_REENVIO
        });
    });

    test('remove contato confirmado pelo endpoint protegido', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            mensagem: 'Contato removido com sucesso.',
            remocao: {
                id: 19,
                status: 'removido',
                statusAnterior: 'ativo'
            }
        });
        const service = criarSupportContactService({ requisicaoAutenticada });

        await expect(service.removerContato(19)).resolves.toMatchObject({
            mensagem: 'Contato removido com sucesso.'
        });
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'DELETE',
            caminho: '/support-network/contacts/19',
            corpo: { confirmado: true }
        });
    });

    test('cancela convite pendente com a mensagem específica', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            mensagem: 'Convite cancelado com sucesso.',
            remocao: {
                id: 19,
                status: 'removido',
                statusAnterior: 'pendente'
            }
        });
        const service = criarSupportContactService({ requisicaoAutenticada });

        await expect(service.removerContato(19, { convitePendente: true })).resolves.toMatchObject({
            mensagem: 'Convite cancelado com sucesso.'
        });
    });

    test('desativa contato pelo endpoint específico', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            mensagem: 'Contato desativado com sucesso.',
            remocao: {
                id: 19,
                status: 'revogado',
                statusAnterior: 'ativo'
            }
        });
        const service = criarSupportContactService({ requisicaoAutenticada });

        await expect(service.desativarContato(19)).resolves.toMatchObject({
            mensagem: 'Contato desativado com sucesso.'
        });
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: '/support-network/contacts/19/deactivate',
            corpo: { confirmado: true }
        });
    });
});
