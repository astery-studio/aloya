/**
 * Envia mensagens transacionais de consentimento e recuperação usando o transporte SMTP.
 */
import { VALIDADE_LINK_CONSENTIMENTO_MINUTOS } from '../constants/parentalConsent.constants.js';

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
        const linkSeguro = escaparHtml(linkConfirmacao);

        // Dispara o envio do email.
        await transporter.sendMail({
            from: remetente,
            to: emailResponsavelLegal,
            subject: 'Convite para participar da Rede de Apoio',

            text: `
                Olá!

                Você está recebendo este e-mail porque foi indicado(a) como Responsável Legal de ${nomeTitular} em nosso aplicativo.

                O titular já pode usar normalmente todas as funcionalidades privadas do aplicativo. Esta autorização é opcional e serve exclusivamente para liberar o módulo Rede de Apoio.

                A Rede de Apoio permite que a pessoa titular envie convites e compartilhe somente informações selecionadas por ela com pessoas de confiança.

                Esta autorização não concede acesso à conta, ao diário, ao histórico de ciclos, aos sintomas ou a quaisquer outros dados privados da pessoa titular.

                Para autorizar o acesso à Rede de Apoio, acesse o link abaixo:
                ${linkConfirmacao}

                Este link expira em ${VALIDADE_LINK_CONSENTIMENTO_MINUTOS} minutos.

                Se você não reconhece esta solicitação ou não deseja autorizar o acesso, ignore esta mensagem.

                Atenciosamente,
                Equipe Astery
                            `.trim(),

            html: `
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap');
                </style>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#FFFFFF;">
                    <tr>
                        <td align="center" valign="top" style="padding:28px 18px;vertical-align:top;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="box-sizing:border-box;width:100%;max-width:640px;margin:0 auto;background:#FFFFFF;">
                    <tr>
                        <td align="left" style="padding:0;font-family:'DM Sans',Arial,Helvetica,sans-serif;color:#222222;font-size:16px;line-height:1.55;text-align:left;">
                    <p style="margin:0 0 34px;">Olá!</p>

                    <p style="margin:0 0 24px;">
                        Você está recebendo este e-mail porque foi indicado(a) como Responsável Legal de <strong>${nomeSeguro}</strong> em nosso aplicativo.
                    </p>

                    <p style="margin:0 0 24px;">
                        A <strong>Rede de Apoio</strong> é um recurso que permite ao titular compartilhar com pessoas de sua confiança uma rede de cuidado e suporte, possibilitando que elas participem de seu processo de acompanhamento e ofereçam apoio quando necessário.
                    </p>

                    <p style="margin:0 0 24px;">
                        Sua participação depende de uma autorização, que é <strong>totalmente opcional</strong>. Você pode aceitar ou recusar o convite, sem que isso prejudique o acesso ou a utilização do aplicativo pelo titular.
                    </p>

                    <section style="box-sizing:border-box;margin:0 0 24px;padding:18px 20px 18px 22px;border-left:5px solid #C85A44;border-radius:0 12px 12px 0;background:#FFF3EF;">
                        <p style="margin:0 0 4px;font-weight:700;">
                            É importante esclarecer que essa autorização NÃO concede acesso à conta do titular nem a suas informações privadas.
                        </p>
                        <p style="margin:0;">
                            Você não terá acesso ao diário, histórico de ciclos, sintomas, registros pessoais ou quaisquer outros dados particulares. A autorização não permite visualizar, editar ou gerenciar essas informações.
                        </p>
                    </section>

                    <p style="margin:0 0 24px;">
                        Caso concorde com a participação, clique no botão abaixo para confirmar sua autorização:
                    </p>

                    <p style="margin:0 0 24px;">
                        <a href="${linkSeguro}" style="display:block;box-sizing:border-box;width:100%;padding:15px 24px;border-radius:10px;background:#C85A44;color:#FFFFFF;text-align:center;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:.3px;">
                            CONFIRMAR AUTORIZAÇÃO
                        </a>
                    </p>

                    <p style="margin:0 0 24px;">Agradecemos pela disponibilidade!</p>

                    <p style="margin:0;">Atenciosamente,<br /><strong>Equipe Astery</strong></p>

                    <footer style="margin:32px 0 0;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-top:1px solid #E6E2D8;color:#5C5C59;font-size:13px;line-height:1.5;">
                            <tr>
                                <td height="58" align="center" valign="middle" style="height:58px;padding:0 12px;text-align:center;vertical-align:middle;">
                                    Por segurança, este link expira em <strong>${VALIDADE_LINK_CONSENTIMENTO_MINUTOS} minutos</strong> e deixa de funcionar após a confirmação.
                                </td>
                            </tr>
                        </table>
                    </footer>
                        </td>
                    </tr>
                </table>
                        </td>
                    </tr>
                </table>
                            `
        });
    }

    async function enviarEmailRecuperacaoSenha({ email, linkRedefinicao }) {
        await transporter.sendMail({
            from: remetente,
            to: email,
            subject: 'Redefinição de senha — ALOYA',
            text: `Para criar uma nova senha, acesse: ${linkRedefinicao}\n\nEste link expira em 60 minutos. Se você não solicitou a alteração, ignore esta mensagem.`,
            html: `
                <main style="max-width:600px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#222;background:#F7F5F0;border-radius:12px;">
                    <h1 style="color:#2C4C3B;">Redefina sua senha</h1>
                    <p>Recebemos uma solicitação para redefinir sua senha no ALOYA.</p>
                    <p style="margin:32px 0;">
                        <a href="${linkRedefinicao}" style="padding:16px 24px;border-radius:12px;background:#2C4C3B;color:#FFF;text-decoration:none;">
                            Criar nova senha
                        </a>
                    </p>
                    <p>O link expira em 60 minutos e deixa de funcionar após o uso.</p>
                    <p style="color:#5C5C59;">Se você não solicitou a alteração, ignore esta mensagem.</p>
                </main>
            `
        });
    }

    async function enviarConviteRedeApoio({
        email,
        nomeTitular,
        linkConvite,
        requerCadastro = false
    }) {
        const nomeSeguro = escaparHtml(nomeTitular);
        const linkSeguro = escaparHtml(linkConvite);
        const orientacao = requerCadastro
            ? 'Para participar, é necessário possuir uma conta em nosso aplicativo. Caso ainda não tenha uma, você poderá criar seu cadastro gratuitamente e, em seguida, aceitar o convite para integrar essa Rede de Apoio.'
            : 'Abra o Aloya e aceite o convite para entrar na Rede de Apoio.';
        const rotuloAcao = requerCadastro ? 'CRIAR MINHA CONTA' : 'VER CONVITE';
        const introducao = `${nomeTitular} convidou você para fazer parte de sua Rede de Apoio no Aloya.`;

        await transporter.sendMail({
            from: remetente,
            to: email,
            subject: 'Você foi convidado(a) para uma Rede de Apoio',
            text: `Olá!\n\n${introducao}\n\nA Rede de Apoio é um recurso que permite que pessoas de confiança façam parte de uma rede de cuidado e suporte, oferecendo acolhimento e acompanhando o titular em sua jornada de autocuidado.\n\n${orientacao}\n\nPara começar, acesse:\n${linkConvite}\n\nApós concluir o cadastro, você poderá acessar o convite e decidir se deseja aceitar a participação na Rede de Apoio.\n\nNenhum dado será compartilhado antes que você aceite explicitamente este convite.\n\nAgradecemos pela disposição em fazer parte dessa rede de cuidado, confiança e acolhimento!\n\nAtenciosamente,\nEquipe ALOYA`,
            html: `
                <main style="max-width:640px;margin:0 auto;padding:32px 24px;font-family:Arial,Helvetica,sans-serif;color:#222;background:#FFF;font-size:16px;line-height:1.65;">
                    <p style="margin:0 0 42px;">Olá!</p>
                    <p style="margin:0 0 24px;">
                        Você recebeu este e-mail porque <strong>${nomeSeguro}</strong>, que utiliza nosso aplicativo, convidou você para fazer parte de sua <strong>Rede de Apoio!</strong>
                    </p>
                    <p style="margin:0 0 24px;">
                        A Rede de Apoio é um recurso que permite que pessoas de confiança façam parte de uma rede de cuidado e suporte, oferecendo acolhimento e acompanhando o titular em sua jornada de autocuidado.
                    </p>
                    <p style="margin:0 0 24px;">${escaparHtml(orientacao)}</p>
                    <p style="margin:0 0 20px;">Para começar, clique no botão abaixo e ${requerCadastro ? 'crie sua conta' : 'veja seu convite'}:</p>
                    <p style="margin:0 0 28px;">
                        <a href="${linkSeguro}" style="display:block;box-sizing:border-box;width:100%;padding:15px 24px;border-radius:10px;background:#C85A44;color:#FFF;text-align:center;text-decoration:none;font-size:16px;font-weight:700;">
                            ${rotuloAcao}
                        </a>
                    </p>
                    <p style="margin:0 0 24px;">
                        Após concluir ${requerCadastro ? 'o cadastro' : 'o acesso'}, você poderá acessar o convite e decidir se deseja aceitar a participação na Rede de Apoio.
                    </p>
                    <p style="margin:0 0 24px;">
                        Agradecemos pela disposição em fazer parte dessa rede de cuidado, confiança e acolhimento!
                    </p>
                    <p style="margin:0;">Atenciosamente,<br><strong>Equipe ALOYA</strong></p>
                    <p style="margin:28px 0 0;color:#5C5C59;font-size:13px;">
                        Nenhum dado será compartilhado antes que você aceite explicitamente este convite. O link expira em 7 dias.
                    </p>
                </main>
            `
        });
    }

    return {
        enviarEmailConsentimentoParental,
        enviarEmailRecuperacaoSenha,
        enviarConviteRedeApoio
    };
}

export { criarEmailService };
