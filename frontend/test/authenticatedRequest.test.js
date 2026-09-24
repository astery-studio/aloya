//Testa a inclusão segura da credencial nas requisições autenticadas.
import { criarRequisicaoAutenticada } from '../services/api/authenticatedRequest'

function criarDependencias() {
    return {
        requisicao:
            jest.fn().mockResolvedValue({
                perfil: {
                    nome: 'Julia'
                }
            }),
        obterCredencial:
            jest.fn().mockResolvedValue({
                token: 'token-valido'
            }),
        removerCredencial:
            jest.fn().mockResolvedValue(
                undefined
            )
    }
}

describe('authenticatedRequest', () => {
    test('rejeita dependências ausentes ou inválidas', () => {
        expect(
            () => criarRequisicaoAutenticada({
                requisicao: jest.fn(),
                obterCredencial: jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar as requisições autenticadas.'
        )

        expect(
            () => criarRequisicaoAutenticada({
                requisicao: 'não é uma função',
                obterCredencial: jest.fn(),
                removerCredencial: jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar as requisições autenticadas.'
        )

        expect(
            () => criarRequisicaoAutenticada({
                requisicao: jest.fn(),
                obterCredencial: null,
                removerCredencial: jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar as requisições autenticadas.'
        )

        expect(
            () => criarRequisicaoAutenticada({
                requisicao: jest.fn(),
                obterCredencial: jest.fn(),
                removerCredencial: false
            })
        ).toThrow(
            'Não foi possível configurar as requisições autenticadas.'
        )
    })

    test('adiciona o token da sessão na requisição', async () => {
        const dependencias =
            criarDependencias()

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        const resposta =
            await requisicaoAutenticada({
                caminho: '/users/me',
                metodo: 'GET'
            })

        expect(
            dependencias.requisicao
        ).toHaveBeenCalledTimes(1)

        expect(
            dependencias.requisicao
        ).toHaveBeenCalledWith({
            caminho: '/users/me',
            metodo: 'GET',
            token: 'token-valido'
        })

        expect(resposta).toEqual({
            perfil: {
                nome: 'Julia'
            }
        })
    })

    test('não permite que o chamador substitua o token da sessão', async () => {
        const dependencias =
            criarDependencias()

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        const opcoes = {
            caminho: '/users/me',
            token: 'token-forjado'
        }

        await requisicaoAutenticada(
            opcoes
        )

        expect(
            dependencias.requisicao
        ).toHaveBeenCalledWith({
            caminho: '/users/me',
            token: 'token-valido'
        })

        expect(opcoes).toEqual({
            caminho: '/users/me',
            token: 'token-forjado'
        })
    })

    test('aceita uma chamada sem opções adicionais', async () => {
        const dependencias =
            criarDependencias()

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        await requisicaoAutenticada()

        expect(
            dependencias.requisicao
        ).toHaveBeenCalledWith({
            token: 'token-valido'
        })
    })

    test('rejeita uma sessão que não possui credencial', async () => {
        const dependencias =
            criarDependencias()

        dependencias.obterCredencial
            .mockResolvedValue(null)

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        await expect(
            requisicaoAutenticada({
                caminho: '/users/me'
            })
        ).rejects.toMatchObject({
            message:
                'Sua sessão expirou. Entre novamente.',
            mensagemUsuario:
                'Sua sessão expirou. Entre novamente.',
            status: 401,
            codigo: 'SESSAO_AUSENTE'
        })

        expect(
            dependencias.removerCredencial
        ).toHaveBeenCalledTimes(1)

        expect(
            dependencias.requisicao
        ).not.toHaveBeenCalled()
    })

    test.each([
        undefined,
        null,
        '',
        '   ',
        123
    ])(
        'rejeita um token inválido: %p',
        async (token) => {
            const dependencias =
                criarDependencias()

            dependencias.obterCredencial
                .mockResolvedValue({
                    token
                })

            const requisicaoAutenticada =
                criarRequisicaoAutenticada(
                    dependencias
                )

            await expect(
                requisicaoAutenticada({
                    caminho: '/users/me'
                })
            ).rejects.toMatchObject({
                status: 401,
                codigo: 'SESSAO_AUSENTE'
            })

            expect(
                dependencias.removerCredencial
            ).toHaveBeenCalledTimes(1)

            expect(
                dependencias.requisicao
            ).not.toHaveBeenCalled()
        }
    )

    test('mantém o erro de sessão quando a remoção local falha', async () => {
        const dependencias =
            criarDependencias()

        dependencias.obterCredencial
            .mockResolvedValue(null)

        dependencias.removerCredencial
            .mockRejectedValue(
                new Error(
                    'Erro interno do armazenamento'
                )
            )

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        await expect(
            requisicaoAutenticada()
        ).rejects.toMatchObject({
            message:
                'Sua sessão expirou. Entre novamente.',
            codigo: 'SESSAO_AUSENTE'
        })
    })

    test.each([
        'NAO_AUTENTICADO',
        'TOKEN_INVALIDO',
        'SESSAO_INVALIDA'
    ])(
        'remove a credencial quando o backend retorna %s',
        async (codigo) => {
            const dependencias =
                criarDependencias()

            const erro = new Error(
                'Sessão recusada pelo servidor'
            )

            erro.status = 401
            erro.codigo = codigo

            dependencias.requisicao
                .mockRejectedValue(erro)

            const requisicaoAutenticada =
                criarRequisicaoAutenticada(
                    dependencias
                )

            await expect(
                requisicaoAutenticada({
                    caminho: '/users/me'
                })
            ).rejects.toBe(erro)

            expect(
                dependencias.removerCredencial
            ).toHaveBeenCalledTimes(1)
        }
    )

    test.each([
        [403, 'TOKEN_INVALIDO'],
        [401, 'CODIGO_DESCONHECIDO'],
        [500, 'SESSAO_INVALIDA']
    ])(
        'preserva a credencial no erro %p com código %s',
        async (status, codigo) => {
            const dependencias =
                criarDependencias()

            const erro = new Error(
                'Erro retornado pelo servidor'
            )

            erro.status = status
            erro.codigo = codigo

            dependencias.requisicao
                .mockRejectedValue(erro)

            const requisicaoAutenticada =
                criarRequisicaoAutenticada(
                    dependencias
                )

            await expect(
                requisicaoAutenticada({
                    caminho: '/users/me'
                })
            ).rejects.toBe(erro)

            expect(
                dependencias.removerCredencial
            ).not.toHaveBeenCalled()
        }
    )

    test('não esconde o erro do backend quando a limpeza falha', async () => {
        const dependencias =
            criarDependencias()

        const erro = new Error(
            'Sessão inválida'
        )

        erro.status = 401
        erro.codigo = 'SESSAO_INVALIDA'

        dependencias.requisicao
            .mockRejectedValue(erro)

        dependencias.removerCredencial
            .mockRejectedValue(
                new Error(
                    'Erro ao limpar o armazenamento'
                )
            )

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        await expect(
            requisicaoAutenticada({
                caminho: '/users/me'
            })
        ).rejects.toBe(erro)

        expect(
            dependencias.removerCredencial
        ).toHaveBeenCalledTimes(1)
    })

    test('repassa uma falha ao obter a credencial', async () => {
        const dependencias =
            criarDependencias()

        const erro = new Error(
            'Falha ao consultar armazenamento'
        )

        dependencias.obterCredencial
            .mockRejectedValue(erro)

        const requisicaoAutenticada =
            criarRequisicaoAutenticada(
                dependencias
            )

        await expect(
            requisicaoAutenticada()
        ).rejects.toBe(erro)

        expect(
            dependencias.requisicao
        ).not.toHaveBeenCalled()

        expect(
            dependencias.removerCredencial
        ).not.toHaveBeenCalled()
    })
})