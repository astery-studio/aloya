import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { obterApresentacaoMacrocategoria } from '../../config/diaryMacroPresentation';
import { DiaryCategoryField } from '../DiaryCategoryField/DiaryCategoryField';
import DiaryMacrocategorySection from '../DiaryMacrocategorySection/DiaryMacrocategorySection';

function criarEstadoExpandido(macrocategorias) {
    return Object.fromEntries(macrocategorias.map((macro) => [macro.id, false]));
}

function sincronizarEstadoExpandido(estado, ids) {
    return Object.fromEntries(ids.map((id) => [id, estado[id] ?? false]));
}

function DiaryMacrocategoryList({ macrocategorias, valores, erros, aoAlterar, desabilitado }) {
    const [expandidas, setExpandidas] = useState(() => criarEstadoExpandido(macrocategorias));
    const chaveMacrocategorias = macrocategorias.map((macro) => macro.id).join('|');

    useEffect(() => {
        const ids = chaveMacrocategorias ? chaveMacrocategorias.split('|') : [];
        setExpandidas((atuais) => sincronizarEstadoExpandido(atuais, ids));
    }, [chaveMacrocategorias]);

    function alternar(macroId) {
        setExpandidas((atuais) => ({ ...atuais, [macroId]: !atuais[macroId] }));
    }

    return (
        <View style={{ gap: 8 }}>
            {macrocategorias.map((macro) => {
                const apresentacao = obterApresentacaoMacrocategoria(macro.id);
                return (
                    <DiaryMacrocategorySection
                        key={macro.id}
                        titulo={macro.nomeCompacto ?? macro.nome}
                        icone={apresentacao.icone}
                        iconeProps={apresentacao.iconeProps}
                        paleta={apresentacao.paleta}
                        expandido={Boolean(expandidas[macro.id])}
                        aoAlternar={() => alternar(macro.id)}
                        desabilitado={desabilitado}
                    >
                        {macro.categorias.map((categoria) => (
                            <DiaryCategoryField
                                key={categoria.id}
                                categoria={categoria}
                                valor={valores[categoria.id]}
                                erro={erros[categoria.id]}
                                paleta={apresentacao.paleta}
                                desabilitado={desabilitado}
                                aoAlterar={(valor) => aoAlterar(categoria.id, valor)}
                            />
                        ))}
                    </DiaryMacrocategorySection>
                );
            })}
        </View>
    );
}

export { criarEstadoExpandido, DiaryMacrocategoryList, sincronizarEstadoExpandido };
