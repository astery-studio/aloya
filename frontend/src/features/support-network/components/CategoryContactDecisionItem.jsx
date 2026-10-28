//Apresenta um contato e permite escolher exatamente uma decisão para sua exclusão.
import { useCallback } from 'react';
import { Text, View } from 'react-native';

import {
    ACOES_EXCLUSAO_CATEGORIA,
    acaoExclusaoEhValida
} from '../constants/categoryDeletionOptions';
import { CategoryDecisionOption } from './CategoryDecisionOption';
import { estilos } from './CategoryContactDecisionItem.styles';

function CategoryContactDecisionItem({
    contato,
    decisao = null,
    onAlterarDecisao,
    desabilitado = false
}) {
    const vinculoId =
        Number.isSafeInteger(contato?.vinculoId) && contato.vinculoId > 0
            ? contato.vinculoId
            : null;

    const nome =
        typeof contato?.nome === 'string' && contato.nome.trim().length > 0
            ? contato.nome.trim()
            : 'Contato';

    const decisaoSegura = acaoExclusaoEhValida(decisao) ? decisao : null;

    const bloqueado = desabilitado || vinculoId === null || typeof onAlterarDecisao !== 'function';

    const selecionarRemocao = useCallback(() => {
        if (!bloqueado) {
            onAlterarDecisao(vinculoId, ACOES_EXCLUSAO_CATEGORIA.removerAcesso);
        }
    }, [bloqueado, onAlterarDecisao, vinculoId]);

    const selecionarManutencao = useCallback(() => {
        if (!bloqueado) {
            onAlterarDecisao(vinculoId, ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual);
        }
    }, [bloqueado, onAlterarDecisao, vinculoId]);

    return (
        <View
            testID={
                vinculoId === null ? 'decisao-contato-invalido' : `decisao-contato-${vinculoId}`
            }
            accessibilityRole="radiogroup"
            accessibilityLabel={`Decisão para ${nome}`}
            style={estilos.container}
        >
            <Text numberOfLines={2} style={estilos.nome}>
                {nome}
            </Text>

            <View style={estilos.opcoes}>
                <CategoryDecisionOption
                    titulo="Remover acesso deste contato"
                    variante="remover"
                    selecionado={decisaoSegura === ACOES_EXCLUSAO_CATEGORIA.removerAcesso}
                    aoPressionar={selecionarRemocao}
                    desabilitado={bloqueado}
                    rotuloAcessibilidade={`Remover acesso de ${nome}`}
                />

                <CategoryDecisionOption
                    titulo="Manter acesso com as permissões atuais (tornando-o individual)"
                    variante="manter"
                    selecionado={decisaoSegura === ACOES_EXCLUSAO_CATEGORIA.manterAcessoIndividual}
                    aoPressionar={selecionarManutencao}
                    desabilitado={bloqueado}
                    rotuloAcessibilidade={`Manter acesso individual de ${nome}`}
                />
            </View>
        </View>
    );
}

export { CategoryContactDecisionItem };
