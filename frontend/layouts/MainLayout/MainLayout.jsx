//Organiza o cabeçalho, o conteúdo e a navegação inferior das telas internas.
import { View } from 'react-native'

import { Header } from '../../components/navigation/Header/Header'
import { BottomTabBar } from '../../components/navigation/BottomTab/BottomTabBar/BottomTabBar'
import { estilos } from './MainLayout.style'

function MainLayout({titulo, varianteHeader = 'padrao', onVoltar, abaAtiva, onSelecionarAba, children}) {
    return (
        <View
            testID="main-layout"
            style={estilos.container}
        >
            <Header
                titulo={titulo}
                variante={varianteHeader}
                onVoltar={onVoltar}
            />

            <View
                testID="conteudo-main-layout"
                style={estilos.conteudo}
            >
                {children}
            </View>

            <BottomTabBar
                abaAtiva={abaAtiva}
                onSelecionar={onSelecionarAba}
            />
        </View>
    )
}

export { MainLayout }