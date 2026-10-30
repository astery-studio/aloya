/**
 * Tela final do cadastro que confirma conclusão e inicia o uso do aplicativo.
 */
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Button from '../../../../shared/components/common/Button/Button';
import FormLayout from '../../../../shared/layouts/FormLayout/FormLayout';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './OnboardingComplete.styles';

export default function OnboardingComplete({ aoIniciar, logo }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    return (
        <FormLayout
            centralizado
            acoes={<Button texto="Iniciar" variante="verde" aoPressionar={aoIniciar} />}
        >
            <View style={estilos.conteudo}>
                <Text style={estilos.titulo}>
                    Esperamos que sua experiência com <Text style={estilos.marca}>ALOYA</Text> seja
                    incrível!
                </Text>
                <View style={estilos.logo}>{logo}</View>
            </View>
        </FormLayout>
    );
}
