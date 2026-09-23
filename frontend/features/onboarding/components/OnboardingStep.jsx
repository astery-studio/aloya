/**
 * Estrutura compartilhada das etapas com navegação, progresso e ação principal.
 */
import { Pressable, Text, View } from 'react-native';
import { ArrowLeftIcon as ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import Button from '../../../components/common/Button/Button';
import FormLayout from '../../../layouts/FormLayout';
import { cores } from '../../../theme';
import OnboardingProgress from './OnboardingProgress';
import { estilos } from './OnboardingStep.styles';

export default function OnboardingStep({
    etapa, titulo, descricao, children, aoVoltar, aoPular,
    aoAvancar, podeAvancar = true, carregando = false
}) {
    const cabecalho = <>
        <View style={estilos.navegacao}>
            <Pressable accessibilityLabel="Voltar" onPress={aoVoltar} hitSlop={12}>
                <ArrowLeft size={24} color={cores.neutras.textoSecundarioClaro} />
            </Pressable>
            {aoPular ? <Pressable onPress={aoPular}><Text style={estilos.pular}>Pular</Text></Pressable> : null}
        </View>
        <OnboardingProgress etapaAtual={etapa} />
    </>;

    return (
        <FormLayout cabecalho={cabecalho} centralizado acoes={
            <Button texto="Avançar" aoPressionar={aoAvancar}
                desativado={!podeAvancar} carregando={carregando} />
        }>
            <View style={estilos.conteudo}>
                <View style={estilos.textos}>
                    <Text style={estilos.titulo}>{titulo}</Text>
                    <Text style={estilos.descricao}>{descricao}</Text>
                </View>
                <View style={estilos.campo}>{children}</View>
            </View>
        </FormLayout>
    );
}
