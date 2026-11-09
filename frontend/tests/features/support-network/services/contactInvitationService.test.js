import {
    criarContactInvitationService,
    normalizarEmail,
    prepararConvite
} from '../../../../src/features/support-network/services/contactInvitationService';
import { endpoints } from '../../../../src/shared/services/api/endpoints';

const DATA_ENVIO = '2026-11-09T12:00:00.000Z';
const DATA_EXPIRACAO = '2026-11-16T12:00:00.000Z';

function criarConviteCategoria(alteracoes = {}) {
    return {
        mensagem: 'Convite enviado com sucesso.',
        convite: {
            id: 20,
            email: 'contato@example.com',
            status: 'pendente',
            iconeId: 'lotus',
            corId: 'verde',
            tipoPermissao: 'categoria',
            categoria: {
                id: 10,
                nome: 'Família'
            },
            permissoesIndividuais: [],
            dataEnvio: DATA_ENVIO,
            dataExpiracao: DATA_EXPIRACAO,
            ...alteracoes
        }
    };
}

function criarConviteIndividual(alteracoes = {}) {
    return {
        mensagem: 'Convite enviado com sucesso.',
        convite: {
            id: 21,
            email: 'individual@example.com',
            status: 'pendente',
            iconeId: 'coracao',
            corId: 'coral',
            tipoPermissao: 'individual',
            categoria: null,
            permissoesIndividuais: ['geral.fase_atual', 'ciclo.fluxo_menstrual'],
            dataEnvio: DATA_ENVIO,
            dataExpiracao: DATA_EXPIRACAO,
            ...alteracoes
        }
    };
}

