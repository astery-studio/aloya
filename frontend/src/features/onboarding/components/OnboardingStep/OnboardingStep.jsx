/**
 * Estrutura compartilhada das etapas com navegação, progresso e ação principal.
 */
import { Pressable, Text, View } from 'react-native';
import Button from '../../../../shared/components/common/Button/ButtonBase/Button';
import { ArrowLeftIcon as ArrowLeft } from '../../../../shared/components/icons/AppIcons';
import FormLayout from '../../../../shared/layouts/FormLayout/FormLayout';
import { cores } from '../../../../shared/theme';
import OnboardingProgress from '../OnboardingProgress/OnboardingProgress';
import { estilos } from './OnboardingStep.styles';

export default function OnboardingStep({
    etapa, titulo, descricao, children, aoVoltar, aoPular,
    aoAvancar, podeAvancar = true, carregando = false, erro,
    acaoSecundaria, cabecalhoFixo = false
}) {
    const textos = <View testID={cabecalhoFixo
        ? 'onboarding-step-fixed-texts'
        : 'onboarding-step-texts'}
        style={[estilos.textos, cabecalhoFixo && estilos.textosFixos]}>
        <Text style={estilos.titulo}>{titulo}</Text>
        <Text style={estilos.descricao}>{descricao}</Text>
    </View>;

    const cabecalho = <>
        <View style={estilos.navegacao}>
            <Pressable accessibilityLabel="Voltar" onPress={aoVoltar} hitSlop={12}
                disabled={carregando} accessibilityState={{ disabled: carregando }}>
                <ArrowLeft size={24} color={cores.neutras.textoSecundarioClaro} />
            </Pressable>
            {aoPular ? <Pressable onPress={aoPular} disabled={carregando}
                accessibilityState={{ disabled: carregando }}>
                <Text style={estilos.pular}>Pular</Text>
            </Pressable> : null}
        </View>
        <OnboardingProgress etapaAtual={etapa} />
        {cabecalhoFixo ? textos : null}
    </>;

    return (
        <FormLayout cabecalho={cabecalho} centralizado acoes={
            <View style={estilos.acoes}>
                {acaoSecundaria ? <Button texto={acaoSecundaria.texto}
                    aoPressionar={acaoSecundaria.aoPressionar}
                    variante="bordaLaranja"
                    desativado={carregando || acaoSecundaria.desativada} /> : null}
                <Button texto="Avançar" aoPressionar={aoAvancar}
                    desativado={!podeAvancar} carregando={carregando} />
            </View>
        }>
            <View style={estilos.conteudo}>
                {!cabecalhoFixo ? textos : null}
                <View style={estilos.campo}>
                    {children}
                    {erro ? <Text accessibilityRole="alert" style={estilos.erro}>{erro}</Text> : null}
                </View>
            </View>
        </FormLayout>
    );
}
