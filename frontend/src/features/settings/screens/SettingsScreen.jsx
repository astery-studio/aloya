// Mostra o menu principal de configurações e encaminha a pessoa usuária para cada opção.
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
    ArrowsClockwiseIcon,
    BellIcon,
    HouseIcon,
    InfoIcon,
    NotebookIcon,
    ShieldCheckIcon,
    UserIcon,
    WarningCircleIcon
} from '../../../shared/components/icons/AppIcons';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { ThemePreferenceField } from '../components/ThemePreferenceField';
import { ThemePreferenceSheet } from '../components/ThemePreferenceSheet';
import { useThemePreferenceContext } from '../providers/ThemePreferenceProvider';
import { criarEstilos } from './SettingsScreen.style';

function SettingsScreen({
    onAbrirPerfil,
    onAbrirParametrosCiclo,
    onAbrirCategoriasDiario,
    onAbrirTelaInicial,
    onAbrirNotificacoes,
    onAbrirSobre,
    onAbrirPoliticasPrivacidade,
    onSelecionarAba
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const [seletorTemaAberto, definirSeletorTemaAberto] = useState(false);

    const { preferencia, salvando, erro, alterarPreferencia, limparErro } =
        useThemePreferenceContext();

    function abrirSeletorTema() {
        if (!salvando) {
            definirSeletorTemaAberto(true);
        }
    }

    function fecharSeletorTema() {
        if (!salvando) {
            definirSeletorTemaAberto(false);
        }
    }

    return (
        <>
            <MainLayout
                titulo="Configurações"
                corFundo={tema.escuro ? '#121212' : undefined}
                abaAtiva="configuracoes"
                onSelecionarAba={onSelecionarAba}
            >
                <ScrollView
                    testID="rolagem-settings-screen"
                    contentContainerStyle={estilos.conteudo}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Minha Conta</Text>

                        <NavigationField
                            label="Configurações de Perfil"
                            coresIcone={
                                tema.escuro
                                    ? { icone: '#A5D6A7', caixa: 'rgba(165, 214, 167, 0.16)' }
                                    : undefined
                            }
                            estilo={estilos.campoComBorda}
                            icone={UserIcon}
                            paleta="corVerde"
                            onPress={onAbrirPerfil}
                        />
                    </View>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Meu Ciclo</Text>

                        <NavigationField
                            label="Parâmetros do Ciclo"
                            coresIcone={
                                tema.escuro
                                    ? { icone: '#C85A44', caixa: 'rgba(255, 171, 145, 0.16)' }
                                    : undefined
                            }
                            estilo={estilos.campoComBorda}
                            icone={ArrowsClockwiseIcon}
                            paleta="corLaranja"
                            onPress={onAbrirParametrosCiclo}
                        />

                        <NavigationField
                            label="Categorias do Diário"
                            coresIcone={
                                tema.escuro
                                    ? { icone: '#A5D6A7', caixa: 'rgba(165, 214, 167, 0.16)' }
                                    : undefined
                            }
                            estilo={estilos.campoComBorda}
                            icone={NotebookIcon}
                            paleta="corVerde"
                            onPress={onAbrirCategoriasDiario}
                        />
                    </View>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Preferências</Text>

                        <View style={estilos.grupo}>
                            <ThemePreferenceField
                                preferencia={preferencia}
                                salvando={salvando}
                                onPress={abrirSeletorTema}
                            />

                            <Separador estilos={estilos} />

                            <NavigationField
                                label="Tela inicial"
                                coresIcone={
                                    tema.escuro
                                        ? { icone: '#A5D6A7', caixa: 'rgba(165, 214, 167, 0.16)' }
                                        : undefined
                                }
                                estilo={estilos.campo}
                                icone={HouseIcon}
                                variante="semBorda"
                                paleta="corVerde"
                                onPress={onAbrirTelaInicial}
                            />

                            <Separador estilos={estilos} />

                            <NavigationField
                                label="Notificações"
                                coresIcone={
                                    tema.escuro
                                        ? { icone: '#C85A44', caixa: 'rgba(255, 171, 145, 0.16)' }
                                        : undefined
                                }
                                estilo={estilos.campo}
                                icone={BellIcon}
                                variante="semBorda"
                                paleta="corLaranja"
                                onPress={onAbrirNotificacoes}
                            />
                        </View>
                    </View>

                    <View style={estilos.secao}>
                        <Text style={estilos.tituloSecao}>Privacidade e Sobre</Text>

                        <View style={estilos.grupo}>
                            <NavigationField
                                label="Sobre a aplicação"
                                coresIcone={
                                    tema.escuro
                                        ? { icone: '#B39DDB', caixa: 'rgba(179, 157, 219, 0.16)' }
                                        : undefined
                                }
                                estilo={estilos.campo}
                                icone={InfoIcon}
                                variante="semBorda"
                                paleta="corAzul"
                                onPress={onAbrirSobre}
                            />

                            <Separador estilos={estilos} />

                            <NavigationField
                                label="Políticas de Privacidade"
                                coresIcone={
                                    tema.escuro
                                        ? { icone: '#A5D6A7', caixa: 'rgba(165, 214, 167, 0.16)' }
                                        : undefined
                                }
                                estilo={estilos.campo}
                                icone={ShieldCheckIcon}
                                variante="semBorda"
                                paleta="corVerde"
                                onPress={onAbrirPoliticasPrivacidade}
                            />
                        </View>
                    </View>
                </ScrollView>
            </MainLayout>

            <ThemePreferenceSheet
                visivel={seletorTemaAberto}
                preferencia={preferencia}
                salvando={salvando}
                aoSelecionar={alterarPreferencia}
                aoFechar={fecharSeletorTema}
            />

            <SimpleModal
                erroInterno
                visivel={Boolean(erro)}
                aoFechar={limparErro}
                icone={WarningCircleIcon}
                corIcone={tema.cores.interface.textoSecundario}
                fundoIcone={tema.cores.interface.separador}
                titulo="Não foi possível alterar a aparência"
                mensagem={erro || ''}
                acaoPrincipal={{
                    texto: 'OK',
                    aoPressionar: limparErro
                }}
            />
        </>
    );
}

function Separador({ estilos }) {
    return <View style={estilos.separador} />;
}

export { SettingsScreen };
