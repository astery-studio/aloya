import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { EnvelopeIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { useParentalConsent } from '../hooks/useParentalConsent';
import { MembersScreen } from './MembersScreen';
import { ParentalConsentRestrictedScreen } from './ParentalConsentRestrictedScreen/ParentalConsentRestrictedScreen';
import { ReceivedContactsScreen } from './ReceivedContactsScreen/ReceivedContactsScreen';
import { criarEstilos } from './SupportNetworkScreen.styles';

function SupportNetworkScreen({
    parentalConsentService,
    receivedContactsService,
    onGerenciarResponsavel,
    onSelecionarAba,
    onSessaoExpirada,
    ...membersProps
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const consentimento = useParentalConsent({
        service: parentalConsentService,
        onSessaoExpirada
    });
    const [emailVisivel, setEmailVisivel] = useState(false);
    const [reenvioConfirmado, setReenvioConfirmado] = useState(false);
    const [modoRede, setModoRede] = useState('apoio');

    async function reenviarEmail() {
        const enviado = await consentimento.reenviar();

        if (!enviado) return;

        setEmailVisivel(false);
        setReenvioConfirmado(true);
    }

    function fecharConfirmacaoReenvio() {
        setReenvioConfirmado(false);
        consentimento.limparFeedback();
    }

    if (consentimento.carregando && !consentimento.status) {
        return (
            <MainLayout titulo="Rede de Apoio" abaAtiva="membros" onSelecionarAba={onSelecionarAba}>
                <View
                    accessibilityLabel="Verificando autorização da Rede de Apoio"
                    style={estilos.estado}
                >
                    <ActivityIndicator color={tema.cores.interface.destaque} size="large" />
                    <Text style={estilos.textoEstado}>Verificando autorização...</Text>
                </View>
            </MainLayout>
        );
    }

    if (consentimento.erro && !consentimento.status) {
        return (
            <MainLayout titulo="Rede de Apoio" abaAtiva="membros" onSelecionarAba={onSelecionarAba}>
                <View style={estilos.estado}>
                    <Text style={estilos.textoEstado}>{consentimento.erro}</Text>
                    <ButtonScreen
                        texto="Tentar novamente"
                        variante="preto"
                        aoPressionar={consentimento.atualizarStatus}
                    />
                </View>
            </MainLayout>
        );
    }

    if (consentimento.status?.acessoLiberado) {
        if (modoRede === 'acompanhados') {
            return (
                <ReceivedContactsScreen
                    service={receivedContactsService}
                    exibirSeletor
                    modoRede={modoRede}
                    onSelecionarModoRede={setModoRede}
                    onSelecionarAba={onSelecionarAba}
                    onSessaoExpirada={onSessaoExpirada}
                />
            );
        }

        return (
            <MembersScreen
                {...membersProps}
                modoRede={modoRede}
                onSelecionarModoRede={setModoRede}
                onSelecionarAba={onSelecionarAba}
                onSessaoExpirada={onSessaoExpirada}
            />
        );
    }

    const email = consentimento.status?.emailResponsavelLegal ?? '';

    return (
        <>
            <ParentalConsentRestrictedScreen
                emailResponsavelInformado={consentimento.status?.emailResponsavelInformado}
                carregando={consentimento.atualizando || consentimento.enviando}
                aoGerenciarEmail={onGerenciarResponsavel}
                aoVisualizarEmail={() => setEmailVisivel(true)}
                aoSelecionarAba={onSelecionarAba}
            />

            <SimpleModal
                visivel={emailVisivel}
                aoFechar={() => setEmailVisivel(false)}
                icone={EnvelopeIcon}
                corIcone="#C85A44"
                fundoIcone="#F7EDE5"
                titulo="E-mail enviado"
                mensagem={
                    <>
                        Enviamos um pedido de autorização para o e-mail informado. Assim que o
                        responsável confirmar, a Rede de Apoio será liberada.{`\n`}
                        <Text style={estilos.destaque}>Solicitado:</Text> {email}
                    </>
                }
                acaoPrincipal={{
                    texto: 'Entendi',
                    aoPressionar: () => setEmailVisivel(false),
                    desativado: consentimento.enviando
                }}
                acaoSecundaria={{
                    texto: 'Enviar Novamente',
                    aoPressionar: reenviarEmail,
                    carregando: consentimento.enviando,
                    desativado: consentimento.enviando
                }}
            />

            <SimpleModal
                visivel={reenvioConfirmado}
                aoFechar={fecharConfirmacaoReenvio}
                icone={EnvelopeIcon}
                corIcone="#C85A44"
                fundoIcone="#F7EDE5"
                titulo="E-mail enviado"
                mensagem={
                    <>
                        Enviamos um pedido de autorização para o e-mail informado. Assim que o
                        responsável confirmar, a Rede de Apoio será liberada.{`\n`}
                        <Text style={estilos.destaque}>Solicitado:</Text> {email}
                    </>
                }
                acaoPrincipal={{
                    texto: 'OK',
                    aoPressionar: fecharConfirmacaoReenvio
                }}
            />

            <SimpleModal
                erroInterno
                visivel={Boolean(consentimento.erroEnvio)}
                aoFechar={consentimento.limparFeedback}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={consentimento.erroEnvio ?? ''}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    aoPressionar: reenviarEmail,
                    carregando: consentimento.enviando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    aoPressionar: consentimento.limparFeedback,
                    desativado: consentimento.enviando
                }}
            />
        </>
    );
}

export { SupportNetworkScreen };
