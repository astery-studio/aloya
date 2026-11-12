import { Pressable, Text, View } from 'react-native';

import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import { CaretDownIcon, CaretUpIcon } from '../../../../shared/components/icons/AppIcons';
import { obterApresentacaoMacrocategoria } from '../../config/diaryMacroPresentation';

function DiaryCategoryFilterGroup({
    macro,
    selecionadas,
    expandida,
    aoExpandir,
    aoAlternar,
    aoAlternarTodas,
    estilos,
    tema
}) {
    const apresentacao = obterApresentacaoMacrocategoria(macro.id);
    const paleta = tema.cores.redeApoio[apresentacao.paleta];
    const Icone = apresentacao.icone;
    const IconeExpansao = expandida ? CaretUpIcon : CaretDownIcon;
    const categorias = macro.categorias.filter((categoria) => categoria.ativaEfetiva);
    const quantidadeSelecionada = categorias.filter((categoria) =>
        selecionadas.includes(categoria.id)
    ).length;
    const todasSelecionadas = quantidadeSelecionada === categorias.length;

    if (!macro.ativa || categorias.length === 0) return null;

    return (
        <View
            style={[
                estilos.grupoCategoria,
                expandida && estilos.grupoCategoriaExpandido,
                expandida && { borderColor: paleta.bordaExpandida }
            ]}
        >
            <View
                style={[
                    estilos.cabecalhoCategoria,
                    expandida && { backgroundColor: paleta.fundoDiarioExpandido }
                ]}
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${expandida ? 'Recolher' : 'Expandir'} ${macro.nome}`}
                    accessibilityState={{ expanded: expandida }}
                    onPress={aoExpandir}
                    style={({ pressed }) => [
                        estilos.expansaoCategoria,
                        pressed && estilos.pressionado
                    ]}
                >
                    <View style={[estilos.iconeCategoria, { backgroundColor: paleta.fundoIcone }]}>
                        <Icone
                            size={18}
                            color={paleta.icone}
                            weight={apresentacao.iconeProps?.weight ?? 'regular'}
                        />
                    </View>
                    <Text style={[estilos.nomeMacro, expandida && { color: paleta.icone }]}>
                        {macro.nome}
                    </Text>
                    <IconeExpansao size={18} color={expandida ? paleta.icone : '#A8A49C'} />
                </Pressable>
                <SwitchField
                    somenteControle
                    ativo={todasSelecionadas}
                    aoAlterar={(ativa) => aoAlternarTodas(categorias, ativa)}
                    rotuloAcessibilidade={`${todasSelecionadas ? 'Desmarcar' : 'Marcar'} todas as categorias de ${macro.nome}`}
                />
            </View>
            {expandida ? (
                <View>
                    {categorias.map((categoria) => {
                        const ativa = selecionadas.includes(categoria.id);
                        return (
                            <Pressable
                                key={categoria.id}
                                accessible={false}
                                onPress={() => aoAlternar(categoria.id)}
                                style={({ pressed }) => [
                                    estilos.opcaoCategoria,
                                    pressed && estilos.pressionado
                                ]}
                            >
                                <Text style={estilos.nomeCategoria}>{categoria.nome}</Text>
                                <SwitchField
                                    somenteControle
                                    ativo={ativa}
                                    aoAlterar={() => aoAlternar(categoria.id)}
                                    rotuloAcessibilidade={`Filtrar por ${categoria.nome}`}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

export { DiaryCategoryFilterGroup };
