import assert from 'node:assert/strict';
import test from 'node:test';

import {
    MENSAGEM_CONSENTIMENTO_CONFIRMADO,
    MENSAGEM_EMAIL_RESPONSAVEL_IGUAL_TITULAR,
    MENSAGEM_EMAIL_RESPONSAVEL_INVALIDO,
    MENSAGEM_ERRO_ENVIO_CONSENTIMENTO,
    MENSAGEM_SOLICITACAO_CONSENTIMENTO_ENVIADA
} from '../../../../src/features/auth/constants/parentalConsent.constants.js';

test('preserva as mensagens públicas definidas pela HU-001.1', () => {
    assert.equal(MENSAGEM_EMAIL_RESPONSAVEL_INVALIDO, 'Informe um e-mail válido.');
    assert.equal(
        MENSAGEM_EMAIL_RESPONSAVEL_IGUAL_TITULAR,
        'O e-mail do responsável deve ser diferente do seu e-mail de cadastro.'
    );
    assert.equal(
        MENSAGEM_SOLICITACAO_CONSENTIMENTO_ENVIADA,
        'Enviamos um pedido de autorização para o e-mail informado. Assim que o responsável confirmar, a Rede de Apoio será liberada.'
    );
    assert.equal(
        MENSAGEM_ERRO_ENVIO_CONSENTIMENTO,
        'Não foi possível enviar o pedido de autorização no momento. Tente novamente.'
    );
    assert.equal(MENSAGEM_CONSENTIMENTO_CONFIRMADO, 'Autorização concluída com sucesso.');
});
