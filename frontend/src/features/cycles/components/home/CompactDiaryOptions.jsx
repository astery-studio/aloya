import { Text, View } from 'react-native';
import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { DiaryOptionIcon } from '../../../diary/components/DiaryOptionIcon/DiaryOptionIcon';
import { obterApresentacaoOpcao } from '../../../diary/config/diaryOptionPresentation';
import { alternarOpcaoCategoria } from '../../../diary/utils/diaryFormValue';
import { criarSugestoesCheckIn } from '../../utils/checkInSuggestions';
import { estilos } from './CompactDiaryOptions.styles';

const GRUPOS_HOME = Object.freeze([
    {
        categoriaId: 'fluxo_menstrual',
        titulo: 'Intensidade fluxo menstrual',
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)'
    },
    {
        categoriaId: 'sintomas_fisicos',
        titulo: 'Sintomas físicos',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)'
    },
    {
        categoriaId: 'sintomas_emocionais',
        titulo: 'Sintomas emocionais',
        cor: '#7B5EA7',
        fundo: 'rgba(123, 94, 167, 0.1)'
    },
    {
        categoriaId: 'sintomas_pre_menstruais',
        titulo: 'Sintomas pré-menstruais',
        cor: '#7B5EA7',
        fundo: 'rgba(123, 94, 167, 0.1)'
    },
    {
        categoriaId: 'energia',
        titulo: 'Energia',
        cor: '#D68C3A',
        fundo: 'rgba(214, 140, 58, 0.1)'
    },
    {
        categoriaId: 'qualidade_sono',
        titulo: 'Sono',
        cor: '#4A758E',
        fundo: 'rgba(74, 117, 142, 0.1)'
    },
    {
        categoriaId: 'digestao',
        titulo: 'Digestão',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)'
    },
    {
        categoriaId: 'pele',
        titulo: 'Pele',
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)'
    }
]);

function CompactDiaryOptions({
    catalogo,
    fase,
    destaques,
    idsExcluidos,
    valores,
    aoAlterar,
    desabilitado
}) {
    const sugestoes = criarSugestoesCheckIn({ catalogo, fase, destaques, idsExcluidos });
    const grupos = GRUPOS_HOME.map((configuracao) => {
        const encontradas = sugestoes.filter(
            ({ categoria }) => categoria.id === configuracao.categoriaId
        );
        const categoria = encontradas[0]?.categoria;
        const opcoes = encontradas.map(({ opcao }) => opcao);
        return categoria && opcoes.length ? { ...configuracao, categoria, opcoes } : null;
    }).filter(Boolean);

    return (
        <View style={estilos.lista}>
            {grupos.map(({ categoria, titulo, opcoes, cor, fundo }) => (
                <View key={categoria.id} style={estilos.grupo}>
                    <View style={estilos.cabecalho}>
                        <View style={estilos.divisor} />
                        <Text style={estilos.titulo}>{titulo}</Text>
                        <View style={estilos.divisor} />
                    </View>
                    <View style={estilos.opcoes}>
                        {opcoes.map((opcao) => {
                            const selecionada = (valores[categoria.id] ?? []).includes(opcao.id);
                            const apresentacao = obterApresentacaoOpcao(categoria.id, opcao);
                            const { color, ...iconeProps } = apresentacao?.iconeProps ?? {};
                            return (
                                <ButtonSelection
                                    key={opcao.id}
                                    label={opcao.nome}
                                    selected={selecionada}
                                    desabilitado={desabilitado}
                                    variante="compacto"
                                    icone={apresentacao ? DiaryOptionIcon : undefined}
                                    iconeProps={
                                        apresentacao
                                            ? {
                                                  ...iconeProps,
                                                  iconeId: apresentacao.iconeId,
                                                  selecionado: selecionada,
                                                  ...(!selecionada && color ? { color } : {})
                                              }
                                            : undefined
                                    }
                                    cor={cor}
                                    fundo={fundo}
                                    estiloTexto={estilos.textoOpcao}
                                    onPress={() =>
                                        aoAlterar(
                                            categoria.id,
                                            alternarOpcaoCategoria(
                                                categoria,
                                                valores[categoria.id],
                                                opcao
                                            )
                                        )
                                    }
                                />
                            );
                        })}
                    </View>
                </View>
            ))}
        </View>
    );
}

export { CompactDiaryOptions };
