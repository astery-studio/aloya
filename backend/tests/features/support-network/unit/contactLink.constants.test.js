import assert from 'node:assert/strict';
import test from 'node:test';

import {
    MENSAGEM_ERRO_ATUALIZACAO_VINCULO,
    MENSAGEM_SUCESSO_ATUALIZACAO_VINCULO,
    TIPOS_VINCULO
} from '../../../../src/features/support-network/constants/contactLink.constants.js';

test('limita a alteração aos vínculos por categoria e individual', () => {
    assert.deepEqual(TIPOS_VINCULO, ['categoria', 'individual']);
    assert.equal(Object.isFrozen(TIPOS_VINCULO), true);
});

test('preserva as mensagens públicas definidas pela HU-030', () => {
    assert.equal(MENSAGEM_SUCESSO_ATUALIZACAO_VINCULO, 'Vínculo atualizado com sucesso.');
    assert.equal(
        MENSAGEM_ERRO_ATUALIZACAO_VINCULO,
        'Não foi possível atualizar o vínculo deste contato. Tente novamente.'
    );
});
