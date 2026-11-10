import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { diaryGroupPresentation } from '../../config/diaryGroupPresentation';
import { obterApresentacaoOpcao } from '../../config/diaryOptionPresentation';
import { alternarOpcao } from '../../utils/diaryFormValue';
import { agruparOpcoes } from '../../utils/diaryOptionGroups';
import { DiaryOptionIcon } from '../DiaryOptionIcon/DiaryOptionIcon';
import { criarEstilos } from './DiaryCategoryField.styles';

function DiaryCategoryField({ categoria, valor, aoAlterar, paleta = 'ciclo', desabilitado }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const cores = tema.cores.redeApoio[paleta] ?? tema.cores.redeApoio.ciclo;
    const selecionadas = Array.isArray(valor) ? valor : [];

    function renderizarOpcao(opcao) {
        const apresentacao = obterApresentacaoOpcao(categoria.id, opcao);
        const Icone = (props) => (
            <DiaryOptionIcon
                {...props}
                {...apresentacao.iconeProps}
                iconeId={apresentacao.iconeId}
            />
        );
        return (
            <ButtonSelection
                key={opcao.id}
                variante="compacto"
                label={opcao.nome}
                icone={Icone}
                selected={selecionadas.includes(opcao.id)}
                desabilitado={desabilitado}
                cor={cores.icone}
                fundo={cores.fundoExpandido}
                onPress={() => aoAlterar?.(alternarOpcao(selecionadas, opcao.id))}
            />
        );
    }
    return (
        <View style={estilos.container}>
            <View style={[estilos.faixaTitulo, { backgroundColor: cores.fundoExpandido }]}>
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
        </View>
    );
}

export { DiaryCategoryField };
