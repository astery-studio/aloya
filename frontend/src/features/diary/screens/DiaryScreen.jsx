import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Plus } from 'phosphor-react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { formatarDataDiario } from '../utils/diaryDate';
import { criarEstilos } from './DiaryScreen.styles';

function DiaryScreen({ aoCriar, ultimoRegistro, onSelecionarAba }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <MainLayout titulo="Diário" abaAtiva="diario" onSelecionarAba={onSelecionarAba}>
            <View style={estilos.conteudo}>
                <View style={estilos.apresentacao}>
                    <Text accessibilityRole="header" style={estilos.titulo}>
                        Como você está hoje?
                    </Text>
                    <Text style={estilos.descricao}>
                        Registre sintomas, emoções, sono, temperatura basal e suas anotações.
                    </Text>
                </View>
                <ButtonScreen
                    texto="Criar registro"
                    icone={Plus}
                    aoPressionar={aoCriar}
                    estilo={estilos.acao}
                />
                {ultimoRegistro ? (
                    <Text accessibilityRole="status" style={estilos.confirmacao}>
                        Registro de {formatarDataDiario(ultimoRegistro.data)} salvo com sucesso.
                    </Text>
                ) : null}
            </View>
        </MainLayout>
    );
}

export { DiaryScreen };
