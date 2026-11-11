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
    assert.equal(mensagem.subject, 'Convite para participar da Rede de Apoio');
    assert.match(
        mensagem.text,
        /Você está recebendo este e-mail porque foi indicado\(a\) como Responsável Legal de Ana em nosso aplicativo\./u
    );
    assert.match(
        mensagem.html,
        /Você está recebendo este e-mail porque foi indicado\(a\) como Responsável Legal de <strong>Ana<\/strong> em nosso aplicativo\./u
    );
    assert.match(mensagem.text, /autorização é opcional/iu);
    assert.match(mensagem.text, /exclusivamente para liberar o módulo Rede de Apoio/iu);
    assert.match(mensagem.text, /compartilhe somente informações selecionadas/iu);
    assert.match(mensagem.text, /não concede acesso à conta, ao diário, ao histórico de ciclos/iu);
    assert.match(mensagem.text, /https:\/\/aloya\.test\/consentimento\/token/u);
    assert.match(mensagem.html, /CONFIRMAR AUTORIZAÇÃO/u);
    assert.match(mensagem.html, /background:#FFF3EF/u);
    assert.match(mensagem.html, /family=DM\+Sans:wght@400;700/u);
    assert.match(mensagem.html, /max-width:640px;margin:0 auto;padding:0;font-family:'DM Sans'/u);
    assert.match(mensagem.html, /Equipe Astery/u);
    assert.match(mensagem.text, /expira em 60 minutos/iu);
    assert.match(
        mensagem.html,
        /<td align="center" valign="top" style="padding:28px 18px;vertical-align:top;">/u
    );
    assert.match(
        mensagem.html,
        /<td height="58" align="center" valign="middle" style="height:58px;padding:0 12px;text-align:center;vertical-align:middle;">/u
    );
    assert.match(mensagem.html, /este link expira em <strong>60 minutos<\/strong>/iu);
    assert.match(mensagem.html, /deixa de funcionar após a confirmação/iu);
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

test('escapa o link antes de inseri-lo no HTML do e-mail', async () => {
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
        linkConfirmacao: 'https://aloya.test/consentimento?valor="inseguro"'
    });

    assert.equal(mensagem.html.includes('valor="inseguro"'), false);
    assert.match(mensagem.html, /valor=&quot;inseguro&quot;/u);
});
