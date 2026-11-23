import { Pressable, Text } from 'react-native';

import SwitchField from '../../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';
import { obterApresentacaoMacrocategoria } from '../../config/diaryMacroPresentation';
import { DiaryMacrocategoryAccordion } from '../DiaryMacrocategoryAccordion/DiaryMacrocategoryAccordion';

function DiaryCategoryFilterGroup({
    macro,
    selecionadas,
    expandida,
    aoExpandir,
    aoAlternar,
    aoAlternarTodas,
    estilos
}) {
    const tema = useTheme();
    const coresDiario = obterCoresDiario(tema);
    const apresentacao = obterApresentacaoMacrocategoria(macro.id);
    const coresSwitch = {
        trilhaAtiva: coresDiario.interface.destaque,
        trilhaInativa: coresDiario.interface.switchInativo,
        indicadorAtivo: coresDiario.interface.textoSobreDestaque,
        indicadorInativo: coresDiario.interface.textoSobreDestaque
    };
    const categorias = macro.categorias.filter((categoria) => categoria.ativaEfetiva);
    const quantidadeSelecionada = categorias.filter((categoria) =>
        selecionadas.includes(categoria.id)
    ).length;
    const todasSelecionadas = quantidadeSelecionada === categorias.length;

    if (!macro.ativa || categorias.length === 0) return null;

    return (
        <DiaryMacrocategoryAccordion
            titulo={macro.nome}
            icone={apresentacao.icone}
            iconeProps={apresentacao.iconeProps}
            paleta={apresentacao.paleta}
            expandido={expandida}
            aoAlternar={aoExpandir}
            acessorio={
                <SwitchField
                    cores={coresSwitch}
                    somenteControle
                    ativo={todasSelecionadas}
                    aoAlterar={(ativa) => aoAlternarTodas(categorias, ativa)}
                    rotuloAcessibilidade={`${todasSelecionadas ? 'Desmarcar' : 'Marcar'} todas as categorias de ${macro.nome}`}
                />
            }
        >
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
                            cores={coresSwitch}
                            somenteControle
                            ativo={ativa}
                            aoAlterar={() => aoAlternar(categoria.id)}
                            rotuloAcessibilidade={`Filtrar por ${categoria.nome}`}
                        />
                    </Pressable>
                );
            })}
        </DiaryMacrocategoryAccordion>
    );
}

export { DiaryCategoryFilterGroup };
