//Oferece acesso provisório ao calendário enquanto a Home definitiva não está disponível.
import {Text, View} from 'react-native'

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen'
import {MainLayout} from '../../../shared/layouts/MainLayout/MainLayout'
import {estilos} from './CalendarTemporaryAccessScreen.styles'

function CalendarTemporaryAccessScreen({aoAbrirCalendario, onSelecionarAba}) {
    return (
        <MainLayout
            titulo="Diário"
            abaAtiva="diario"
            onSelecionarAba={onSelecionarAba}
        >
            <View style={estilos.conteudo}>
                <Text style={estilos.titulo}>Calendário do ciclo</Text>
                <Text style={estilos.descricao}>
                    Acesse temporariamente o calendário enquanto a tela inicial está em desenvolvimento.
                </Text>
                <ButtonScreen
                    texto="Abrir calendário"
                    aoPressionar={aoAbrirCalendario}
                />
            </View>
        </MainLayout>
    )
}

export {CalendarTemporaryAccessScreen}
export default CalendarTemporaryAccessScreen
