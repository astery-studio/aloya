import { View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';

function CycleQuickActions({ aoCadastrarMenstruacao, aoAbrirDiario, aoAbrirAnticoncepcional }) {
    return (
        <View style={{ paddingTop: 32, paddingHorizontal: 16, gap: 12 }}>
            <ButtonScreen
                texto="Cadastrar Menstruação"
                icone={DropIcon}
                aoPressionar={aoCadastrarMenstruacao}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <ButtonScreen
                    texto="Diário"
                    icone={NotepadIcon}
                    aoPressionar={aoAbrirDiario}
                    variante="verde"
                    estilo={{ flex: 1 }}
                />
                <ButtonScreen
                    texto="Anticoncepcional"
                    icone={PillIcon}
                    aoPressionar={aoAbrirAnticoncepcional}
                    variante="verde"
                    estilo={{ flex: 1 }}
                />
            </View>
        </View>
    );
}

export { CycleQuickActions };
