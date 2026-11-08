import assert from 'node:assert/strict';
import test from 'node:test';

import {
    MENSAGEM_CONFIRMACAO_REMOCAO_CONTATO,
    MENSAGEM_ERRO_REMOCAO_CONTATO,
    MENSAGEM_SUCESSO_REMOCAO_CONTATO
} from '../../../../src/features/support-network/constants/supportContactRemoval.constants.js';

test('preserva as mensagens públicas da HU-031', () => {
    assert.equal(
        MENSAGEM_CONFIRMACAO_REMOCAO_CONTATO,
        'Ao remover este contato, ele deixará de visualizar qualquer informação sua imediatamente.'
    );
    assert.equal(MENSAGEM_SUCESSO_REMOCAO_CONTATO, 'Contato removido com sucesso.');
    assert.equal(
        MENSAGEM_ERRO_REMOCAO_CONTATO,
        'Não foi possível remover este contato. Tente novamente.'
    );
});
