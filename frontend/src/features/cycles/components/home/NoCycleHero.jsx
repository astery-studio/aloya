import { Text, View } from 'react-native';
import { PhaseSymbolSlot } from '../PhaseSymbolSlot';

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
        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
            <PhaseSymbolSlot />
            <Text accessibilityRole="header" style={{ fontSize: 28, textAlign: 'center' }}>
                {mensagem[0]}
            </Text>
            <Text style={{ marginTop: 14, textAlign: 'center' }}>{mensagem[1]}</Text>
        </View>
    );
}

export { NoCycleHero };
