import { useEffect, useState } from 'react';
import { AccessibilityInfo, Linking, Platform, Pressable, Text, View } from 'react-native';
import { setStringAsync } from 'expo-clipboard';
import { CopySimpleIcon } from 'phosphor-react-native/src/icons/CopySimple';

import { EnvelopeSimpleIcon } from '../../../shared/components/icons/AppIcons';
import { EMAIL_SUPORTE } from '../data/legalConfig';

function LegalSupport({ estilos, corDestaque, somenteEndereco = false }) {
    const [mensagem, setMensagem] = useState(null);

    useEffect(() => {
        if (!mensagem?.temporaria) return;
        const timer = setTimeout(() => setMensagem(null), 1500);
        return () => clearTimeout(timer);
    }, [mensagem]);

    function informar(texto, temporaria = false) {
        setMensagem({ texto, temporaria });
        if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(texto);
    }

    async function abrirEmail() {
        setMensagem(null);
        try {
            await Linking.openURL(`mailto:${EMAIL_SUPORTE}`);
        } catch {
            informar('Não foi possível abrir o aplicativo de e-mail. Você pode copiar o endereço.');
        }
    }

    async function copiarEmail() {
        try {
            if (await setStringAsync(EMAIL_SUPORTE)) {
                informar('Endereço de e-mail copiado.', true);
                return;
            }
        } catch {
            // Algumas plataformas bloqueiam o acesso à área de transferência.
        }
        informar('Não foi possível copiar o endereço de e-mail.');
    }

    const endereco = (
        <Pressable
            accessibilityRole="link"
            accessibilityHint="Abre o aplicativo de e-mail"
            onPress={abrirEmail}
            style={({ pressed }) => [
                !somenteEndereco && estilos.flexivel,
                estilos.acao,
                pressed && estilos.pressionado
            ]}
        >
            <Text style={estilos.textoAcao}>{EMAIL_SUPORTE}</Text>
        </Pressable>
    );
    const aviso =
        mensagem && !mensagem.temporaria ? (
            <Text accessibilityLiveRegion="polite" style={estilos.meta}>
                {mensagem.texto}
            </Text>
        ) : null;

    if (somenteEndereco) {
        return (
            <View>
                <Text style={estilos.corpo}>Suporte do Aloya</Text>
                {endereco}
                {aviso}
            </View>
        );
    }

    return (
        <View style={estilos.suporte}>
            <View style={estilos.linha}>
                <EnvelopeSimpleIcon size={20} color={corDestaque} accessible={false} />
                <Text accessibilityRole="header" style={estilos.chamada}>
                    Precisa de ajuda?
                </Text>
            </View>
            <Text style={estilos.meta}>Entre em contato com o suporte do Aloya.</Text>
            <View style={estilos.linha}>
                {endereco}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Copiar endereço de e-mail"
                    onPress={copiarEmail}
                    style={({ pressed }) => [estilos.copiar, pressed && estilos.pressionado]}
                >
                    <CopySimpleIcon
                        size={20}
                        color={corDestaque}
                        weight="bold"
                        accessible={false}
                    />
                </Pressable>
            </View>
            {aviso}
            {mensagem?.temporaria && (
                <View pointerEvents="none" style={estilos.avisoCopia}>
                    <Text accessibilityLiveRegion="polite" style={estilos.textoAvisoCopia}>
                        {mensagem.texto}
                    </Text>
                </View>
            )}
        </View>
    );
}

export { LegalSupport };
