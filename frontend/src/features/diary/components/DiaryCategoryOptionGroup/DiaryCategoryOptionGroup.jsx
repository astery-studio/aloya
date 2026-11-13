import { Text, View } from 'react-native';

import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { diaryGroupPresentation } from '../../config/diaryGroupPresentation';
import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { alternarOpcaoCategoria } from '../../utils/diaryFormValue';
import { organizarOpcoesEmLinhas } from '../../utils/diaryOptionRows';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';

function DiaryCategoryOptionGroup({
    categoria,
    grupoId,
    opcoes,
    selecionadas,
    aoAlterar,
    desabilitado,
    cores,
    estilos
}) {
    const titulo = diaryGroupPresentation[`${categoria.id}:${grupoId}`]?.[0];

    function renderizarOpcao(opcao) {
        const apresentacao = obterApresentacaoOpcao(categoria.id, opcao);
        const selecionada = selecionadas.includes(opcao.id);
        const { color: corEspecifica, ...propriedadesIcone } = apresentacao.iconeProps;
        return (
            <ButtonSelection
                key={opcao.id}
                variante="compacto"
                label={opcao.nome}
                icone={DiaryOptionIcon}
                iconeProps={{
                    ...propriedadesIcone,
                    iconeId: apresentacao.iconeId,
                    selecionado: selecionada,
                    ...(corEspecifica && !selecionada ? { color: corEspecifica } : {})
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
        <View style={estilos.grupo}>
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
}

export { DiaryCategoryOptionGroup };
