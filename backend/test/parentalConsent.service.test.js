const test = require('node:test');
const assert = require('node:assert/strict');

const {
    criarParentalConsentService
} = require('../src/services/parentalConsent.service');

function criarCrypto() {
    const tokenPuro = 't'.repeat(43);

    return {
        tokenPuro,
        crypto: {
            randomBytes() {
                return { toString: () => tokenPuro };
            },
            createHash() {
                return {
                    update() {
                        return this;
                    },
                    digest() {
                        return 'hash-do-token';
                    }
                };
            }
        }
    };
}

function criarTitular() {
    return {
        id: 1,
        nome: 'Carla Cristina',
        email: 'carla@email.com',
        dataNascimento: new Date('2015-05-13T00:00:00.000Z')
    };
}

test('cria solicitação armazenando somente o hash do token', async () => {
    const registros = [];
    const { crypto, tokenPuro } = criarCrypto();
    const agora = new Date('2026-09-14T12:00:00.000Z');
    const service = criarParentalConsentService({
        prisma: {},
        crypto,
        baseUrl: 'https://aloya.test/consentimento',
        dateUtils: {},
        emailService: {},
        now: () => agora
    });
    const tx = {
        consentimentoParental: {
            async create(argumentos) {
                registros.push(argumentos);
            }
        }
    };

    const resultado = await service.criarPendente(tx, {
        titularMenorId: 1,
        nomeTitular: 'Carla Cristina',
        emailTitular: 'carla@email.com',
        emailResponsavelLegal: 'responsavel@email.com'
    });

    assert.equal(registros[0].data.tokenConfirmacaoHash, 'hash-do-token');
    assert.equal(JSON.stringify(registros).includes(tokenPuro), false);
    assert.equal(
        registros[0].data.validadeLink.toISOString(),
        '2026-09-14T13:00:00.000Z'
    );
    assert.equal(
        resultado.linkConfirmacao,
        `https://aloya.test/consentimento/${tokenPuro}`
    );
});

test('solicita consentimento e envia o link ao responsável', async () => {
    const atualizacoes = [];
    const emails = [];
    const { crypto } = criarCrypto();
    const prisma = {
        usuario: {
            async findUnique() {
                return criarTitular();
            }
        },
        consentimentoParental: {
            async upsert(argumentos) {
                atualizacoes.push(argumentos);
            }
        }
    };
    const service = criarParentalConsentService({
        prisma,
        crypto,
        baseUrl: 'https://aloya.test/consentimento',
        dateUtils: {
            calcularIdade() {
                return 11;
            }
        },
        emailService: {
            async enviarEmailConsentimentoParental(dados) {
                emails.push(dados);
            }
        },
        now: () => new Date('2026-09-14T12:00:00.000Z')
    });

    const resultado = await service.solicitar(
        1,
        'responsavel@email.com'
    );

    assert.equal(atualizacoes.length, 1);
    assert.equal(emails.length, 1);
    assert.equal(resultado.emailEnviado, true);
    assert.equal(resultado.statusConsentimento, 'pendente');
});

test('substitui e-mail e token ao reenviar o consentimento', async () => {
    const atualizacoes = [];
    const { crypto } = criarCrypto();
    const prisma = {
        usuario: {
            async findUnique() {
                return criarTitular();
            }
        },
        consentimentoParental: {
            async findUnique() {
                return {
                    emailResponsavelLegal: 'antigo@email.com',
                    statusConsentimento: 'pendente'
                };
            },
            async update(argumentos) {
                atualizacoes.push(argumentos);
            }
        }
    };
    const service = criarParentalConsentService({
        prisma,
        crypto,
        baseUrl: 'https://aloya.test/consentimento',
        dateUtils: { calcularIdade: () => 11 },
        emailService: {
            async enviarEmailConsentimentoParental() {}
        },
        now: () => new Date('2026-09-14T12:00:00.000Z')
    });

    await service.reenviar(1, 'novo@email.com');

    assert.equal(
        atualizacoes[0].data.emailResponsavelLegal,
        'novo@email.com'
    );
    assert.equal(
        atualizacoes[0].data.tokenConfirmacaoHash,
        'hash-do-token'
    );
    assert.equal(atualizacoes[0].data.respondidoEm, null);
});

test('libera a Rede de Apoio ao confirmar token válido', async () => {
    const atualizacoes = [];
    const { crypto, tokenPuro } = criarCrypto();
    const agora = new Date('2026-09-14T12:00:00.000Z');
    const prisma = {
        usuario: {
            async findUnique() {
                return criarTitular();
            }
        },
        consentimentoParental: {
            async findFirst() {
                return {
                    id: 10,
                    titularMenorId: 1,
                    statusConsentimento: 'pendente',
                    validadeLink: new Date('2026-09-14T13:00:00.000Z')
                };
            },
            async update(argumentos) {
                atualizacoes.push(argumentos);
            }
        }
    };
    const service = criarParentalConsentService({
        prisma,
        crypto,
        baseUrl: 'https://aloya.test',
        dateUtils: { calcularIdade: () => 11 },
        emailService: {},
        now: () => agora
    });

    const resultado = await service.confirmar(tokenPuro);

    assert.deepEqual(atualizacoes[0].data, {
        statusConsentimento: 'liberado',
        respondidoEm: agora
    });
    assert.equal(resultado.acessoRedeApoioLiberado, true);
    assert.equal(
        resultado.mensagem,
        'Autorização concluída com sucesso.'
    );
});

test('marca o link como expirado e rejeita a confirmação', async () => {
    const atualizacoes = [];
    const { crypto, tokenPuro } = criarCrypto();
    const prisma = {
        usuario: {
            async findUnique() {
                return criarTitular();
            }
        },
        consentimentoParental: {
            async findFirst() {
                return {
                    id: 10,
                    titularMenorId: 1,
                    statusConsentimento: 'pendente',
                    validadeLink: new Date('2026-09-14T11:00:00.000Z')
                };
            },
            async update(argumentos) {
                atualizacoes.push(argumentos);
            }
        }
    };
    const service = criarParentalConsentService({
        prisma,
        crypto,
        baseUrl: 'https://aloya.test',
        dateUtils: { calcularIdade: () => 11 },
        emailService: {},
        now: () => new Date('2026-09-14T12:00:00.000Z')
    });

    await assert.rejects(service.confirmar(tokenPuro), {
        status: 410,
        codigo: 'LINK_CONSENTIMENTO_EXPIRADO'
    });

    assert.deepEqual(atualizacoes[0].data, {
        statusConsentimento: 'expirado'
    });
});