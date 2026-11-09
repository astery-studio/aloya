import assert from 'node:assert/strict';
import test from 'node:test';

import { criarEmailService } from '../../../../src/features/auth/services/email.service.js';

test('explica integralmente a autorização parental no próprio e-mail', async () => {
    let mensagem;
    const service = criarEmailService({
        transporter: {
            async sendMail(dados) {
                mensagem = dados;
            }
        },
        remetente: 'Aloya <nao-responda@aloya.test>'
    });

    await service.enviarEmailConsentimentoParental({
        nomeTitular: 'Ana',
        emailResponsavelLegal: 'responsavel@email.com',
        linkConfirmacao: 'https://aloya.test/consentimento/token'
    });

    assert.equal(mensagem.to, 'responsavel@email.com');
    assert.match(mensagem.text, /autorização é opcional/iu);
    assert.match(mensagem.text, /exclusivamente para liberar o módulo Rede de Apoio/iu);
    assert.match(mensagem.text, /compartilhe somente informações selecionadas/iu);
    assert.match(mensagem.text, /não concede acesso à conta, ao diário, ao histórico de ciclos/iu);
    assert.match(mensagem.text, /https:\/\/aloya\.test\/consentimento\/token/u);
});

test('escapa o nome da titular antes de montar o HTML do e-mail', async () => {
    let mensagem;
    const service = criarEmailService({
        transporter: {
            async sendMail(dados) {
                mensagem = dados;
            }
        },
        remetente: 'Aloya <nao-responda@aloya.test>'
    });

    await service.enviarEmailConsentimentoParental({
        nomeTitular: '<img src=x onerror=alert(1)>',
        emailResponsavelLegal: 'responsavel@email.com',
        linkConfirmacao: 'https://aloya.test/consentimento/token'
    });

    assert.equal(mensagem.html.includes('<img src=x'), false);
    assert.match(mensagem.html, /&lt;img src=x onerror=alert\(1\)&gt;/u);
});
