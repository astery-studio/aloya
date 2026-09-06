function criarEmailService({ transporter, remetente }) {
    // Função que envia o email de confirmação de consentimento parental
    async function enviarEmailConsentimentoParental({
        emailResponsavelLegal,
        linkConfirmacao
    }) {

        // Dispara o envio do email
        await transporter.sendMail({
        from: remetente, // Email remetente oficial da aplicação (deve ser configurado no .env)

        to: emailResponsavelLegal, // Email do responsável legal informado no cadastro do menor de 16 anos

        subject: 'Autorização para Rede de Apoio — ALOYA', // Assunto do e-mail
            text: `
                Olá!

                Uma pessoa menor de 16 anos informou este e-mail como contato de responsável legal no ALOYA.
                A pessoa pode utilizar normalmente as funcionalidades privadas do aplicativo. Esta autorização é opcional e libera exclusivamente a Rede de Apoio.

                Ao autorizar, a titular poderá convidar pessoas de confiança e escolher quais dados deseja compartilhar.

                Esta autorização não concede acesso à conta, ao diário, ao histórico de ciclos, aos sintomas ou a outros dados privados.

                Para autorizar a Rede de Apoio, acesse:
                ${linkConfirmacao}

                Este link expira em 60 minutos.

                Se você não quiser autorizar ou não reconhecer esta solicitação, basta ignorar este e-mail.
                            `.trim(),

                            html: `
                                <main style="max-width:600px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#222222;line-height:1.6;background-color:#F7F5F0;border-radius:12px;">
                                    <div style="text-align:center;margin-bottom:24px;">
                                        <span style="display:inline-block;background-color:#E6E2D8;color:#2C4C3B;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                                            ALOYA • Privacidade e Compliance
                                        </span>

                                        <h1 style="color:#2C4C3B;font-size:24px;margin:0;">
                                            Autorização para Rede de Apoio
                                        </h1>
                                    </div>

                                    <p>Olá!</p>

                                    <p>
                                        Uma pessoa menor de 16 anos informou este e-mail como contato de responsável legal no <strong>ALOYA</strong>.
                                    </p>

                                    <div style="background-color:#E6E2D8;border-left:4px solid #2C4C3B;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
                                        <p style="margin:0;">
                                            A pessoa pode utilizar normalmente as funcionalidades privadas do aplicativo. Esta autorização é <strong>opcional</strong> e libera exclusivamente a funcionalidade <strong>Rede de Apoio</strong>.
                                        </p>
                                    </div>

                                    <div style="background-color:#FFFFFF;border:1px solid #D68C3A;padding:20px;border-radius:8px;margin:24px 0;">
                                        <p style="margin-top:0;font-weight:bold;color:#2C4C3B;">
                                            O que esta autorização permite?
                                        </p>

                                        <p>
                                            A titular poderá convidar pessoas de confiança e escolher quais informações deseja compartilhar.
                                        </p>

                                        <p style="margin-bottom:0;">
                                            Esta autorização não concede acesso à conta, diário, histórico de ciclos, sintomas ou outros dados privados.
                                        </p>
                                    </div>

                                    <p style="text-align:center;margin:36px 0 24px 0;">
                                        <a href="${linkConfirmacao}" style="display:inline-block;padding:16px 32px;border-radius:8px;background:#C85A44;color:#F7F5F0;text-decoration:none;font-weight:bold;font-size:16px;">
                                            Autorizar Rede de Apoio
                                        </a>
                                    </p>

                                    <p style="font-size:13px;color:#5C5C59;text-align:center;">
                                        Este link possui validade de 60 minutos.
                                    </p>

                                    <hr style="border:none;border-top:1px solid #E6E2D8;margin:24px 0;" />

                                    <p style="font-size:13px;color:#5C5C59;">
                                        Se você não quiser autorizar ou não reconhecer esta solicitação, ignore esta mensagem.
                                    </p>

                                    <p style="font-size:13px;color:#2C4C3B;font-weight:bold;">
                                        Equipe de Privacidade e Compliance — ALOYA
                                    </p>
                                </main>
                            `
        });
    }

    return {
        enviarEmailConsentimentoParental
    };
}

module.exports = {
    criarEmailService
};