import assert from 'node:assert/strict';
import test from 'node:test';

import {
    DIAS_PARA_CONVITE_ATRASADO,
    MENSAGEM_ERRO_LISTAGEM_CONTATOS,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE,
    STATUS_CONTATOS_VISIVEIS
} from '../../../../src/features/support-network/constants/supportContact.constants.js';

test('define somente vínculos pendentes e ativos como contatos visíveis', () => {
    assert.deepEqual(STATUS_CONTATOS_VISIVEIS, [
        STATUS_CONTATO_PENDENTE,
        STATUS_CONTATO_ATIVO
    ]);
    assert.equal(Object.isFrozen(STATUS_CONTATOS_VISIVEIS), true);
});

test('considera atrasado somente o convite com mais de sete dias', () => {
    assert.equal(DIAS_PARA_CONVITE_ATRASADO, 7);
});

test('preserva a mensagem amigável exigida para falha da listagem', () => {
    assert.equal(
        MENSAGEM_ERRO_LISTAGEM_CONTATOS,
        'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.'
    );
});
