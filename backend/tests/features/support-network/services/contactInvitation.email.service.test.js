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
    assert.equal(mensagem.subject, 'Você foi convidado(a) para uma Rede de Apoio');
    assert.match(mensagem.text, /criar seu cadastro gratuitamente/u);
    assert.match(mensagem.text, /Nenhum dado será compartilhado/u);
    assert.match(mensagem.html, /CRIAR MINHA CONTA/u);
    assert.match(mensagem.html, /background:#C85A44/u);
    assert.match(mensagem.html, /Equipe ALOYA/u);
    assert.equal(mensagem.html.includes('Ana <script>'), false);
    assert.match(mensagem.html, /Ana &lt;script&gt;/u);
});

test('orienta conta cadastrada a aceitar diretamente no aplicativo', async () => {
    let mensagem;
    const service = criarEmailService({
        remetente: 'no-reply@aloya.test',
        transporter: {
            async sendMail(valor) {
                mensagem = valor;
            }
        }
    });

    await service.enviarConviteRedeApoio({
        email: 'contato@example.com',
        nomeTitular: 'Ana',
        linkConvite: 'aloya://support-network/invitation?token=seguro'
    });

    assert.match(mensagem.text, /Abra o Aloya/u);
    assert.doesNotMatch(mensagem.text, /criar seu cadastro gratuitamente/u);
    assert.match(mensagem.html, /VER CONVITE/u);
});
