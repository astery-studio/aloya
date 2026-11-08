import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactInvitationResendService } from '../../../../src/features/support-network/services/contactInvitationResend.service.js';
import { criarSupportContactService } from '../../../../src/features/support-network/services/supportContact.service.js';

const agora = new Date('2026-11-08T12:00:00.000Z');

test('não consulta contatos quando a sessão pertence somente a um contato de apoio', async () => {
    let consultou = false;
    const service = criarSupportContactService({
        prisma: {
            vinculoRedeApoio: {
                async findMany() {
                    consultou = true;
                    return [];
                }
            }
        }
    });

    await assert.rejects(service.listar({ titularId: 2, papel: 'contato_apoio' }), {
        status: 403,
        codigo: 'ACESSO_NEGADO'
    });
    assert.equal(consultou, false);
});

test('não expõe token, titular ou campos internos na resposta da listagem', async () => {
    const service = criarSupportContactService({
        prisma: {
            vinculoRedeApoio: {
                async findMany() {
                    return [
                        {
                            id: 9,
                            emailConvidado: 'contato@example.com',
                            status: 'pendente',
                            permissoesIndividuais: [],
                            dataEnvio: agora,
                            dataResposta: null,
                            contato: null,
                            categoria: null,
                            tokenConviteHash: 'segredo',
                            titularId: 1
                        }
                    ];
                }
            }
        },
        now: () => agora
    });

    const resultado = await service.listar({ titularId: 1, papel: 'principal' });
    const serializado = JSON.stringify(resultado);

    assert.equal(serializado.includes('segredo'), false);
    assert.equal(serializado.includes('tokenConviteHash'), false);
    assert.equal(serializado.includes('titularId'), false);
});

test('vincula consulta e atualização do reenvio ao mesmo titular autenticado', async () => {
    const consultas = [];
    const atualizacoes = [];
    const service = criarContactInvitationResendService({
        prisma: {
            vinculoRedeApoio: {
                async findFirst(consulta) {
                    consultas.push(consulta);
                    return {
                        id: 9,
                        contatoId: 2,
                        emailConvidado: 'contato@example.com',
                        tokenConviteHash: 'antigo',
                        dataEnvio: agora,
                        dataExpiracao: agora,
                        titular: { nome: 'Ana' }
                    };
                },
                async updateMany(consulta) {
                    atualizacoes.push(consulta);
                    return { count: 1 };
                }
            }
        },
        tokenService: {
            emitir() {
                return { tokenHash: 'novo', dataExpiracao: agora, link: 'aloya://convite' };
            }
        },
        emailService: { async enviarConviteRedeApoio() {} },
        now: () => agora
    });

    await service.reenviar({ titularId: 77, papel: 'principal', contatoId: 9 });

    assert.equal(consultas[0].where.titularId, 77);
    assert.equal(atualizacoes[0].where.titularId, 77);
    assert.equal(atualizacoes[0].where.status, 'pendente');
    assert.equal(atualizacoes[0].where.tokenConviteHash, 'antigo');
});

test('não envia e-mail se o vínculo mudar entre leitura e atualização', async () => {
    let enviou = false;
    const service = criarContactInvitationResendService({
        prisma: {
            vinculoRedeApoio: {
                async findFirst() {
                    return {
                        id: 9,
                        contatoId: null,
                        emailConvidado: 'contato@example.com',
                        tokenConviteHash: 'antigo',
                        dataEnvio: agora,
                        dataExpiracao: agora,
                        titular: { nome: 'Ana' }
                    };
                },
                async updateMany() {
                    return { count: 0 };
                }
            }
        },
        tokenService: {
            emitir() {
                return { tokenHash: 'novo', dataExpiracao: agora, link: 'aloya://convite' };
            }
        },
        emailService: {
            async enviarConviteRedeApoio() {
                enviou = true;
            }
        }
    });

    await assert.rejects(service.reenviar({ titularId: 1, papel: 'principal', contatoId: 9 }), {
        codigo: 'CONVITE_ALTERADO'
    });
    assert.equal(enviou, false);
});
