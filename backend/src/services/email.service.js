function criarEmailService({ transporter, remetente }) {
    // Escapa caracteres especiais antes de inserir o nome da pessoa titular no HTML do e-mail.
    function escaparHtml(texto) {
        return String(texto)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Função que envia o email de confirmação de consentimento parental.
    async function enviarEmailConsentimentoParental({
        nomeTitular,
        emailResponsavelLegal,
        linkConfirmacao
    }) {
        const nomeSeguro = escaparHtml(nomeTitular);

        // Dispara o envio do email.
        await transporter.sendMail({
            from: remetente,
            to: emailResponsavelLegal,
            subject: 'Autorização da Rede de Apoio — ALOYA',

            text: `
                Olá!

                ${nomeTitular} indicou este endereço como e-mail de seu responsável legal na plataforma ALOYA.

                A titular já pode usar normalmente todas as funcionalidades privadas do aplicativo. Esta autorização é opcional e serve exclusivamente para liberar o módulo Rede de Apoio.

                A Rede de Apoio permite que a pessoa titular envie convites e compartilhe somente informações selecionadas por ela com pessoas de confiança.

                Esta autorização não concede acesso à conta, ao diário, ao histórico de ciclos, aos sintomas ou a quaisquer outros dados privados da pessoa titular.

                Para autorizar o acesso à Rede de Apoio, acesse o link abaixo:
                ${linkConfirmacao}

                Este link possui validade de 60 minutos.

                Se você não reconhece esta solicitação ou não deseja autorizar o acesso, ignore esta mensagem.

                Atenciosamente,
                Equipe de Privacidade e Compliance — ALOYA
                            `.trim(),

                            html: `
                <main style="max-width:600px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#222222;line-height:1.6;background-color:#F7F5F0;border-radius:12px;">
                    <div style="text-align:center;margin-bottom:24px;">
                        <span style="display:inline-block;background-color:#E6E2D8;color:#2C4C3B;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;">
                            ALOYA • Privacidade e Compliance
                        </span>

                        <h1 style="color:#2C4C3B;font-size:24px;margin:16px 0 0;">
                            Autorização da Rede de Apoio
                        </h1>
                    </div>

                    <p>Olá!</p>

                    <p>
                        <strong>${nomeSeguro}</strong> indicou este endereço como e-mail de seu responsável legal na plataforma <strong>ALOYA</strong>.
                    </p>

                    <p>
                        A titular já pode utilizar normalmente as funcionalidades privadas do aplicativo.
                        Esta autorização é <strong>opcional</strong> e libera exclusivamente o módulo
                        <strong>Rede de Apoio</strong>.
                    </p>

                    <div style="background-color:#FFFFFF;border:1px solid #D68C3A;padding:20px;border-radius:8px;margin:24px 0;">
                        <p style="margin-top:0;font-weight:bold;color:#2C4C3B;">
                            O que esta autorização permite?
                        </p>

                        <ul style="margin-bottom:0;padding-left:20px;font-size:14px;">
                            <li>
                                Permite que a titular envie convites e compartilhe apenas informações selecionadas por ela com pessoas de confiança.
                            </li>

                            <li style="margin-top:10px;">
                                Não concede acesso à conta, diário, ciclos, sintomas ou outros dados privados da titular.
                            </li>
                        </ul>
                    </div>

                    <p style="text-align:center;margin:36px 0 24px;">
                        <a href="${linkConfirmacao}" style="display:inline-block;padding:16px 32px;border-radius:8px;background:#C85A44;color:#F7F5F0;text-decoration:none;font-weight:bold;font-size:16px;">
                            Autorizar Rede de Apoio
                        </a>
                    </p>

                    <p style="font-size:13px;color:#5C5C59;text-align:center;">
                        Este link possui validade de 60 minutos por motivos de segurança.
                    </p>

                    <hr style="border:none;border-top:1px solid #E6E2D8;margin:24px 0;" />

                    <p style="font-size:13px;color:#5C5C59;">
                        Se você não reconhece esta solicitação ou não deseja autorizar o acesso,
                        basta ignorar esta mensagem.
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