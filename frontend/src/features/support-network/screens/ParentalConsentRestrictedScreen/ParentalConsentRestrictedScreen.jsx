import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { ShieldWarningIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { criarEstilos } from './ParentalConsentRestrictedScreen.styles';

function ParentalConsentRestrictedScreen({
    emailResponsavelInformado = false,
    carregando = false,
    aoGerenciarEmail,
    aoVisualizarEmail,
    aoSelecionarAba
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <MainLayout titulo="Rede de Apoio" abaAtiva="membros" onSelecionarAba={aoSelecionarAba}>
            <ScrollView
                testID="parental-consent-restricted"
                style={estilos.rolagem}
                contentContainerStyle={estilos.container}
                showsVerticalScrollIndicator={false}
            >
                <View testID="parental-consent-card" style={estilos.cartao}>
                    <View style={estilos.cabecalhoCartao}>
                        <View style={estilos.caixaIcone}>
                            <ShieldWarningIcon size={25.993} color="#FFFFFF" weight="regular" />
                        </View>

                        <Text style={estilos.rotuloRestrito}>ACESSO RESTRITO</Text>
                    </View>

                    <View style={estilos.conteudoCartao}>
                        <View style={estilos.blocoTexto}>
                            <View style={estilos.containerTitulo}>
                                <Text accessibilityRole="header" style={estilos.tituloCartao}>
                                    Confirmação pendente
                                </Text>
                            </View>

                            <View style={estilos.containerMensagem}>
                                <Text style={estilos.mensagemCartao}>
                                    Aguardando confirmação de um responsável legal para liberar sua
                                    Rede de Apoio. Verifique se o e-mail de autorização foi enviado
                                    ao responsável.
                                </Text>
                            </View>
                        </View>

                        <ButtonScreen
                            texto={
                                emailResponsavelInformado ? 'Visualizar E-mail' : 'Enviar E-mail'
                            }
                            variante="verde"
                            aoPressionar={
                                emailResponsavelInformado ? aoVisualizarEmail : aoGerenciarEmail
                            }
                            desativado={carregando}
                            carregando={carregando}
                            estilo={estilos.botao}
                            estiloTexto={estilos.textoBotao}
                        />
                    </View>
                </View>

                {carregando ? (
                    <View accessibilityLabel="Atualizando autorização" style={estilos.atualizando}>
                        <ActivityIndicator size="small" color={tema.cores.interface.destaque} />
                    </View>
                ) : null}
            </ScrollView>
        </MainLayout>
    );
}

export { ParentalConsentRestrictedScreen };
