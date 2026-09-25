//Mostra o menu principal de configurações e encaminha a pessoa usuária para cada opção.
import {ScrollView, Switch, Text, View} from 'react-native'

import {ArrowsClockwiseIcon, BellIcon, HouseIcon, InfoIcon, MoonIcon, ShieldCheckIcon, UserIcon} from '../../components/icons/AppIcons'
import {NavigationField} from '../../components/common/NavigationField/NavigationField'
import {MainLayout} from '../../layouts/MainLayout/MainLayout'
import {tema} from '../../theme'
import {coresSwitch, estilos} from './SettingsScreen.style'

//Cria uma divisão visual entre opções que pertencem ao mesmo grupo.
function Separador() {
    return <View style={estilos.separador} />
}

//Mostra a opção controlada de modo noturno e avisa o componente pai quando ela for alterada.
function OpcaoModoNoturno({ativo, onAlterar}) {
    const desabilitado = typeof onAlterar !== 'function'

    return (
        <View style={[estilos.linhaSwitch, desabilitado && estilos.desabilitado]}>
            <View style={estilos.caixaIconeModoNoturno}>
                <MoonIcon size={24} color={tema.cores.icones.configuracoes.azul.icone} weight="regular" />
            </View>

            <Text style={estilos.label}>Modo noturno</Text>

            <Switch
                value={Boolean(ativo)}
                onValueChange={onAlterar}
                disabled={desabilitado}
                accessibilityLabel="Modo noturno"
                accessibilityHint="Ativa ou desativa o modo noturno"
                accessibilityState={{checked: Boolean(ativo), disabled: desabilitado}}
                trackColor={{false: coresSwitch.trilhaInativa, true: coresSwitch.trilhaAtiva}}
                thumbColor={coresSwitch.botao}
                ios_backgroundColor={coresSwitch.trilhaInativa}
            />
        </View>
    )
}

//Recebe as ações de navegação, exibe o menu e não guarda regras de negócio ou dados pessoais.
function SettingsScreen({
    onAbrirPerfil,
    onAbrirParametrosCiclo,
    modoNoturnoAtivo = false,
    onAlterarModoNoturno,
    onAbrirTelaInicial,
    onAbrirNotificacoes,
    onAbrirSobre,
    onAbrirPoliticasPrivacidade,
    onSelecionarAba
}) {
    return (
        <MainLayout titulo="Configurações" abaAtiva="configuracoes" onSelecionarAba={onSelecionarAba}>
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
                        icone={UserIcon}
                        paleta="corVerde"
                        onPress={onAbrirPerfil}
                    />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Meu Ciclo</Text>

                    <NavigationField
                        label="Parâmetros do Ciclo"
                        icone={ArrowsClockwiseIcon}
                        paleta="corLaranja"
                        onPress={onAbrirParametrosCiclo}
                    />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Preferências</Text>

                    <View style={estilos.grupo}>
                        <OpcaoModoNoturno ativo={modoNoturnoAtivo} onAlterar={onAlterarModoNoturno} />

                        <Separador />

                        <NavigationField
                            label="Tela inicial"
                            icone={HouseIcon}
                            variante="semBorda"
                            paleta="corVerde"
                            onPress={onAbrirTelaInicial}
                        />

                        <Separador />

                        <NavigationField
                            label="Notificações"
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
                            icone={InfoIcon}
                            variante="semBorda"
                            paleta="corAzul"
                            onPress={onAbrirSobre}
                        />

                        <Separador />

                        <NavigationField
                            label="Políticas de Privacidade"
                            icone={ShieldCheckIcon}
                            variante="semBorda"
                            paleta="corVerde"
                            onPress={onAbrirPoliticasPrivacidade}
                        />
                    </View>
                </View>
            </ScrollView>
        </MainLayout>
    )
}

export {SettingsScreen}