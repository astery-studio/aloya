import { useMemo, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { XCircleIcon } from 'phosphor-react-native';

import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import DurationInput from '../../../../shared/components/forms/DurationInput/DurationInput';
import NumberInput from '../../../../shared/components/forms/NumberInput/NumberInput';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { diaryGroupPresentation } from '../../config/diaryGroupPresentation';
import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { alternarOpcaoCategoria } from '../../utils/diaryFormValue';
import { agruparOpcoes } from '../../utils/diaryOptionGroups';
import { organizarOpcoesEmLinhas } from '../../utils/diaryOptionRows';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';
import { criarEstilos } from './DiaryCategoryField.styles';

function IconeOpcao(props) {
    return <DiaryOptionIcon {...props} />;
}

const ALTURA_MINIMA_ANOTACAO = 36;

function calcularAlturaAnotacao(alturaConteudo) {
    return Math.max(ALTURA_MINIMA_ANOTACAO, alturaConteudo + 12);
}

function DiaryCategoryField({ categoria, valor, aoAlterar, paleta = 'ciclo', desabilitado, erro }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const selecionadas = Array.isArray(valor) ? valor : [];
    const [alturaAnotacao, setAlturaAnotacao] = useState(ALTURA_MINIMA_ANOTACAO);
    let controle;

    function limparAnotacao() {
        setAlturaAnotacao(ALTURA_MINIMA_ANOTACAO);
        Keyboard.dismiss();
        aoAlterar?.('');
    }

    if (categoria.tipoValor === 'decimal_escalado') {
        controle = (
            <NumberInput
                valor={valor}
                aoAlterar={aoAlterar}
                unidade={categoria.unidade}
                casasDecimais={categoria.casasDecimais}
                valorMinimo={
                    categoria.valorMinimo === null ? undefined : Number(categoria.valorMinimo)
                }
                valorMaximo={
                    categoria.valorMaximo === null ? undefined : Number(categoria.valorMaximo)
                }
                desativado={desabilitado}
                permitirLimpar
                rotuloAcessibilidade={categoria.nome}
            />
        );
    } else if (categoria.tipoValor === 'duracao_minutos') {
        controle = (
            <DurationInput
                valorMinutos={valor}
                aoAlterar={aoAlterar}
                desabilitado={desabilitado}
                erro={erro}
            />
        );
    } else if (categoria.tipoValor === 'texto') {
        const limite = categoria.limiteCaracteres;
        controle = (
            <>
                <TextInput
                    value={valor ?? ''}
                    onChangeText={aoAlterar}
                    placeholder="Digite aqui sua nota..."
                    multiline
                    maxLength={limite}
                    desativado={desabilitado}
                    estilo={[
                        estilos.campoAnotacao,
                        { borderColor: cores.icone, height: alturaAnotacao }
                    ]}
                    estiloEntrada={[
                        estilos.entradaAnotacao,
                        {
                            color: cores.icone,
                            height: alturaAnotacao - 12,
                            textAlign: valor ? 'justify' : 'center'
                        }
                    ]}
                    scrollEnabled={false}
                    onContentSizeChange={({ nativeEvent }) =>
                        setAlturaAnotacao(calcularAlturaAnotacao(nativeEvent.contentSize.height))
                    }
                    acaoDireita={
                        valor ? (
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Limpar anotação livre"
                                disabled={desabilitado}
                                hitSlop={8}
                                onPress={limparAnotacao}
                                style={estilos.limparAnotacao}
                            >
                                <XCircleIcon size={18} color={tema.cores.marca.primaria} />
                            </Pressable>
                        ) : null
                    }
                />
                <Text style={[estilos.contador, { color: cores.icone }]}>
                    {[...(valor ?? '')].length} / {limite}
                </Text>
            </>
        );
    }

    function renderizarOpcao(opcao) {
        const apresentacao = obterApresentacaoOpcao(categoria.id, opcao);
        const selecionada = selecionadas.includes(opcao.id);
        return (
            <ButtonSelection
                key={opcao.id}
                variante="compacto"
                label={opcao.nome}
                icone={IconeOpcao}
                iconeProps={{
                    ...apresentacao.iconeProps,
                    iconeId: apresentacao.iconeId,
                    selecionado: selecionada,
                    ...(apresentacao.iconeProps.color && !selecionada
                        ? { color: apresentacao.iconeProps.color }
                        : {})
                }}
                selected={selecionada}
                desabilitado={desabilitado}
                cor={cores.icone}
                fundo={cores.fundoOpcao}
                onPress={() => aoAlterar?.(alternarOpcaoCategoria(categoria, selecionadas, opcao))}
            />
        );
    }
    return (
        <View style={estilos.container}>
            {categoria.id === 'anotacao_livre' ? (
                <View testID="divisor-anotacao-livre" style={estilos.divisorCategoria} />
            ) : null}
            <View style={[estilos.faixaTitulo, { backgroundColor: cores.fundoCategoria }]}>
                <Text accessibilityRole="header" style={[estilos.titulo, { color: cores.icone }]}>
                    {categoria.nome}
                </Text>
            </View>
            {agruparOpcoes(categoria.opcoes).map(([grupoId, opcoes]) => {
                const titulo = diaryGroupPresentation[`${categoria.id}:${grupoId}`]?.[0];
                return (
                    <View key={grupoId} style={estilos.grupo}>
                        {titulo ? (
                            <View style={estilos.tituloGrupoLinha}>
                                <View style={estilos.linha} />
                                <Text style={estilos.tituloGrupo}>{titulo}</Text>
                                <View style={estilos.linha} />
                            </View>
                        ) : null}
                        <View accessibilityRole="list" style={estilos.opcoes}>
                            {organizarOpcoesEmLinhas(opcoes).map((linhaOpcoes) => (
                                <View key={linhaOpcoes[0].id} style={estilos.linhaOpcoes}>
                                    {linhaOpcoes.map(renderizarOpcao)}
                                </View>
                            ))}
                        </View>
                    </View>
                );
            })}
            {controle}
            {erro && categoria.tipoValor !== 'duracao_minutos' ? (
                <Text accessibilityRole="alert" style={estilos.erro}>
                    {erro}
                </Text>
            ) : null}
        </View>
    );
}

export { calcularAlturaAnotacao, DiaryCategoryField };
