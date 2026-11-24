import { Text, View } from 'react-native';
import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { listarMacrocategoriasAtivas } from '../../../diary/utils/diaryForm';
import { alternarOpcao } from '../../../diary/utils/diaryFormValue';
import { estilos } from './CompactDiaryOptions.styles';

const GRUPOS_HOME = Object.freeze([
    {
        categoriaId: 'fluxo_menstrual',
        titulo: 'Intensidade fluxo menstrual',
        opcoes: ['Muito intenso'],
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)'
    },
    {
        categoriaId: 'sintomas_fisicos',
        titulo: 'Sintomas físicos',
        opcoes: ['Cólicas intensas', 'Cansaço excessivo'],
        cor: '#2C4C3B',
        fundo: 'rgba(44, 76, 59, 0.1)'
    },
    {
        categoriaId: 'sintomas_pre_menstruais',
        titulo: 'Sintomas pré-menstruais',
        opcoes: ['Diminuição da motivação', 'Choro fácil'],
        cor: '#8761A8',
        fundo: '#F1EAF8'
    }
]);

function CompactDiaryOptions({ catalogo, valores, aoAlterar, desabilitado }) {
    const categorias = listarMacrocategoriasAtivas(catalogo).flatMap((macro) => macro.categorias);
    const grupos = GRUPOS_HOME.map((configuracao) => {
        const categoria = categorias.find(({ id }) => id === configuracao.categoriaId);
        const opcoes = configuracao.opcoes
            .map((nome) => categoria?.opcoes.find((opcao) => opcao.nome === nome))
            .filter(Boolean);
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
                            return (
                                <ButtonSelection
                                    key={opcao.id}
                                    label={opcao.nome}
                                    selected={selecionada}
                                    desabilitado={desabilitado}
                                    variante="compacto"
                                    cor={cor}
                                    fundo={fundo}
                                    onPress={() =>
                                        aoAlterar(
                                            categoria.id,
                                            alternarOpcao(valores[categoria.id], opcao.id)
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