describe('contactInvitationService', () => {
    test('rejeita configuração sem requisição autenticada', () => {
        expect(() => criarContactInvitationService()).toThrow(
            'Não foi possível configurar o serviço de convites.'
        );

        expect(() =>
            criarContactInvitationService({
                requisicaoAutenticada: 'inválida'
            })
        ).toThrow('Não foi possível configurar o serviço de convites.');
    });

    test('normaliza o e-mail antes da consulta', async () => {
        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            email: 'contato@example.com',
            contaContatoCadastrada: true
        });

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        await expect(service.consultarEmail('  Contato@Example.COM ')).resolves.toEqual({
            email: 'contato@example.com',
            contaContatoCadastrada: true
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.consultaEmailContato,
            corpo: {
                email: 'contato@example.com'
            }
        });
    });

    test('encaminha o sinal de cancelamento na consulta', async () => {
        const controlador = new AbortController();

        const requisicaoAutenticada = jest.fn().mockResolvedValue({
            email: 'contato@example.com',
            contaContatoCadastrada: false
        });

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        await service.consultarEmail('contato@example.com', {
            signal: controlador.signal
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.consultaEmailContato,
            corpo: {
                email: 'contato@example.com'
            },
            signal: controlador.signal
        });
    });

    test.each([null, undefined, '', '   ', 'sem-arroba.com', 'sem-dominio@', '@sem-usuario.com'])(
        'rejeita e-mail inválido sem chamar a API: %p',
        async (email) => {
            const requisicaoAutenticada = jest.fn();

            const service = criarContactInvitationService({
                requisicaoAutenticada
            });

            await expect(service.consultarEmail(email)).rejects.toMatchObject({
                codigo: 'EMAIL_CONTATO_INVALIDO',
                mensagemUsuario: 'Informe um e-mail válido.'
            });

            expect(requisicaoAutenticada).not.toHaveBeenCalled();
        }
    );

    test('rejeita resposta inválida da consulta', async () => {
        const service = criarContactInvitationService({
            requisicaoAutenticada: jest.fn().mockResolvedValue({
                email: 'outro@example.com',
                contaContatoCadastrada: true
            })
        });

        await expect(service.consultarEmail('contato@example.com')).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONSULTA_CONTATO_INVALIDA'
        });
    });

    test('envia convite associado a uma categoria', async () => {
        const resposta = criarConviteCategoria();

        const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        const resultado = await service.enviarConvite({
            email: ' Contato@Example.com ',
            categoriaId: 10,
            iconeId: 'lotus',
            corId: 'verde'
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.convitesContato,
            corpo: {
                email: 'contato@example.com',
                categoriaId: 10,
                iconeId: 'lotus',
                corId: 'verde'
            }
        });

        expect(resultado).toEqual(resposta);
        expect(Object.isFrozen(resultado)).toBe(true);
        expect(Object.isFrozen(resultado.convite)).toBe(true);
        expect(Object.isFrozen(resultado.convite.categoria)).toBe(true);
    });

    test('envia convite com permissões individuais', async () => {
        const resposta = criarConviteIndividual();

        const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        const resultado = await service.enviarConvite({
            email: 'individual@example.com',
            iconeId: 'coracao',
            corId: 'coral',
            permissoesIndividuais: ['ciclo.fluxo_menstrual', 'geral.fase_atual', 'geral.fase_atual']
        });

        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: endpoints.convitesContato,
            corpo: {
                email: 'individual@example.com',
                iconeId: 'coracao',
                corId: 'coral',
                permissoesIndividuais: ['geral.fase_atual', 'ciclo.fluxo_menstrual']
            }
        });

        expect(resultado.convite.tipoPermissao).toBe('individual');

        expect(resultado.convite.permissoesIndividuais).toEqual([
            'geral.fase_atual',
            'ciclo.fluxo_menstrual'
        ]);

        expect(Object.isFrozen(resultado.convite.permissoesIndividuais)).toBe(true);
    });

    test.each([
        null,
        [],
        'convite',
        {
            email: 'contato@example.com'
        },
        {
            email: 'contato@example.com',
            iconeId: 'lotus',
            corId: 'verde'
        },
        {
            email: 'contato@example.com',
            iconeId: 'lotus',
            corId: 'verde',
            categoriaId: 10,
            permissoesIndividuais: ['geral.fase_atual']
        }
    ])('rejeita convite sem vínculo exclusivo: %p', (dados) => {
        expect(() => prepararConvite(dados)).toThrow();
    });

    test('rejeita aparência inválida antes da API', async () => {
        const requisicaoAutenticada = jest.fn();

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        await expect(
            service.enviarConvite({
                email: 'contato@example.com',
                categoriaId: 10,
                iconeId: 'icone-inexistente',
                corId: 'verde'
            })
        ).rejects.toMatchObject({
            codigo: 'APARENCIA_CONTATO_INVALIDA'
        });

        expect(requisicaoAutenticada).not.toHaveBeenCalled();
    });

    test('rejeita campos protegidos antes da API', async () => {
        const requisicaoAutenticada = jest.fn();

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        await expect(
            service.enviarConvite({
                email: 'contato@example.com',
                categoriaId: 10,
                iconeId: 'lotus',
                corId: 'verde',
                titularId: 999
            })
        ).rejects.toMatchObject({
            codigo: 'DADOS_CONVITE_INVALIDOS'
        });

        expect(requisicaoAutenticada).not.toHaveBeenCalled();
    });

    test('não expõe campos privados devolvidos pela API', async () => {
        const service = criarContactInvitationService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(
                criarConviteCategoria({
                    tokenConviteHash: 'segredo',
                    titularId: 999
                })
            )
        });

        const resultado = await service.enviarConvite({
            email: 'contato@example.com',
            categoriaId: 10,
            iconeId: 'lotus',
            corId: 'verde'
        });

        expect(resultado.convite).not.toHaveProperty('tokenConviteHash');

        expect(resultado.convite).not.toHaveProperty('titularId');
    });

    test('rejeita resposta de convite incompatível', async () => {
        const service = criarContactInvitationService({
            requisicaoAutenticada: jest.fn().mockResolvedValue(
                criarConviteCategoria({
                    corId: 'coral'
                })
            )
        });

        await expect(
            service.enviarConvite({
                email: 'contato@example.com',
                categoriaId: 10,
                iconeId: 'lotus',
                corId: 'verde'
            })
        ).rejects.toMatchObject({
            codigo: 'RESPOSTA_CONVITE_INVALIDA'
        });
    });

    test('reutiliza envio idêntico enquanto está pendente', async () => {
        let concluir;

        const requisicaoAutenticada = jest.fn(
            () =>
                new Promise((resolver) => {
                    concluir = resolver;
                })
        );

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        const dados = {
            email: 'contato@example.com',
            categoriaId: 10,
            iconeId: 'lotus',
            corId: 'verde'
        };

        const primeiroEnvio = service.enviarConvite(dados);

        const segundoEnvio = service.enviarConvite(dados);

        expect(segundoEnvio).toBe(primeiroEnvio);
        expect(requisicaoAutenticada).toHaveBeenCalledTimes(0);

        await Promise.resolve();

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(1);

        concluir(criarConviteCategoria());

        await expect(primeiroEnvio).resolves.toMatchObject({
            convite: {
                id: 20
            }
        });
    });

    test('bloqueia outro convite enquanto há envio em andamento', async () => {
        const requisicaoAutenticada = jest.fn(() => new Promise(() => {}));

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        service.enviarConvite({
            email: 'primeiro@example.com',
            categoriaId: 10,
            iconeId: 'lotus',
            corId: 'verde'
        });

        await expect(
            service.enviarConvite({
                email: 'segundo@example.com',
                categoriaId: 10,
                iconeId: 'pessoa',
                corId: 'branco'
            })
        ).rejects.toMatchObject({
            codigo: 'ENVIO_CONVITE_EM_ANDAMENTO'
        });
    });

    test('libera uma nova tentativa depois de falha', async () => {
        const requisicaoAutenticada = jest
            .fn()
            .mockRejectedValueOnce(new Error('falha temporária'))
            .mockResolvedValueOnce(criarConviteCategoria());

        const service = criarContactInvitationService({
            requisicaoAutenticada
        });

        const dados = {
            email: 'contato@example.com',
            categoriaId: 10,
            iconeId: 'lotus',
            corId: 'verde'
        };

        await expect(service.enviarConvite(dados)).rejects.toThrow('falha temporária');

        await expect(service.enviarConvite(dados)).resolves.toMatchObject({
            convite: {
                id: 20
            }
        });

        expect(requisicaoAutenticada).toHaveBeenCalledTimes(2);
    });

    test('normaliza apenas e-mails válidos', () => {
        expect(normalizarEmail('  TESTE@EXAMPLE.COM ')).toBe('teste@example.com');

        expect(() => normalizarEmail('email-inválido')).toThrow('Informe um e-mail válido.');
    });
});
