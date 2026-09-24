//Testa os contratos seguros usados pelo frontend para acessar a própria conta.
import { criarAccountService } from '../features/settings/services/accountService'
import { endpoints } from '../services/api/endpoints'

const respostaPerfil = {
    configuracoes: {
        id: 1,
        nome: 'Julia',
        email: 'julia@email.com',
        identidadeGenero:
            'Mulher Cisgênero',
        dataNascimento: '1999-04-08',
        atualizadoEm:
            '2026-09-23T10:00:00.000Z'
    }
}

function criarDependencias() {
    return {
        requisicaoAutenticada:
            jest.fn().mockResolvedValue(
                respostaPerfil
            ),
        removerCredencialLocal:
            jest.fn().mockResolvedValue(
                undefined
            )
    }
}

describe('accountService', () => {
    test('rejeita dependências ausentes ou inválidas', () => {
        expect(
            () => criarAccountService({
                requisicaoAutenticada:
                    jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar o serviço de conta.'
        )

        expect(
            () => criarAccountService({
                requisicaoAutenticada:
                    'não é uma função',
                removerCredencialLocal:
                    jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar o serviço de conta.'
        )

        expect(
            () => criarAccountService({
                requisicaoAutenticada:
                    jest.fn(),
                removerCredencialLocal:
                    null
            })
        ).toThrow(
            'Não foi possível configurar o serviço de conta.'
        )
    })

    test('busca somente o perfil da sessão autenticada', async () => {
        const dependencias =
            criarDependencias()

        const service =
            criarAccountService(
                dependencias
            )

        const perfil =
            await service.buscarPerfil()

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledWith({
            caminho:
                endpoints.configuracoesConta
        })

        expect(perfil.nome).toBe(
            'Julia'
        )

        expect(
            Object.isFrozen(perfil)
        ).toBe(true)
    })

    test('confirma a senha sem solicitar exclusão', async () => {
        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockResolvedValue(null)

        const service =
            criarAccountService(
                dependencias
            )

        await expect(
            service.confirmarSenhaExclusao({
                senhaAtual: 'senha-segura'
            })
        ).resolves.toBe(true)

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho:
                endpoints.verificacaoSenhaExclusao,
            corpo: {
                senhaAtual: 'senha-segura'
            }
        })

        expect(
            dependencias.removerCredencialLocal
        ).not.toHaveBeenCalled()
    })

    test.each([
        undefined,
        null,
        '',
        123
    ])(
        'rejeita senha ausente na confirmação: %p',
        (senhaAtual) => {
            const dependencias =
                criarDependencias()

            const service =
                criarAccountService(
                    dependencias
                )

            let erroRecebido = null

            try {
                if (
                    senhaAtual === undefined
                ) {
                    service
                        .confirmarSenhaExclusao()
                } else {
                    service
                        .confirmarSenhaExclusao({
                            senhaAtual
                        })
                }
            } catch (erro) {
                erroRecebido = erro
            }

            expect(
                erroRecebido
            ).toMatchObject({
                message:
                    'Informe sua senha atual.',
                codigo:
                    'SENHA_ATUAL_AUSENTE'
            })

            expect(
                dependencias
                    .requisicaoAutenticada
            ).not.toHaveBeenCalled()
        }
    )

    test('reutiliza a verificação de senha em andamento', async () => {
        let concluirVerificacao

        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockImplementationOnce(
                () => new Promise(
                    (resolver) => {
                        concluirVerificacao =
                            resolver
                    }
                )
            )
            .mockResolvedValue(null)

        const service =
            criarAccountService(
                dependencias
            )

        const primeiraVerificacao =
            service.confirmarSenhaExclusao({
                senhaAtual: 'senha-segura'
            })

        const segundaVerificacao =
            service.confirmarSenhaExclusao({
                senhaAtual: 'senha-segura'
            })

        expect(
            primeiraVerificacao
        ).toBe(segundaVerificacao)

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        concluirVerificacao(null)

        await primeiraVerificacao

        await expect(
            service.confirmarSenhaExclusao({
                senhaAtual: 'senha-segura'
            })
        ).resolves.toBe(true)

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(2)
    })

    test('repassa o erro de senha incorreta sem excluir a conta', async () => {
        const dependencias =
            criarDependencias()

        const erro =
            new Error('Senha incorreta')

        erro.codigo =
            'SENHA_ATUAL_INCORRETA'

        dependencias.requisicaoAutenticada
            .mockRejectedValue(erro)

        const service =
            criarAccountService(
                dependencias
            )

        await expect(
            service.confirmarSenhaExclusao({
                senhaAtual: 'incorreta'
            })
        ).rejects.toMatchObject({
            codigo:
                'SENHA_ATUAL_INCORRETA'
        })

        expect(
            dependencias.removerCredencialLocal
        ).not.toHaveBeenCalled()
    })

    test('envia somente alterações permitidas', async () => {
        const dependencias =
            criarDependencias()

        const service =
            criarAccountService(
                dependencias
            )

        const perfil =
            await service.atualizarPerfil({
                nome: 'Julia Silva',
                email: 'julia@email.com',
                dataNascimento:
                    '1999-04-08',
                identidadeGenero:
                    'Mulher Cisgênero'
            })

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho:
                endpoints.configuracoesConta,
            corpo: {
                nome: 'Julia Silva',
                email:
                    'julia@email.com',
                dataNascimento:
                    '1999-04-08',
                identidadeGenero:
                    'Mulher Cisgênero'
            }
        })

        expect(
            Object.isFrozen(perfil)
        ).toBe(true)
    })

    test('rejeita campos protegidos antes da requisição', async () => {
        const dependencias =
            criarDependencias()

        const service =
            criarAccountService(
                dependencias
            )

        await expect(
            service.atualizarPerfil({
                nome: 'Julia',
                papel: 'administrador'
            })
        ).rejects.toThrow(
            'As alterações do perfil são inválidas.'
        )

        expect(
            dependencias.requisicaoAutenticada
        ).not.toHaveBeenCalled()
    })

    test.each([
        null,
        undefined,
        'nome',
        [],
        {}
    ])(
        'rejeita alterações inválidas: %p',
        async (alteracoes) => {
            const dependencias =
                criarDependencias()

            const service =
                criarAccountService(
                    dependencias
                )

            await expect(
                service.atualizarPerfil(
                    alteracoes
                )
            ).rejects.toThrow(
                'As alterações do perfil são inválidas.'
            )

            expect(
                dependencias
                    .requisicaoAutenticada
            ).not.toHaveBeenCalled()
        }
    )

    test('exclui a conta com a confirmação exigida pelo backend', async () => {
        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockResolvedValue({
                mensagem:
                    'Sua conta foi excluída com sucesso.'
            })

        const service =
            criarAccountService(
                dependencias
            )

        const resultado =
            await service.excluirConta({
                senhaAtual: 'senha-segura'
            })

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledWith({
            metodo: 'DELETE',
            caminho:
                endpoints.exclusaoConta,
            corpo: {
                senhaAtual:
                    'senha-segura',
                confirmarExclusao: true
            }
        })

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(1)

        expect(resultado).toEqual({
            mensagem:
                'Sua conta foi excluída com sucesso.'
        })
    })

    test('não remove a sessão quando a senha é rejeitada', async () => {
        const dependencias =
            criarDependencias()

        const erro =
            new Error('Senha incorreta')

        erro.codigo =
            'SENHA_ATUAL_INCORRETA'

        dependencias.requisicaoAutenticada
            .mockRejectedValue(erro)

        const service =
            criarAccountService(
                dependencias
            )

        await expect(
            service.excluirConta({
                senhaAtual: 'incorreta'
            })
        ).rejects.toMatchObject({
            codigo:
                'SENHA_ATUAL_INCORRETA'
        })

        expect(
            dependencias.removerCredencialLocal
        ).not.toHaveBeenCalled()
    })

    test.each([
        undefined,
        null,
        '',
        123
    ])(
        'rejeita senha ausente na exclusão: %p',
        (senhaAtual) => {
            const dependencias =
                criarDependencias()

            const service =
                criarAccountService(
                    dependencias
                )

            let erroRecebido = null

            try {
                if (
                    senhaAtual === undefined
                ) {
                    service.excluirConta()
                } else {
                    service.excluirConta({
                        senhaAtual
                    })
                }
            } catch (erro) {
                erroRecebido = erro
            }

            expect(
                erroRecebido
            ).toMatchObject({
                message:
                    'Informe sua senha atual.',
                codigo:
                    'SENHA_ATUAL_AUSENTE'
            })

            expect(
                dependencias
                    .requisicaoAutenticada
            ).not.toHaveBeenCalled()
        }
    )

    test('repete somente a limpeza local quando a conta já foi excluída', async () => {
        const respostaExclusao = {
            mensagem:
                'Sua conta foi excluída com sucesso.'
        }

        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockResolvedValue(
                respostaExclusao
            )

        dependencias.removerCredencialLocal
            .mockRejectedValueOnce(
                new Error(
                    'Falha do armazenamento'
                )
            )
            .mockResolvedValueOnce(
                undefined
            )

        const service =
            criarAccountService(
                dependencias
            )

        await expect(
            service.excluirConta({
                senhaAtual: 'senha-segura'
            })
        ).rejects.toMatchObject({
            message:
                'A conta foi excluída, mas não foi possível limpar a sessão deste aparelho. Tente novamente.',
            mensagemUsuario:
                'A conta foi excluída, mas não foi possível limpar a sessão deste aparelho. Tente novamente.',
            codigo:
                'LIMPEZA_LOCAL_PENDENTE'
        })

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        await expect(
            service.excluirConta({
                senhaAtual: 'senha-segura'
            })
        ).resolves.toEqual(
            respostaExclusao
        )

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(2)
    })

    test('impede duas exclusões simultâneas', async () => {
        let concluirExclusao

        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockImplementation(
                () => new Promise(
                    (resolver) => {
                        concluirExclusao =
                            resolver
                    }
                )
            )

        const service =
            criarAccountService(
                dependencias
            )

        const primeira =
            service.excluirConta({
                senhaAtual: 'senha'
            })

        const segunda =
            service.excluirConta({
                senhaAtual: 'senha'
            })

        expect(primeira).toBe(
            segunda
        )

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        concluirExclusao({
            mensagem: 'Conta excluída.'
        })

        await primeira
    })

    test('permite nova exclusão depois que a anterior terminou', async () => {
        const dependencias =
            criarDependencias()

        dependencias.requisicaoAutenticada
            .mockResolvedValue({
                mensagem: 'Conta excluída.'
            })

        const service =
            criarAccountService(
                dependencias
            )

        await service.excluirConta({
            senhaAtual: 'senha'
        })

        await service.excluirConta({
            senhaAtual: 'senha'
        })

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(2)

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(2)
    })
})