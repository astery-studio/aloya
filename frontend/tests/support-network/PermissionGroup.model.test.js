//Testa a validação e a proteção do modelo de grupo de permissões.
import {gruposPermissoes} from '../../features/support-network/constants/permissionOptions'
import {criarPermissionGroup} from '../../features/support-network/models/PermissionGroup'

function criarGrupo(alteracoes = {}) {
    return {
        id: 'ciclo',
        titulo: 'Ciclo e Sangramento',
        icone: 'gota',
        paleta: 'ciclo',
        permissoes: [
            {
                id: 'ciclo.fluxo_menstrual',
                titulo: 'Fluxo menstrual'
            },
            {
                id: 'ciclo.sangramento_escape',
                titulo: 'Sangramento de escape'
            },
            {
                id: 'ciclo.secrecao_corrimento',
                titulo: 'Secreção/corrimento'
            }
        ],
        ...alteracoes
    }
}

describe('criarPermissionGroup', () => {
    test('cria um grupo usando somente os campos permitidos', () => {
        const grupo = criarPermissionGroup(
            criarGrupo({
                titularId: 999,
                administrador: true,
                token: 'token privado'
            })
        )

        expect(grupo).toEqual({
            id: 'ciclo',
            titulo: 'Ciclo e Sangramento',
            icone: 'gota',
            paleta: 'ciclo',
            permissoes: [
                {
                    id: 'ciclo.fluxo_menstrual',
                    titulo: 'Fluxo menstrual'
                },
                {
                    id: 'ciclo.sangramento_escape',
                    titulo: 'Sangramento de escape'
                },
                {
                    id: 'ciclo.secrecao_corrimento',
                    titulo: 'Secreção/corrimento'
                }
            ]
        })

        expect(grupo).not.toHaveProperty('titularId')
        expect(grupo).not.toHaveProperty('administrador')
        expect(grupo).not.toHaveProperty('token')
    })

    test('congela o grupo, a lista e cada permissão', () => {
        const grupo = criarPermissionGroup(criarGrupo())

        expect(Object.isFrozen(grupo)).toBe(true)
        expect(Object.isFrozen(grupo.permissoes)).toBe(true)

        grupo.permissoes.forEach(permissao => {
            expect(Object.isFrozen(permissao)).toBe(true)
        })
    })

    test('coloca as permissões na ordem oficial', () => {
        const grupo = criarPermissionGroup(
            criarGrupo({
                permissoes: [
                    {
                        id: 'ciclo.secrecao_corrimento',
                        titulo: 'Secreção/corrimento'
                    },
                    {
                        id: 'ciclo.fluxo_menstrual',
                        titulo: 'Fluxo menstrual'
                    },
                    {
                        id: 'ciclo.sangramento_escape',
                        titulo: 'Sangramento de escape'
                    }
                ]
            })
        )

        expect(grupo.permissoes.map(permissao => permissao.id)).toEqual([
            'ciclo.fluxo_menstrual',
            'ciclo.sangramento_escape',
            'ciclo.secrecao_corrimento'
        ])
    })

    test.each(gruposPermissoes)('aceita o grupo oficial $id', grupoOriginal => {
        const grupo = criarPermissionGroup(grupoOriginal)

        expect(grupo).toEqual({
            id: grupoOriginal.id,
            titulo: grupoOriginal.titulo,
            icone: grupoOriginal.icone,
            paleta: grupoOriginal.paleta,
            permissoes: grupoOriginal.permissoes
        })
    })

    test.each([
        {
            id: 'grupo-desconhecido'
        },
        {
            titulo: 'Título adulterado'
        },
        {
            icone: 'icone-desconhecido'
        },
        {
            paleta: 'paleta-desconhecida'
        }
    ])('rejeita configuração desconhecida', alteracoes => {
        expect(
            () => criarPermissionGroup(
                criarGrupo(alteracoes)
            )
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test.each([
        null,
        undefined,
        [],
        {},
        'ciclo',
        10
    ])('rejeita grupo em formato inválido %p', grupo => {
        expect(
            () => criarPermissionGroup(grupo)
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test.each([
        null,
        [],
        {},
        'permissões'
    ])('rejeita lista de permissões inválida %p', permissoes => {
        expect(
            () => criarPermissionGroup(
                criarGrupo({
                    permissoes
                })
            )
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test('rejeita permissão que pertence a outro grupo', () => {
        const permissoes = criarGrupo().permissoes

        permissoes[0] = {
            id: 'energia.energia',
            titulo: 'Energia'
        }

        expect(
            () => criarPermissionGroup(
                criarGrupo({
                    permissoes
                })
            )
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test('rejeita identificadores repetidos', () => {
        const permissoes = criarGrupo().permissoes

        permissoes[1] = {
            id: 'ciclo.fluxo_menstrual',
            titulo: 'Fluxo menstrual'
        }

        expect(
            () => criarPermissionGroup(
                criarGrupo({
                    permissoes
                })
            )
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test('rejeita título adulterado de uma permissão', () => {
        const permissoes = criarGrupo().permissoes

        permissoes[0] = {
            id: 'ciclo.fluxo_menstrual',
            titulo: '<script>alerta</script>'
        }

        expect(
            () => criarPermissionGroup(
                criarGrupo({
                    permissoes
                })
            )
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })

    test('ignora campos extras dentro das permissões', () => {
        const permissoes = criarGrupo().permissoes

        permissoes[0] = {
            ...permissoes[0],
            token: 'token privado',
            administrador: true
        }

        const grupo = criarPermissionGroup(
            criarGrupo({
                permissoes
            })
        )

        expect(grupo.permissoes[0]).toEqual({
            id: 'ciclo.fluxo_menstrual',
            titulo: 'Fluxo menstrual'
        })

        expect(grupo.permissoes[0]).not.toHaveProperty('token')
        expect(grupo.permissoes[0]).not.toHaveProperty('administrador')
    })

    test('rejeita objeto com protótipo alterado', () => {
        const grupo = Object.create({
            administrador: true
        })

        Object.assign(grupo, criarGrupo())

        expect(
            () => criarPermissionGroup(grupo)
        ).toThrow('Não foi possível carregar o grupo de permissões.')
    })
})