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
        }
    )};
}