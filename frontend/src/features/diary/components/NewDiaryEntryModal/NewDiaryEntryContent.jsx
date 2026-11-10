import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { deslocarDataDiario, obterHojeDiario } from '../../utils/diaryDate';
import { listarMacrocategoriasAtivas } from '../../utils/diaryForm';
import { DiaryDateNavigator } from '../DiaryDateNavigator/DiaryDateNavigator';
import { DiaryMacrocategoryList } from '../DiaryMacrocategoryList/DiaryMacrocategoryList';
import { DiaryFormErrors } from './DiaryFormErrors';
import { criarEstilos } from './NewDiaryEntryModal.styles';
function NewDiaryEntryContent({ catalogo, carregando, erroCatalogo, recarregar, formulario }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    if (carregando) {
        return (
            <View accessibilityRole="progressbar" style={estilos.carregamento}>
                <ActivityIndicator size="large" color={tema.cores.marca.primaria} />
                <Text style={estilos.mensagem}>Carregando suas categorias...</Text>
            </View>
        );
    }

    if (erroCatalogo || !catalogo) {
        return (
            <View style={estilos.carregamento}>
                <Text accessibilityRole="alert" style={estilos.mensagem}>
                    {erroCatalogo}
                </Text>
                <ButtonScreen texto="Tentar novamente" aoPressionar={recarregar} />
            </View>
        );
    }

    const macrocategorias = listarMacrocategoriasAtivas(catalogo);
    return (
        <>
            <ScrollView
                style={estilos.rolagem}
                contentContainerStyle={estilos.conteudo}
                keyboardShouldPersistTaps="handled"
            >
                <DiaryDateNavigator
                    data={formulario.data}
                    aoAnterior={() => formulario.setData(deslocarDataDiario(formulario.data, -1))}
                    aoProximo={() => formulario.setData(deslocarDataDiario(formulario.data, 1))}
                    proximoDisponivel={formulario.data < obterHojeDiario()}
                    desabilitado={formulario.salvando}
                />
                <DiaryMacrocategoryList
                    macrocategorias={macrocategorias}
                    valores={formulario.valores}
                    erros={formulario.erros}
                    aoAlterar={formulario.alterarValor}
                    desabilitado={formulario.salvando}
                />
                <DiaryFormErrors erros={formulario.erros} estilos={estilos} />
            </ScrollView>
            <View style={estilos.rodape}>
                <ButtonScreen
                    texto="Salvar registro"
                    aoPressionar={formulario.salvar}
                    carregando={formulario.salvando}
                    desativado={formulario.salvando}
                />
            </View>
        </>
    );
}

export { NewDiaryEntryContent };
