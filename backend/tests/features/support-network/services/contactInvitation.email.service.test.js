import assert from 'node:assert/strict';
import test from 'node:test';

import { criarEmailService } from '../../../../src/features/auth/services/email.service.js';

test('envia convite informando que nenhum acesso foi concedido', async () => {
    let mensagem;
    const service = criarEmailService({
        remetente: 'ALOYA <no-reply@aloya.test>',
        transporter: {
            async sendMail(valor) {
                mensagem = valor;
            }
        }
    });

    await service.enviarConviteRedeApoio({
        email: 'contato@example.com',
        nomeTitular: 'Ana <script>',
        linkConvite: 'aloya://support-network/invitation?token=seguro',
        requerCadastro: true
    });

    assert.equal(mensagem.to, 'contato@example.com');
    assert.match(mensagem.subject, /Rede de Apoio/u);
    assert.match(mensagem.text, /Crie sua conta/u);
    assert.match(mensagem.text, /Nenhum dado será compartilhado/u);
    assert.equal(mensagem.html.includes('Ana <script>'), false);
    assert.match(mensagem.html, /Ana &lt;script&gt;/u);
});

test('orienta conta cadastrada a aceitar diretamente no aplicativo', async () => {
    let mensagem;
    const service = criarEmailService({
        remetente: 'no-reply@aloya.test',
        transporter: { async sendMail(valor) { mensagem = valor; } }
    });

    await service.enviarConviteRedeApoio({
        email: 'contato@example.com',
        nomeTitular: 'Ana',
        linkConvite: 'aloya://support-network/invitation?token=seguro'
    });

    assert.match(mensagem.text, /Abra o Aloya/u);
    assert.doesNotMatch(mensagem.text, /Crie sua conta/u);
});
