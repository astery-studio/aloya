import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

const orientacoes = {
    plataforma: 'Abra o Aloya em um celular Android ou iOS para testar.',
    permissao: 'As notificações estão desativadas para o Aloya.',
    canal: 'Este canal está desativado nas configurações do aparelho.',
    erro: 'Não consegui mostrar a prévia. Confira se está usando uma build do Aloya no celular.'
};

export function NotificationPreviewFeedback({ estado, textoSecundario, typography, cores }) {
    return (
        <View style={estilos.grupo}>
            <Text
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
                style={textoSecundario}
            >
                {estado.resultado === 'solicitada'
                    ? `Prévia solicitada: ${estado.rotulo}. Confira o banner ou a barra de notificações.`
                    : orientacoes[estado.resultado]}
            </Text>
            {['permissao', 'canal'].includes(estado.resultado) && (
                <Pressable
                    accessibilityRole="button"
                    style={estilos.link}
                    onPress={() => {
                        void Linking.openSettings().catch(() => {});
                    }}
                >
                    <Text style={[typography.bodyDefault, { color: cores.interface.destaque }]}>
                        Abrir ajustes do aparelho
                    </Text>
                </Pressable>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    grupo: { gap: 8 },
    link: { minHeight: 44, justifyContent: 'center' }
});
