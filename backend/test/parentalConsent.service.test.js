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
