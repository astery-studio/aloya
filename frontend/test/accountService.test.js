//Testa os contratos seguros usados pelo frontend para acessar a própria conta.
import { criarAccountService } from '../features/settings/services/accountService'
import { endpoints } from '../services/api/endpoints'

const respostaPerfil = {
    configuracoes: {
        id: 1,
        nome: 'Julia',
        email: 'julia@email.com',
        identidadeGenero: 'Mulher Cisgênero',
        dataNascimento: '1999-04-08',
        atualizadoEm: '2026-09-23T10:00:00.000Z'
    }
}

function criarDependencias() {
    return {
        requisicaoAutenticada: jest.fn().mockResolvedValue(respostaPerfil),
        removerCredencialLocal: jest.fn().mockResolvedValue(undefined)
    }
}

describe('accountService', () => {
    test('busca somente o perfil da sessão autenticada', async () => {
        const dependencias = criarDependencias()
        const service = criarAccountService(dependencias)

        const perfil = await service.buscarPerfil()

        expect(dependencias.requisicaoAutenticada).toHaveBeenCalledWith({
            caminho: endpoints.configuracoesConta
        })

        expect(perfil.nome).toBe('Julia')
        expect(Object.isFrozen(perfil)).toBe(true)
    })

    test('envia somente alterações permitidas', async () => {
        const dependencias = criarDependencias()
        const service = criarAccountService(dependencias)

        await service.atualizarPerfil({
            nome: 'Julia Silva',
            email: 'julia@email.com'
        })

        expect(dependencias.requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: endpoints.configuracoesConta,
            corpo: {
                nome: 'Julia Silva',
                email: 'julia@email.com'
            }
        })
    })

    test('rejeita campos protegidos antes da requisição', async () => {
        const dependencias = criarDependencias()
        const service = criarAccountService(dependencias)

        await expect(service.atualizarPerfil({
            nome: 'Julia',
            papel: 'administrador'
        })).rejects.toThrow('As alterações do perfil são inválidas.')

        expect(dependencias.requisicaoAutenticada).not.toHaveBeenCalled()
    })

    test('exclui a conta com a confirmação exigida pelo backend', async () => {
        const dependencias = criarDependencias()
        dependencias.requisicaoAutenticada.mockResolvedValue({
            mensagem: 'Sua conta foi excluída com sucesso.'
        })

        const service = criarAccountService(dependencias)

        await service.excluirConta({
            senhaAtual: 'senha-segura'
        })

        expect(dependencias.requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'DELETE',
            caminho: endpoints.exclusaoConta,
            corpo: {
                senhaAtual: 'senha-segura',
                confirmarExclusao: true
            }
        })

        expect(dependencias.removerCredencialLocal).toHaveBeenCalledTimes(1)
    })

    test('não remove a sessão quando a senha é rejeitada', async () => {
        const dependencias = criarDependencias()
        const erro = new Error('Senha incorreta')
        erro.codigo = 'SENHA_ATUAL_INCORRETA'
        dependencias.requisicaoAutenticada.mockRejectedValue(erro)

        const service = criarAccountService(dependencias)

        await expect(service.excluirConta({
            senhaAtual: 'incorreta'
        })).rejects.toMatchObject({
            codigo: 'SENHA_ATUAL_INCORRETA'
        })

        expect(dependencias.removerCredencialLocal).not.toHaveBeenCalled()
    })

    test('impede duas exclusões simultâneas', async () => {
        let concluirExclusao

        const dependencias = criarDependencias()
        dependencias.requisicaoAutenticada.mockImplementation(() => new Promise(resolve => {
            concluirExclusao = resolve
        }))

        const service = criarAccountService(dependencias)
        const primeira = service.excluirConta({senhaAtual: 'senha'})
        const segunda = service.excluirConta({senhaAtual: 'senha'})

        expect(primeira).toBe(segunda)
        expect(dependencias.requisicaoAutenticada).toHaveBeenCalledTimes(1)

        concluirExclusao({mensagem: 'Conta excluída.'})
        await primeira
    })
})