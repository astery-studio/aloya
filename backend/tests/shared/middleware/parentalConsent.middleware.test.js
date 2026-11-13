import assert from 'node:assert/strict';
import test from 'node:test';

import { criarParentalConsentMiddleware } from '../../../src/shared/middleware/parentalConsent.middleware.js';

test('permite conta exclusivamente de apoio sem consultar consentimento parental', async () => {
    let consultas = 0;
    let avancou = false;
    const middleware = criarParentalConsentMiddleware({
        parentalConsentService: {
            async verificarAcessoRedeApoio() {
                consultas += 1;
            }
        }
    });

    await middleware.exigirAcessoRedeApoio(
        { usuario: { id: 8, papel: 'contato_apoio' } },
        {},
        (erro) => {
            assert.equal(erro, undefined);
            avancou = true;
        }
    );

    assert.equal(avancou, true);
    assert.equal(consultas, 0);
});

test('bloqueia titular menor sem consentimento inclusive nos convites recebidos', async () => {
    let erroRecebido;
    const middleware = criarParentalConsentMiddleware({
        parentalConsentService: {
            async verificarAcessoRedeApoio() {
                return { acessoLiberado: false, motivo: 'CONSENTIMENTO_NECESSARIO' };
            }
        }
    });

    await middleware.exigirAcessoRedeApoio(
        { usuario: { id: 9, papel: 'principal' } },
        {},
        (erro) => {
            erroRecebido = erro;
        }
    );

    assert.equal(erroRecebido?.status, 403);
    assert.equal(erroRecebido?.codigo, 'REDE_APOIO_BLOQUEADA');
});
