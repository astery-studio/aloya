import { Pressable, Text, View } from 'react-native';
import {
    FlowerLotusIcon,
    HeartIcon,
    NotebookIcon
} from '../../../../shared/components/icons/AppIcons';

const CUIDADOS = Object.freeze([
    {
        id: 'respiracao',
        titulo: 'Um respiro para você',
        descricao: 'Faça uma pausa com uma respiração guiada.',
        Icone: FlowerLotusIcon
    },
    {
        id: 'reflexao',
        titulo: 'Uma pergunta para hoje',
        descricao: 'Registre no Diário como este momento tem sido.',
        Icone: HeartIcon
    },
    {
        id: 'educacao',
        titulo: 'O que acontece agora?',
        descricao: 'Entenda as mudanças comuns desta fase.',
        Icone: NotebookIcon
    }
]);

function CycleCareSection({ fase, aoAbrirRespiracao, aoAbrirReflexao, aoAbrirEducacao }) {
    const callbacks = {
        respiracao: aoAbrirRespiracao,
        reflexao: aoAbrirReflexao,
        educacao: aoAbrirEducacao
    };
    return (
        <View style={{ padding: 16, gap: 12 }}>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 20 }}>
                Cuidados para hoje
            </Text>
            {CUIDADOS.map(({ id, titulo, descricao, Icone }) => (
                <Pressable
                    key={id}
                    accessibilityLabel={`${titulo}. ${descricao} Abrir para a fase ${fase}.`}
                    accessibilityRole="button"
                    onPress={callbacks[id]}
                    style={{ minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                    <Icone size={24} />
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: 'DMSans_600SemiBold' }}>{titulo}</Text>
                        <Text>{descricao}</Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

export { CUIDADOS, CycleCareSection };
