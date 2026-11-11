import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import DurationInput from '../../../../shared/components/forms/DurationInput/DurationInput';
import NumberInput from '../../../../shared/components/forms/NumberInput/NumberInput';
import TextInput from '../../../../shared/components/forms/TextInput/TextInput';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { diaryGroupPresentation } from '../../config/diaryGroupPresentation';
import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { alternarOpcaoCategoria } from '../../utils/diaryFormValue';
import { agruparOpcoes } from '../../utils/diaryOptionGroups';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';
import { criarEstilos } from './DiaryCategoryField.styles';

function IconeOpcao(props) {
    return <DiaryOptionIcon {...props} />;
}

function DiaryCategoryField({ categoria, valor, aoAlterar, paleta = 'ciclo', desabilitado, erro }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const selecionadas = Array.isArray(valor) ? valor : [];
    let controle;

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
                    estiloEntrada={{ minHeight: 120, textAlignVertical: 'top' }}
                />
                <Text style={estilos.contador}>
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
                            {opcoes.map(renderizarOpcao)}
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

export { DiaryCategoryField };
