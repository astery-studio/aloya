//Compõe a edição de permissões individuais dentro do painel inferior compartilhado.
import { useCallback, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { BottomSheetLayout } from '../../../../shared/layouts/BottomSheet/BottomSheetLayout';
import { GeneralPermissions } from '../GeneralPermissions/GeneralPermissions';
import { PermissionGroups } from '../PermissionGroups/PermissionGroups';
import {
    PermissionBulkSelector,
    normalizarPermissoesSelecionadas
} from '../PermissionBulkSelector/PermissionBulkSelector';
import { criarEstilos } from './IndividualPermissionsForm.styles';

function IndividualPermissionsForm({
    visivel,
    aoFechar,
    permissoesSelecionadas = [],
    aoAlterar,
    aoSalvar,
    alterado = false,
    carregando = false,
    erro = null
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const permissoesNormalizadas = useMemo(
        () => normalizarPermissoesSelecionadas(permissoesSelecionadas),
        [permissoesSelecionadas]
    );

    const mensagemErro = typeof erro === 'string' && erro.trim().length > 0 ? erro.trim() : null;

    const edicaoBloqueada = carregando || typeof aoAlterar !== 'function';

    const salvamentoBloqueado =
        carregando ||
        !alterado ||
        permissoesNormalizadas.length === 0 ||
        typeof aoSalvar !== 'function';

    const coresInterruptor = useMemo(
        () =>
            tema.escuro
                ? {
                      trilhaInativa: '#424242',
                      indicadorInativo: '#9E9E9E',
                      trilhaAtiva: '#A5D6A7',
                      indicadorAtivo: '#121212'
                  }
                : undefined,
        [tema.escuro]
    );

    const alterarListaCompleta = useCallback(
        (novasPermissoes) => {
            if (edicaoBloqueada || !Array.isArray(novasPermissoes)) {
                return;
            }

            aoAlterar(normalizarPermissoesSelecionadas(novasPermissoes));
        },
        [aoAlterar, edicaoBloqueada]
    );

    const alterarPermissaoGeral = useCallback(
        (permissaoId, ativa) => {
            if (edicaoBloqueada) {
                return;
            }

            const novasPermissoes = new Set(permissoesNormalizadas);

            if (ativa) {
                novasPermissoes.add(permissaoId);
            } else {
                novasPermissoes.delete(permissaoId);
            }

            alterarListaCompleta([...novasPermissoes]);
        },
        [alterarListaCompleta, edicaoBloqueada, permissoesNormalizadas]
    );

    const salvar = useCallback(() => {
        if (salvamentoBloqueado) {
            return;
        }

        return aoSalvar(permissoesNormalizadas);
    }, [aoSalvar, permissoesNormalizadas, salvamentoBloqueado]);

    return (
        <BottomSheet
            visivel={visivel === true}
            onFechar={aoFechar}
            bloquearFechamento={carregando}
            estiloPainel={estilos.painel}
        >
            <BottomSheetLayout
                titulo="Permissões Individuais"
                onFechar={aoFechar}
                bloquearFechamento={carregando}
            >
                <View style={estilos.corpo}>
                    <ScrollView
                        testID="individual-permissions-scroll"
                        style={estilos.rolagem}
                        contentContainerStyle={estilos.conteudoRolagem}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator
                    >
                        <PermissionBulkSelector
                            permissoesSelecionadas={permissoesNormalizadas}
                            aoAlterar={alterarListaCompleta}
                            desabilitado={edicaoBloqueada}
                        />

                        <View style={estilos.separador}>
                            <View style={estilos.linha} />

                            <Text style={estilos.textoSeparador}>OU PERSONALIZE POR TIPO</Text>

                            <View style={estilos.linha} />
                        </View>

                        <GeneralPermissions
                            aparenciaNovaCategoria
                            coresInterruptor={coresInterruptor}
                            permissoesSelecionadas={permissoesNormalizadas}
                            aoAlterar={alterarPermissaoGeral}
                            desabilitado={edicaoBloqueada}
                        />

                        <PermissionGroups
                            aparenciaNovaCategoria
                            coresInterruptor={coresInterruptor}
                            permissoesSelecionadas={permissoesNormalizadas}
                            aoAlterar={alterarListaCompleta}
                            desabilitado={edicaoBloqueada}
                        />

                        {mensagemErro ? (
                            <Text
                                accessible
                                accessibilityRole="alert"
                                accessibilityLabel={mensagemErro}
                                style={estilos.erro}
                            >
                                {mensagemErro}
                            </Text>
                        ) : null}
                    </ScrollView>

                    <View style={estilos.acao}>
                        <ButtonScreen
                            texto="Salvar"
                            rotuloAcessibilidade="Salvar permissões individuais"
                            aoPressionar={salvar}
                            desativado={salvamentoBloqueado}
                            carregando={carregando}
                            variante="laranja"
                        />
                    </View>
                </View>
            </BottomSheetLayout>
        </BottomSheet>
    );
}

export { IndividualPermissionsForm };
