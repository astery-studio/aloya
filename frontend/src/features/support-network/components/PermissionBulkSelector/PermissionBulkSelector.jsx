//Permite selecionar ou remover conjuntos completos de permissões individuais.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CheckIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { gruposPermissoes, permissoesGerais } from '../../constants/permissionOptions';
import { criarEstilos } from './PermissionBulkSelector.styles';

const IDS_PERMISSOES_GERAIS = Object.freeze(permissoesGerais.map(({ id }) => id));

const IDS_PERMISSOES_ACESSO = Object.freeze(
    gruposPermissoes.flatMap((grupo) => grupo.permissoes.map(({ id }) => id))
);

const IDS_TODAS_PERMISSOES = Object.freeze([...IDS_PERMISSOES_GERAIS, ...IDS_PERMISSOES_ACESSO]);

const IDS_PERMITIDOS = new Set(IDS_TODAS_PERMISSOES);

function normalizarPermissoesSelecionadas(permissoes) {
    if (!Array.isArray(permissoes)) {
        return [];
    }

    const recebidas = new Set(
        permissoes.filter(
            (permissaoId) => typeof permissaoId === 'string' && IDS_PERMITIDOS.has(permissaoId)
        )
    );

    return IDS_TODAS_PERMISSOES.filter((permissaoId) => recebidas.has(permissaoId));
}

function obterEstadoDoConjunto(idsDoConjunto, permissoesAtivas) {
    const quantidadeSelecionada = idsDoConjunto.reduce(
        (quantidade, permissaoId) => quantidade + (permissoesAtivas.has(permissaoId) ? 1 : 0),
        0
    );

    if (quantidadeSelecionada === 0) {
        return false;
    }

    if (quantidadeSelecionada === idsDoConjunto.length) {
        return true;
    }

    return 'mixed';
}

function alternarConjunto({ idsDoConjunto, permissoesSelecionadas, todasSelecionadas }) {
    const novasPermissoes = new Set(permissoesSelecionadas);

    for (const permissaoId of idsDoConjunto) {
        if (todasSelecionadas) {
            novasPermissoes.delete(permissaoId);
        } else {
            novasPermissoes.add(permissaoId);
        }
    }

    return IDS_TODAS_PERMISSOES.filter((permissaoId) => novasPermissoes.has(permissaoId));
}

function PermissionBulkSelector({ permissoesSelecionadas = [], aoAlterar, desabilitado = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const permissoesNormalizadas = useMemo(
        () => normalizarPermissoesSelecionadas(permissoesSelecionadas),
        [permissoesSelecionadas]
    );

    const permissoesAtivas = useMemo(
        () => new Set(permissoesNormalizadas),
        [permissoesNormalizadas]
    );

    const estadoGerais = obterEstadoDoConjunto(IDS_PERMISSOES_GERAIS, permissoesAtivas);

    const estadoAcesso = obterEstadoDoConjunto(IDS_PERMISSOES_ACESSO, permissoesAtivas);

    const bloqueado = desabilitado || typeof aoAlterar !== 'function';

    function alterarConjunto(idsDoConjunto, estadoAtual) {
        if (bloqueado) {
            return;
        }

        aoAlterar(
            alternarConjunto({
                idsDoConjunto,
                permissoesSelecionadas: permissoesNormalizadas,
                todasSelecionadas: estadoAtual === true
            })
        );
    }

    function renderizarIndicador(estado, identificador) {
        const selecionado = estado === true;
        const parcial = estado === 'mixed';

        return (
            <View
                testID={`indicador-permissoes-${identificador}`}
                style={[
                    estilos.indicador,
                    selecionado && estilos.indicadorAtivo,
                    parcial && estilos.indicadorParcial
                ]}
            >
                {selecionado ? (
                    <CheckIcon
                        testID={`check-permissoes-${identificador}`}
                        size={15}
                        color={tema.cores.interface.textoSobreDestaque}
                        weight="bold"
                    />
                ) : null}

                {parcial ? (
                    <Text
                        testID={`parcial-permissoes-${identificador}`}
                        style={estilos.tracoParcial}
                    >
                        −
                    </Text>
                ) : null}
            </View>
        );
    }

    return (
        <View
            testID="permission-bulk-selector"
            style={[estilos.container, bloqueado && estilos.desabilitado]}
        >
            <Text accessibilityRole="header" style={estilos.titulo}>
                Marcar todos
            </Text>

            <Text style={estilos.descricao}>Escolha uma opção para selecionar todos os itens.</Text>

            <View style={estilos.opcoes}>
                <Pressable
                    testID="selecionar-permissoes-gerais"
                    accessibilityRole="checkbox"
                    accessibilityLabel="Permissões Gerais"
                    accessibilityState={{
                        checked: estadoGerais,
                        disabled: bloqueado
                    }}
                    disabled={bloqueado}
                    onPress={() => alterarConjunto(IDS_PERMISSOES_GERAIS, estadoGerais)}
                    style={({ pressed }) => [
                        estilos.opcao,
                        pressed && !bloqueado && estilos.pressionado
                    ]}
                >
                    <Text style={estilos.textoOpcao}>Permissões Gerais</Text>

                    {renderizarIndicador(estadoGerais, 'gerais')}
                </Pressable>

                <Pressable
                    testID="selecionar-permissoes-acesso"
                    accessibilityRole="checkbox"
                    accessibilityLabel="Permissões de Acesso"
                    accessibilityState={{
                        checked: estadoAcesso,
                        disabled: bloqueado
                    }}
                    disabled={bloqueado}
                    onPress={() => alterarConjunto(IDS_PERMISSOES_ACESSO, estadoAcesso)}
                    style={({ pressed }) => [
                        estilos.opcao,
                        pressed && !bloqueado && estilos.pressionado
                    ]}
                >
                    <Text style={estilos.textoOpcao}>Permissões de Acesso</Text>

                    {renderizarIndicador(estadoAcesso, 'acesso')}
                </Pressable>
            </View>
        </View>
    );
}

export {
    IDS_PERMISSOES_ACESSO,
    IDS_PERMISSOES_GERAIS,
    IDS_TODAS_PERMISSOES,
    PermissionBulkSelector,
    alternarConjunto,
    normalizarPermissoesSelecionadas,
    obterEstadoDoConjunto
};
