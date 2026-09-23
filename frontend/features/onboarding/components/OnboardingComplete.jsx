/**
 * Tela final do cadastro que confirma conclusão e inicia o uso do aplicativo.
 */
import { Text, View } from 'react-native';
import Button from '../../../components/common/Button/Button';
import FormLayout from '../../../layouts/FormLayout';
import { estilos } from './OnboardingComplete.styles';

export default function OnboardingComplete({ aoIniciar, logo }) {
    return (
        <FormLayout centralizado acoes={
            <Button texto="Iniciar" variante="verde" aoPressionar={aoIniciar} />
        }>
            <View style={estilos.conteudo}>
                <Text style={estilos.titulo}>
                    Esperamos que sua experiência com{' '}
                    <Text style={estilos.marca}>ALOYA</Text>{' '}seja incrível!
                </Text>
                <View style={estilos.logo}>{logo}</View>
            </View>
        </FormLayout>
    );
}
