import { useMemo, useRef, useState } from 'react';
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
import { criarEstilos } from './DiaryEntrySheet.styles';

function DiaryEntryFormContent({
    catalogo,
    carregando,
    erroCatalogo,
    recarregar,
    formulario,
    fase,
    carregandoFase,
    bloquearSalvarSemAlteracoes = false,
    tituloRef,
    onPosicaoRolagem,
    onDeslizarParaFechar
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [seletorAberto, setSeletorAberto] = useState(false);
    const posicaoRolagem = useRef(0);
    const toqueInicialY = useRef(null);
    const distanciaDeslize = useRef(0);

    function iniciarToque(evento) {
        distanciaDeslize.current = 0;
        toqueInicialY.current =
            typeof onDeslizarParaFechar === 'function' && posicaoRolagem.current <= 8
                ? evento.nativeEvent.pageY
                : null;
    }

    function moverToque(evento) {
        if (!Number.isFinite(toqueInicialY.current)) return;
        distanciaDeslize.current = Math.max(0, evento.nativeEvent.pageY - toqueInicialY.current);
    }

    function terminarToque() {
        const deveFechar = distanciaDeslize.current >= 48;
        toqueInicialY.current = null;
        distanciaDeslize.current = 0;
        if (deveFechar) onDeslizarParaFechar?.();
    }

    function cancelarToque() {
        toqueInicialY.current = null;
        distanciaDeslize.current = 0;
    }

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
    const salvarDesativado =
        formulario.salvando || !preparacao.valido || bloquearSalvarSemAlteracoes;
    return (
        <>
            <DiaryDateNavigator
                data={formulario.data}
                aoAnterior={() =>
                    formulario.setData((atual) => deslocarDataDiario(atual, -1) ?? atual)
                }
                aoProximo={() =>
                    formulario.setData((atual) => deslocarDataDiario(atual, 1) ?? atual)
                }
                proximoDisponivel={formulario.data < hoje}
                desabilitado={formulario.salvando}
                aoAbrirSeletor={() => setSeletorAberto(true)}
            />
            <DiaryPhaseBadge fase={fase} carregando={carregandoFase} />
            <ScrollView
                testID="rolagem-registro-diario"
                style={estilos.rolagem}
                contentContainerStyle={estilos.conteudo}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="never"
                onScroll={(evento) => {
                    const posicao = Math.max(0, evento.nativeEvent.contentOffset.y);
                    posicaoRolagem.current = posicao;
                    onPosicaoRolagem?.(posicao);
                }}
                onTouchStart={iniciarToque}
                onTouchMove={moverToque}
                onTouchEnd={terminarToque}
                onTouchCancel={cancelarToque}
                scrollEventThrottle={16}
            >
                <View style={estilos.cartaoRegistro}>
                    <Text ref={tituloRef} accessibilityRole="header" style={estilos.tituloCartao}>
                        Registro no Diário
                    </Text>
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
                    estilo={[
                        estilos.botaoSalvar,
                        salvarDesativado && estilos.botaoSalvarDesativado
                    ]}
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

export { DiaryEntryFormContent };
