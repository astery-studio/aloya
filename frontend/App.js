import { Alert, ScrollView, Text } from 'react-native'
import { Header } from './components/navigation/Header/Header'

function testarVoltar() {
    Alert.alert('Teste', 'O botão Voltar funcionou.')
}

export default function App() {
    return (
        <ScrollView>
            <Text>1. Variante padrão</Text>
            <Header
                titulo="Configurações"
                variante="padrao"
            />

            <Text>2. Variante com voltar</Text>
            <Header
                titulo="Meu perfil"
                variante="comVoltar"
                onVoltar={testarVoltar}
            />

            <Text>3. Título longo em tela estreita</Text>
            <Header
                titulo="Configurações e informações da conta"
                variante="comVoltar"
                onVoltar={testarVoltar}
            />

            <Text>4. Sem ação de voltar</Text>
            <Header
                titulo="Minha conta"
                variante="comVoltar"
            />
        </ScrollView>
    )
}