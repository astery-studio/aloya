import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { EditFieldSheet } from '../../../../shared/components/feedback/EditFieldSheet/EditFieldSheet';
import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { EnvelopeIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../../settings/layouts/SettingsLayout/SettingsLayout';
import { ProfileField } from '../../../settings/profile/ProfileField';
import { useParentalConsent } from '../../hooks/useParentalConsent';
import { validarEmail } from '../../services/parentalConsentService';
import { criarEstilos } from './ParentalConsentScreen.styles';

function normalizarEmail(email) {
    return String(email ?? '')
        .trim()
        .toLowerCase();
}

function ParentalConsentScreen({ service, emailUsuario, onVoltar, onSessaoExpirada }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const consentimento = useParentalConsent({ service, onSessaoExpirada });
    const [email, setEmail] = useState('');
    const [emailOriginal, setEmailOriginal] = useState('');
    const [rascunho, setRascunho] = useState('');
    const [editando, setEditando] = useState(false);
    const [modal, setModal] = useState(null);

    useEffect(() => {
        const emailRecebido = normalizarEmail(consentimento.status?.emailResponsavelLegal);

        setEmail(emailRecebido);
        setEmailOriginal(emailRecebido);
    }, [consentimento.status?.emailResponsavelLegal]);

    useEffect(() => {
        if (consentimento.resultadoEnvio) setModal('sucesso');
        else if (consentimento.erroEnvio) setModal('erro');
    }, [consentimento.erroEnvio, consentimento.resultadoEnvio]);

    const confirmado = consentimento.status?.statusConsentimento === 'liberado';
    const alterado = normalizarEmail(email) !== normalizarEmail(emailOriginal);
    const podeSalvar = !confirmado && !consentimento.enviando && Boolean(email) && alterado;

    function abrirEdicao() {
        if (confirmado || consentimento.enviando) return;
        setRascunho(email);
        setEditando(true);
    }

    function aplicarEdicao() {
        setEmail(rascunho.trim());
        setEditando(false);
    }

    async function salvar() {
        if (!podeSalvar) return;

        let emailValidado;

        try {
            emailValidado = validarEmail(email);
        } catch {
            setModal('emailInvalido');
            return;
        }

        if (emailValidado === normalizarEmail(emailUsuario)) {
            setModal('emailProprio');
            return;
        }

        const sucesso = emailOriginal
            ? await consentimento.reenviar(emailValidado)
            : await consentimento.solicitar(emailValidado);

        if (sucesso) {
            setEmail(emailValidado);
            setEmailOriginal(emailValidado);
        }
    }

    function fecharFeedback() {
        setModal(null);
        consentimento.limparFeedback();
    }

    return (
        <>
            <SettingsLayout titulo="Responsável Legal" onVoltar={onVoltar}>
                <View style={estilos.container}>
                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Responsável legal cadastrado</Text>

                        <ProfileField
                            label="E-mail"
                            valor={email}
                            placeholder="Digite aqui o e-mail"
                            onPress={abrirEdicao}
                            desabilitado={confirmado || consentimento.enviando}
                        />
                    </View>

                    <ButtonScreen
                        texto="Salvar"
                        variante="verde"
                        aoPressionar={salvar}
                        desativado={!podeSalvar}
                        carregando={consentimento.enviando}
                        estilo={!podeSalvar && estilos.botaoSalvarDesativado}
                        estiloTexto={!podeSalvar && estilos.textoSalvarDesativado}
                    />
                </View>
            </SettingsLayout>

            <EditFieldSheet
                visivel={editando}
                titulo="Editar E-mail"
                tipo="email"
                valor={rascunho}
                onAlterar={setRascunho}
                onFechar={() => setEditando(false)}
                salvando={consentimento.enviando}
                estiloCaixaCampo={estilos.caixaCampoEdicao}
                estiloCampo={estilos.textoCampoEdicao}
                corFundo={tema.escuro ? '#242424' : undefined}
                estiloPainel={estilos.painelEdicao}
                botaoSalvar={
                    <ButtonScreen
                        texto="Salvar"
                        variante="verde"
                        aoPressionar={aplicarEdicao}
                        desativado={!rascunho.trim()}
                    />
                }
            />

            <SimpleModal
                visivel={modal === 'emailInvalido'}
                aoFechar={fecharFeedback}
                icone={WarningCircleIcon}
                titulo="Informe um e-mail válido"
                mensagem="Verifique o endereço informado e tente novamente."
                acaoPrincipal={{ texto: 'OK', aoPressionar: fecharFeedback }}
            />

            <SimpleModal
                visivel={modal === 'emailProprio'}
                aoFechar={fecharFeedback}
                icone={WarningCircleIcon}
                titulo="Este e-mail já está em uso"
                mensagem="O e-mail do responsável deve ser diferente do seu e-mail de cadastro."
                acaoPrincipal={{ texto: 'OK', aoPressionar: fecharFeedback }}
            />

            <SimpleModal
                visivel={modal === 'sucesso'}
                aoFechar={fecharFeedback}
                icone={EnvelopeIcon}
                titulo="E-mail enviado"
                mensagem={`Enviamos um pedido de autorização para o e-mail informado. Assim que o responsável confirmar, a Rede de Apoio será liberada.\nSolicitado: ${email}`}
                acaoPrincipal={{ texto: 'OK', aoPressionar: fecharFeedback }}
            />

            <SimpleModal
                erroInterno
                visivel={modal === 'erro'}
                aoFechar={fecharFeedback}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={consentimento.erroEnvio ?? ''}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    aoPressionar: salvar,
                    carregando: consentimento.enviando
                }}
                acaoSecundaria={{ texto: 'Voltar', aoPressionar: fecharFeedback }}
            />
        </>
    );
}

export { ParentalConsentScreen, normalizarEmail };
