import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DatePickerSheet } from '../../../../shared/components/feedback/DatePickerSheet/DatePickerSheet';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { deslocarDataDiario, obterHojeDiario } from '../../utils/diaryDate';
import {
    contarMacrocategoriasPreenchidas,
    listarMacrocategoriasAtivas,
    prepararFormularioDiario
} from '../../utils/diaryForm';
import { DiaryDateNavigator } from '../DiaryDateNavigator/DiaryDateNavigator';
import { DiaryMacrocategoryList } from '../DiaryMacrocategoryList/DiaryMacrocategoryList';
import { DiaryPhaseBadge } from '../DiaryPhaseBadge/DiaryPhaseBadge';
import { DiaryFormErrors } from './DiaryFormErrors';
import { criarEstilos } from './NewDiaryEntryModal.styles';
function NewDiaryEntryContent({
    catalogo,
    carregando,
    erroCatalogo,
    recarregar,
    formulario,
    fase,
    carregandoFase
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [seletorAberto, setSeletorAberto] = useState(false);

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
    const hoje = obterHojeDiario();
    const totalPreenchidas = contarMacrocategoriasPreenchidas(catalogo, formulario.valores);
    const preparacao = prepararFormularioDiario({
        catalogo,
        valores: formulario.valores,
        data: formulario.data,
        hoje
    });
    const salvarDesativado = formulario.salvando || !preparacao.valido;
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
                    proximoDisponivel={formulario.data < hoje}
                    desabilitado={formulario.salvando}
                    aoAbrirSeletor={() => setSeletorAberto(true)}
                />
                <DiaryPhaseBadge fase={fase} carregando={carregandoFase} />
                <View style={estilos.cartaoRegistro}>
                    <Text style={estilos.tituloCartao}>Registro no Diário</Text>
                    <View style={estilos.contador}>
                        <Text style={estilos.textoContador}>
                            {totalPreenchidas} / {macrocategorias.length} marcados
                        </Text>
                    </View>
                    <Text style={estilos.instrucao}>
                        Selecione pelo menos uma opção para salvar no diário.
                    </Text>
                    <View style={estilos.listaMacros}>
                        <DiaryMacrocategoryList
                            macrocategorias={macrocategorias}
                            valores={formulario.valores}
                            erros={formulario.erros}
                            aoAlterar={formulario.alterarValor}
                            desabilitado={formulario.salvando}
                        />
                    </View>
                    <DiaryFormErrors erros={formulario.erros} estilos={estilos} />
                </View>
            </ScrollView>
            <View style={estilos.rodape}>
                <ButtonScreen
                    texto="Salvar"
                    aoPressionar={formulario.salvar}
                    carregando={formulario.salvando}
                    desativado={salvarDesativado}
                    estilo={[estilos.botaoSalvar, salvarDesativado && estilos.botaoSalvarDesativado]}
                    estiloTexto={
                        salvarDesativado ? estilos.textoBotaoDesativado : estilos.textoBotaoSalvar
                    }
                />
            </View>
            <DatePickerSheet
                visivel={seletorAberto}
                titulo="Data do registro"
                valorSelecionado={formulario.data}
                dataMaxima={hoje}
                onSelecionar={(data) => {
                    formulario.setData(data);
                    return true;
                }}
                onFechar={() => setSeletorAberto(false)}
            />
        </>
    );
}

export { NewDiaryEntryContent };
