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
