import { Text, View } from 'react-native';
import { PhaseSymbolSlot } from '../PhaseSymbolSlot';
import { estilos } from './NoCycleHero.styles';

const MENSAGENS = Object.freeze({
    primeiroUso: [
        'Seu ciclo, sua descoberta.',
        'Cada corpo tem seu próprio ritmo. Comece registrando sua menstruação para acompanhar seu ciclo e conhecer melhor seus padrões ao longo do tempo.'
    ],
    dadosInsuficientes: [
        'Continue registrando seu ciclo',
        'Ainda precisamos de mais registros para criar previsões personalizadas.'
    ]
});

function NoCycleHero({ motivoSemPrevisao }) {
    const mensagem = MENSAGENS[motivoSemPrevisao] ?? MENSAGENS.primeiroUso;
    return (
        <View style={estilos.container}>
            <PhaseSymbolSlot style={estilos.simbolo} />
            <Text accessibilityRole="header" style={estilos.titulo}>
                {mensagem[0]}
            </Text>
            <Text style={estilos.descricao}>{mensagem[1]}</Text>
        </View>
    );
}

export { NoCycleHero };
