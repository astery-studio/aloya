//Reúne os grupos de permissões de acesso e controla a lista selecionada.
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';
import { useTheme } from '../../../shared/hooks/useTheme';
import PermissionGroup from './PermissionGroup';
import PermissionCounter from './PermissionCounter';
import { useVisibleDiaryPermissionGroups } from '../hooks/useVisibleDiaryPermissionGroups';
import { criarEstilos } from './PermissionGroups.styles';

const idsPermitidos = new Set([
    ...permissoesGerais.map((permissao) => permissao.id),
    ...gruposPermissoes.flatMap((grupo) => grupo.permissoes.map((permissao) => permissao.id))
]);

//Recebe a lista externa e mantém somente identificadores conhecidos, únicos e seguros.
function normalizarPermissoes(permissoes) {
    if (!Array.isArray(permissoes)) {
        return [];
    }

    return [
        ...new Set(
            permissoes.filter(
                (permissao) => typeof permissao === 'string' && idsPermitidos.has(permissao)
            )
        )
    ];
}

//Recebe as permissões selecionadas e devolve todas as alterações ao formulário.
function PermissionGroups({
    aparenciaNovaCategoria = false,
    coresInterruptor,
    permissoesSelecionadas = [],
    aoAlterar,
    desabilitado = false,
    estilo,
    diaryService,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const visibilidade = useVisibleDiaryPermissionGroups({ diaryService, onSessaoExpirada });
    const gruposVisiveis = visibilidade.grupos;
    //Memoização evita repetir a limpeza da lista quando ela não foi alterada.
    const permissoesNormalizadas = useMemo(
        () => normalizarPermissoes(permissoesSelecionadas),
        [permissoesSelecionadas]
    );

    const permissoesAtivas = useMemo(
        () => new Set(permissoesNormalizadas),
        [permissoesNormalizadas]
    );

    const estaDesabilitado = desabilitado || typeof aoAlterar !== 'function';

    const quantidadeGruposAtivos = gruposVisiveis.reduce((total, grupo) => {
        const grupoPossuiSelecao = grupo.permissoes.some((permissao) =>
            permissoesAtivas.has(permissao.id)
        );

        return total + (grupoPossuiSelecao ? 1 : 0);
    }, 0);

    //Adiciona ou remove uma permissão sem apagar as seleções dos outros grupos.
    const alterarPermissao = useCallback(
        (permissaoId, ativa) => {
            if (estaDesabilitado || !idsPermitidos.has(permissaoId)) {
                return;
            }

            const novasPermissoes = new Set(permissoesNormalizadas);

            if (ativa) {
                novasPermissoes.add(permissaoId);
            } else {
                novasPermissoes.delete(permissaoId);
            }

            aoAlterar([...novasPermissoes]);
        },
        [aoAlterar, estaDesabilitado, permissoesNormalizadas]
    );

    //Adiciona ou remove todas as permissões recebidas usando uma única atualização.
    const alterarGrupo = useCallback(
        (permissoesDoGrupo, ativa) => {
            if (estaDesabilitado || !Array.isArray(permissoesDoGrupo)) {
                return;
            }

            const novasPermissoes = new Set(permissoesNormalizadas);

            permissoesDoGrupo.forEach((permissaoId) => {
                if (!idsPermitidos.has(permissaoId)) {
                    return;
                }

                if (ativa) {
                    novasPermissoes.add(permissaoId);
                } else {
                    novasPermissoes.delete(permissaoId);
                }
            });

            aoAlterar([...novasPermissoes]);
        },
        [aoAlterar, estaDesabilitado, permissoesNormalizadas]
    );

    return (
        <View style={[estilos.container, estilo]}>
            <View style={estilos.cabecalho}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Permissões de Acesso
                </Text>

                <PermissionCounter
                    quantidadeAtiva={quantidadeGruposAtivos}
                    total={gruposVisiveis.length}
                />
            </View>

            <View style={estilos.lista}>
                {visibilidade.carregando ? (
                    <View accessibilityLiveRegion="polite" style={estilos.estadoCatalogo}>
                        <ActivityIndicator color={tema.cores.interface.destaque} />
                        <Text style={estilos.textoEstado}>Carregando categorias do Diário...</Text>
                    </View>
                ) : null}
                {visibilidade.erro ? (
                    <View accessibilityLiveRegion="polite" style={estilos.estadoCatalogo}>
                        <Text style={estilos.textoEstado}>
                            Não foi possível carregar as categorias do Diário.
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Tentar carregar categorias do Diário novamente"
                            onPress={visibilidade.tentarNovamente}
                            style={estilos.tentarNovamente}
                        >
                            <Text style={estilos.textoTentarNovamente}>Tentar novamente</Text>
                        </Pressable>
                    </View>
                ) : null}
                {!visibilidade.carregando && !visibilidade.erro && gruposVisiveis.length === 0 ? (
                    <Text style={estilos.textoEstado}>Nenhuma categoria do Diário está ativa.</Text>
                ) : null}
                {gruposVisiveis.map((grupo) => (
                    <PermissionGroup
                        aparenciaNovaCategoria={aparenciaNovaCategoria}
                        coresInterruptor={coresInterruptor}
                        key={grupo.id}
                        titulo={grupo.titulo}
                        icone={grupo.icone}
                        paleta={grupo.paleta}
                        permissoes={grupo.permissoes}
                        permissoesSelecionadas={permissoesNormalizadas}
                        aoAlterarPermissao={alterarPermissao}
                        aoAlterarGrupo={alterarGrupo}
                        desabilitado={estaDesabilitado}
                    />
                ))}
            </View>
        </View>
    );
}

export { PermissionGroups };
