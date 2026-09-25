//Testa a validação, o estado e a proteção do modelo de permissão.
import {gruposPermissoes, permissoesGerais} from '../../features/support-network/constants/permissionOptions'
import {criarPermission} from '../../features/support-network/models/Permission'

const todasAsPermissoes = [
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(grupo => grupo.permissoes)
]

describe('criarPermission', () => {
    test('cria uma permissão desligada', () => {
        const permissao = criarPermission({
            id: 'geral.fase_atual',
            titulo: 'Acesso à Fase Atual',
            ativo: false
        })

        expect(permissao).toEqual({
            id: 'geral.fase_atual',
            titulo: 'Acesso à Fase Atual',
            ativo: false
        })
    })

    test('cria uma permissão ligada', () => {
        const permissao = criarPermission({
            id: 'ciclo.fluxo_menstrual',
            titulo: 'Fluxo menstrual',
            ativo: true
        })

        expect(permissao.ativo).toBe(true)
    })

    test.each(todasAsPermissoes)('aceita a permissão oficial $id', permissaoOriginal => {
        const permissao = criarPermission({
            ...permissaoOriginal,
            ativo: false
        })

        expect(permissao).toEqual({
            id: permissaoOriginal.id,
            titulo: permissaoOriginal.titulo,
            ativo: false
        })
    })

    test('retorna um objeto que não pode ser alterado', () => {
        const permissao = criarPermission({
            id: 'geral.dicas',
            titulo: 'Receber dicas',
            ativo: true
        })

        expect(Object.isFrozen(permissao)).toBe(true)
    })

    test('remove campos que não pertencem à permissão', () => {
        const permissao = criarPermission({
            id: 'geral.dicas',
            titulo: 'Receber dicas',
            ativo: true,
            titularId: 999,
            administrador: true,
            token: 'token privado'
        })

        expect(permissao).toEqual({
            id: 'geral.dicas',
            titulo: 'Receber dicas',
            ativo: true
        })

        expect(permissao).not.toHaveProperty('titularId')
        expect(permissao).not.toHaveProperty('administrador')
        expect(permissao).not.toHaveProperty('token')
    })

    test.each([
        null,
        undefined,
        [],
        {},
        'geral.dicas',
        10
    ])('rejeita permissão em formato inválido %p', permissao => {
        expect(
            () => criarPermission(permissao)
        ).toThrow('Não foi possível carregar a permissão.')
    })

    test('rejeita identificador desconhecido', () => {
        expect(
            () => criarPermission({
                id: 'administrador.acesso_total',
                titulo: 'Acesso total',
                ativo: true
            })
        ).toThrow('Não foi possível carregar a permissão.')
    })

    test.each([
        undefined,
        null,
        0,
        1,
        'true',
        'false',
        {},
        []
    ])('rejeita estado não booleano %p', ativo => {
        expect(
            () => criarPermission({
                id: 'geral.dicas',
                titulo: 'Receber dicas',
                ativo
            })
        ).toThrow('Não foi possível carregar a permissão.')
    })

    test('rejeita título alterado', () => {
        expect(
            () => criarPermission({
                id: 'geral.dicas',
                titulo: 'Título adulterado',
                ativo: true
            })
        ).toThrow('Não foi possível carregar a permissão.')
    })

    test('rejeita código HTML no título', () => {
        expect(
            () => criarPermission({
                id: 'geral.dicas',
                titulo: '<script>alerta</script>',
                ativo: true
            })
        ).toThrow('Não foi possível carregar a permissão.')
    })

    test('rejeita objeto com protótipo alterado', () => {
        const permissao = Object.create({
            administrador: true
        })

        Object.assign(permissao, {
            id: 'geral.dicas',
            titulo: 'Receber dicas',
            ativo: true
        })

        expect(
            () => criarPermission(permissao)
        ).toThrow('Não foi possível carregar a permissão.')
    })
})