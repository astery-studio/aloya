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

        subject: 'Confirmação de consentimento — ALOYA', // Assunto do e-mail

        // Corpo do email
        text: `
            Olá!

            Uma pessoa menor de 16 anos indicou este endereço de e-mail como contato de seu responsável legal para o cadastro na plataforma ALOYA.

            O ALOYA é um aplicativo de saúde e autoconhecimento voltado ao acompanhamento do ciclo menstrual, diário de bem-estar e controle de uso de anticoncepcionais.

            Por que este e-mail está sendo enviado?
            De acordo com a nossa política interna de precaução e em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018, Art. 14), o tratamento de dados pessoais sensíveis de saúde de menores de 16 anos exige o consentimento específico e destacado de um responsável legal.

            É importante destacar que a titular menor de idade possui autonomia integral e imediata para utilizar todas as ferramentas de autoconhecimento, calendário, diário e controle de medicações do aplicativo de forma privada. O consentimento solicitado refere-se exclusivamente à liberação do módulo de Rede de Apoio.

            O que esta autorização envolve?
            - O que é liberado: Permite que a menor de idade envie convites e compartilhe informações de saúde estritamente selecionadas com pessoas de sua confiança por meio da Rede de Apoio.
            - O que continua protegido: Esta autorização não concede acesso à conta, ao diário pessoal, ao histórico de ciclos, aos sintomas ou a quaisquer outros dados privados da titular.

            Para autorizar formalmente o acesso à Rede de Apoio, acesse:
            ${linkConfirmacao}

            (Nota: Este link possui validade de 60 minutos por motivos de segurança).

            Se você não reconhece esta solicitação ou tem dúvidas sobre a privacidade dos dados, basta ignorar esta mensagem. Caso precise de mais esclarecimentos, nossa equipe de suporte e nosso Encarregado de Dados (DPO) encontram-se à disposição através dos canais oficiais da plataforma.

            Atenciosamente,
            Equipe de Privacidade e Compliance — ALOYA
        `.trim(),

        // Corpo principal do email formatado em HTML estilizado
        html: `
            <main style="max-width:600px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#222222;line-height:1.6;background-color:#F7F5F0;border-radius:12px;">
                <!-- Cabeçalho -->
                <div style="text-align:center;margin-bottom:24px;">
                    <span style="display:inline-block;background-color:#E6E2D8;color:#2C4C3B;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:20px;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">ALOYA • Privacidade e Compliance</span>
                    <h1 style="color:#2C4C3B;font-size:24px;margin:0;line-height:1.2;">Confirmação de Consentimento</h1>
                </div>

                <p style="font-size:16px;">Olá!</p>

                <p style="font-size:15px;">
                    Uma pessoa menor de 16 anos indicou este endereço de e-mail como contato de seu responsável legal para o cadastro na plataforma <strong>ALOYA</strong>.
                </p>

                <!-- O que é o Aloya -->
                <div style="background-color:#E6E2D8;border-left:4px solid #2C4C3B;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
                    <p style="margin:0 0 6px 0;font-size:14px;font-weight:bold;color:#2C4C3B;text-transform:uppercase;letter-spacing:0.5px;">O que é o ALOYA?</p>
                    <p style="margin:0;font-size:14px;color:#222222;">
                        É um aplicativo de saúde e autoconhecimento voltado ao acompanhamento do ciclo menstrual, diário de bem-estar e controle de uso de anticoncepcionais.
                    </p>
                </div>

                <p style="font-size:15px;">
                    De acordo com a nossa política interna de precaução e em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018, Art. 14)</strong>, o tratamento de dados sensíveis de saúde de menores de 16 anos exige consentimento específico de um responsável legal.
                </p>

                <p style="font-size:15px;">
                    Ressaltamos que a titular menor de idade possui <strong>autonomia integral</strong> para utilizar todas as ferramentas de autoconhecimento, calendário e diário de forma privada. O consentimento abaixo refere-se <strong>exclusivamente</strong> à liberação opcional do módulo de <strong>Rede de Apoio</strong>.
                </p>

                <!-- Card de Escopo -->
                <div style="background-color:#FFFFFF;border:1px solid #D68C3A;padding:20px;border-radius:8px;margin:24px 0;">
                    <p style="margin-top:0;margin-bottom:12px;font-weight:bold;color:#2C4C3B;font-size:15px;">O que esta autorização envolve:</p>
                    <ul style="margin:0;padding-left:20px;font-size:14px;color:#222222;">
                        <li style="margin-bottom:10px;"><strong>Liberado:</strong> Envio de convites e compartilhamento pontual de dados de saúde com pessoas de confiança escolhidas pela titular.</li>
                        <li style="margin:0;"><strong>Protegido:</strong> <em>Não</em> concede acesso à conta, diário pessoal, histórico de ciclos, sintomas ou dados privados da titular.</li>
                    </ul>
                </div>

                <!-- Botão de Ação -->
                <p style="text-align:center;margin:36px 0 24px 0">
                    <a href="${linkConfirmacao}" style="display:inline-block;padding:16px 32px;border-radius:8px;background:#C85A44;color:#F7F5F0;text-decoration:none;font-weight:bold;font-size:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                        Autorizar Rede de Apoio
                    </a>
                </p>

                <p style="font-size:13px;color:#5C5C59;text-align:center;margin-bottom:24px;">
                    Este link possui validade de <strong>60 minutos</strong> por motivos de segurança.
                </p>

                <hr style="border:none;border-top:1px solid #E6E2D8;margin:24px 0;" />

                <!-- Rodapé -->
                <p style="font-size:13px;color:#5C5C59;margin-bottom:12px;">
                    Se você não reconhece esta solicitação ou tem dúvidas sobre a privacidade dos dados, ignore esta mensagem. Para mais esclarecimentos, nosso Encarregado de Dados (DPO) e equipe de suporte encontram-se à disposição.
                </p>

                <p style="font-size:13px;color:#2C4C3B;margin-top:16px;font-weight:bold;">
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