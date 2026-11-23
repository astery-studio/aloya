import { Text, View } from 'react-native';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DropIcon, NotepadIcon, PillIcon } from '../../../../shared/components/icons/AppIcons';
import { NoCycleHero } from './NoCycleHero';

function NoCycleStartSection({
    motivoSemPrevisao,
    aoCadastrarMenstruacao,
    aoAbrirDiario,
    aoAbrirAnticoncepcional
}) {
    return (
        <>
            <NoCycleHero motivoSemPrevisao={motivoSemPrevisao} />
            <View
                style={{
                    margin: 16,
                    padding: 18,
                    gap: 12,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24
                }}
            >
                <Text>PRIMEIRO PASSO</Text>
                <Text style={{ fontSize: 21 }}>Vamos começar?</Text>
                <Text>
                    Registre as datas da sua menstruação para começar a construir seu histórico.
                </Text>
                <ButtonScreen
                    texto="Cadastrar Menstruação"
                    icone={DropIcon}
                    aoPressionar={aoCadastrarMenstruacao}
                />
            </View>
            <View
                style={{
                    margin: 16,
                    padding: 18,
                    gap: 12,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 24
                }}
            >
                <Text>SEU ESPAÇO</Text>
                <Text style={{ fontSize: 21 }}>Comece por você!</Text>
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
        </>
    );
}

export { NoCycleStartSection };
