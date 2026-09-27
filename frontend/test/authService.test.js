//Testa o comportamento seguro do serviço de logout.
import { criarAuthService } from '../features/auth/services/authService'
import { endpoints } from '../services/api/endpoints'

function criarDependencias({
    resposta = { status: 204 },
    erroDaRequisicao = null,
    erroDaRemocao = null
} = {}) {
    const requisicaoAutenticada =
        erroDaRequisicao
            ? jest.fn().mockRejectedValue(
                erroDaRequisicao
            )
            : jest.fn().mockResolvedValue(
                resposta
            )

    const removerCredencialLocal =
        erroDaRemocao
            ? jest.fn().mockRejectedValue(
                erroDaRemocao
            )
            : jest.fn().mockResolvedValue(
                undefined
            )

    return {
        requisicaoAutenticada,
        removerCredencialLocal
    }
}

describe('authService', () => {
    test('envia o logout para o endpoint correto', async () => {
        const dependencias =
            criarDependencias()

        const authService =
            criarAuthService(dependencias)

        await authService.encerrarSessao()

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.logout
        })
    })

    test('remove a credencial quando o servidor confirma o logout', async () => {
        const dependencias =
            criarDependencias()

        const authService =
            criarAuthService(dependencias)

        const resultado =
            await authService.encerrarSessao()

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(1)

        expect(resultado).toEqual({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: true
        })

        expect(
            Object.isFrozen(resultado)
        ).toBe(true)
    })

    test('remove a credencial quando o servidor retorna outro status', async () => {
        const dependencias =
            criarDependencias({
                resposta: {
                    status: 500
                }
            })

        const authService =
            criarAuthService(dependencias)

        const resultado =
            await authService.encerrarSessao()

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(1)

        expect(resultado).toEqual({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: false
        })
    })

    test('remove a credencial quando a requisição falha', async () => {
        const dependencias =
            criarDependencias({
                erroDaRequisicao:
                    new Error(
                        'Detalhe técnico da rede'
                    )
            })

        const authService =
            criarAuthService(dependencias)

        const resultado =
            await authService.encerrarSessao()

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(1)

        expect(resultado).toEqual({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: false
        })
    })

    test('não expõe o erro interno quando a remoção local falha', async () => {
        const dependencias =
            criarDependencias({
                erroDaRemocao:
                    new Error(
                        'Erro interno do armazenamento'
                    )
            })

        const authService =
            criarAuthService(dependencias)

        let erroRecebido = null

        try {
            await authService.encerrarSessao()
        } catch (erro) {
            erroRecebido = erro
        }

        expect(erroRecebido).toBeInstanceOf(
            Error
        )

        expect(erroRecebido.message).toBe(
            'Não foi possível remover a credencial deste aparelho. Tente novamente.'
        )

        expect(erroRecebido.message).not.toContain(
            'armazenamento'
        )
    })

    test('rejeita dependências ausentes ou inválidas', () => {
        expect(
            () => criarAuthService({
                requisicaoAutenticada:
                    jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar o serviço de autenticação.'
        )

        expect(
            () => criarAuthService({
                requisicaoAutenticada:
                    'não é uma função',
                removerCredencialLocal:
                    jest.fn()
            })
        ).toThrow(
            'Não foi possível configurar o serviço de autenticação.'
        )
    })

    test('reutiliza a mesma operação durante dois logouts simultâneos', async () => {
        let confirmarResposta

        const requisicaoAutenticada =
            jest.fn(
                () => new Promise(
                    (resolver) => {
                        confirmarResposta =
                            resolver
                    }
                )
            )

        const removerCredencialLocal =
            jest.fn().mockResolvedValue(
                undefined
            )

        const authService =
            criarAuthService({
                requisicaoAutenticada,
                removerCredencialLocal
            })

        const primeiroLogout =
            authService.encerrarSessao()

        const segundoLogout =
            authService.encerrarSessao()

        expect(primeiroLogout).toBe(
            segundoLogout
        )

        expect(
            requisicaoAutenticada
        ).toHaveBeenCalledTimes(1)

        expect(
            removerCredencialLocal
        ).toHaveBeenCalledTimes(1)

        confirmarResposta({
            status: 204
        })

        await expect(
            primeiroLogout
        ).resolves.toEqual({
            sessaoLocalEncerrada: true,
            sessaoRemotaEncerrada: true
        })
    })

    test('permite um novo logout depois que o anterior terminou', async () => {
        const dependencias =
            criarDependencias()

        const authService =
            criarAuthService(dependencias)

        await authService.encerrarSessao()
        await authService.encerrarSessao()

        expect(
            dependencias.requisicaoAutenticada
        ).toHaveBeenCalledTimes(2)

        expect(
            dependencias.removerCredencialLocal
        ).toHaveBeenCalledTimes(2)
    })
})