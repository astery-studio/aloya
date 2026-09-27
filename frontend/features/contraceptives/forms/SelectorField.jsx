import { Pressable, Text, View } from 'react-native';
import { CaretDown, CaretRight } from 'phosphor-react-native';
import FormField from '../../../components/forms/FormField';
import { estilos } from './contraceptiveForms.styles';

function SelectorField({ label, valor, placeholder, onPress, navegar = false, icone: Icone, corIcone = '#C85A44', fundoIcone = '#FDF0EC' }) {
    const Seta = navegar ? CaretRight : CaretDown;
    return (
        <FormField label={label} campo={(
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${valor || placeholder}`}
                onPress={onPress}
                style={({ pressed }) => [estilos.campoSeletor, pressed && estilos.pressionado]}
            >
                {Icone ? <View style={[estilos.caixaIconeCampo, { backgroundColor: fundoIcone }]}><Icone size={20} color={corIcone} /></View> : null}
                <Text style={[estilos.valorSeletor, !valor && estilos.placeholder]} numberOfLines={2}>{valor || placeholder}</Text>
                <Seta size={20} color="#5C5C59" />
            </Pressable>
        )} />
    );
}

export { SelectorField };
