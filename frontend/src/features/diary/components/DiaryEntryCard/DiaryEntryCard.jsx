// Apresenta um resumo minimizado e seguro de cada registro na linha do tempo.
import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    NotebookIcon,
    PencilSimpleIcon,
    RepeatIcon,
    TrashIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { formatarDataDiario } from '../../utils/diaryDate';
import {
    obterApresentacaoFase,
    obterApresentacaoFaseRegistro
} from '../../utils/diaryPhasePresentation';
import { DiaryAdditionalCategoriesChip } from '../DiaryAdditionalCategoriesChip/DiaryAdditionalCategoriesChip';
import { DiaryEntrySummaryChip } from '../DiaryEntrySummaryChip/DiaryEntrySummaryChip';
import { criarEstilos } from './DiaryEntryCard.styles';

const LARGURA_UTIL_CHIPS = 247;
const ESPACO_CHIPS = 5;

function estimarLarguraChip({ texto }) {
    return Math.min(LARGURA_UTIL_CHIPS, 31 + [...texto].length * 4.4);
}

function larguraLinhaChips(itens) {
    return itens.reduce(
        (total, item, indice) => total + estimarLarguraChip(item) + (indice > 0 ? ESPACO_CHIPS : 0),
        0
    );
}

function pontuarDistribuicaoChips(linhas) {
    const larguras = linhas.map(larguraLinhaChips);
    const excesso = larguras.reduce(
        (total, largura) => total + Math.max(0, largura - LARGURA_UTIL_CHIPS),
        0
    );
    return excesso * 1000 + Math.abs(larguras[0] - larguras[1]);
}

function organizarChipsEmLinhas(itens) {
    if (!Array.isArray(itens) || !itens.length) return [];
    if (larguraLinhaChips(itens) <= LARGURA_UTIL_CHIPS) return [itens];
    if (itens.length === 2) {
        return itens.map((item) => [item]);
    }
    if (itens.length === 3) {
        return [
            [itens.slice(0, 1), itens.slice(1)],
            [itens.slice(0, 2), itens.slice(2)]
        ].sort((a, b) => pontuarDistribuicaoChips(a) - pontuarDistribuicaoChips(b))[0];
    }

    const sequencial = [itens.slice(0, 2), itens.slice(2, 4)];
    if (sequencial.every((linha) => larguraLinhaChips(linha) <= LARGURA_UTIL_CHIPS))
        return sequencial;

    const candidatos = [
        [
            [itens[0], itens[2]],
            [itens[1], itens[3]]
        ],
        [
            [itens[0], itens[3]],
            [itens[1], itens[2]]
        ]
    ];
    return candidatos.sort((a, b) => pontuarDistribuicaoChips(a) - pontuarDistribuicaoChips(b))[0];
}

function limitarTrechoAnotacao(valor, limite = 100) {
    if (typeof valor !== 'string' || !valor.trim() || !Number.isSafeInteger(limite) || limite < 2)
        return null;
    const texto = valor.trim();
    const caracteres = [...texto];
    if (caracteres.length <= limite) return texto;
    return `${caracteres.slice(0, limite - 1).join('')}…`;
}

// Valida e prepara um resumo recebido da API sem acrescentar dados sensíveis.
function normalizarRegistro(registro, tema, somenteLeitura = false) {
    if (!registro || typeof registro !== 'object' || Array.isArray(registro)) return null;
    const dataFormatada = formatarDataDiario(registro.data);
    const fase = somenteLeitura
        ? obterApresentacaoFase(registro.fase, tema)
        : obterApresentacaoFaseRegistro(registro.fase, tema);
    if (
        !Number.isSafeInteger(registro.id) ||
        registro.id <= 0 ||
        !dataFormatada ||
        (!fase && !somenteLeitura)
    )
        return null;

    const principaisValidos = Array.isArray(registro.principais)
        ? registro.principais.filter(
              (item) =>
                  item &&
                  typeof item === 'object' &&
                  typeof item.valor === 'string' &&
                  item.valor.trim()
          )
        : [];
    const principais = principaisValidos.slice(0, 3);
    const quantidadeAdicionalRecebida =
        Number.isSafeInteger(registro.maisQuantidade) && registro.maisQuantidade > 0
            ? registro.maisQuantidade
            : 0;

    return {
        ...registro,
        dataFormatada,
        apresentacaoFase: fase,
        diaCiclo:
            Number.isSafeInteger(registro.diaCiclo) && registro.diaCiclo > 0
                ? registro.diaCiclo
                : null,
        principais,
        maisQuantidade:
            quantidadeAdicionalRecebida + Math.max(0, principaisValidos.length - principais.length),
        trechoAnotacao: limitarTrechoAnotacao(registro.trechoAnotacao)
    };
}

// Renderiza o cartão e encaminha ações contextualizadas pelo registro e pela data.
function DiaryEntryCard({
    registro,
    aoAbrir,
    aoEditar,
    aoExcluir,
    acaoEmAndamento = null,
    somenteLeitura = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const item = normalizarRegistro(registro, tema, somenteLeitura);

    if (!item) return null;

    const bloqueado = acaoEmAndamento !== null;
    const podeAbrir = typeof aoAbrir === 'function' && !bloqueado;
    const fase = item.apresentacaoFase;
    const cor = fase?.cor ?? tema.cores.interface.textoSecundario;
    const rotuloFase =
        fase && (item.diaCiclo ? `${fase.rotulo} - Dia ${item.diaCiclo} do Ciclo` : fase.rotulo);
    const possuiCategoriasPublicas = item.principais.length > 0 || item.maisQuantidade > 0;
    const possuiResumoPublico = possuiCategoriasPublicas || Boolean(item.trechoAnotacao);
    const chipsResumo = [
        ...item.principais.map((principal, indice) => ({
            chave: `${principal.categoriaId ?? 'categoria'}-${indice}`,
            texto: principal.valor.trim(),
            principal
        })),
        ...(item.maisQuantidade
            ? [{ chave: 'mais-categorias', texto: String(item.maisQuantidade), contador: true }]
            : [])
    ];
    const linhasChips = organizarChipsEmLinhas(chipsResumo);
    const resumoAcessivel = item.principais.map(({ valor }) => valor.trim()).join(', ');

    function executar(callback) {
        return () => callback?.(registro);
    }

    return (
        <View testID="diary-entry-card" style={estilos.cartao}>
            <View style={estilos.cabecalho}>
                <View
                    testID="diary-entry-header-leading"
                    style={[
                        estilos.lateralCabecalho,
                        somenteLeitura && estilos.lateralSomenteLeitura
                    ]}
                >
                    <View
                        testID="diary-entry-icon"
                        style={[
                            estilos.iconeRegistro,
                            {
                                borderColor: cor,
                                backgroundColor: fase?.fundoIcone ?? tema.cores.interface.fundo
                            }
                        ]}
                    >
                        <NotebookIcon
                            testID="diary-entry-notebook-icon"
                            size={13}
                            color={cor}
                            weight="regular"
                        />
                    </View>
                </View>
                <Pressable
                    testID="diary-entry-date-area"
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir registro de ${item.dataFormatada}${resumoAcessivel ? `. ${resumoAcessivel}` : ''}`}
                    accessibilityState={{ disabled: !podeAbrir }}
                    disabled={!podeAbrir}
                    onPress={executar(aoAbrir)}
                    style={estilos.areaData}
                >
                    <Text style={estilos.data}>{item.dataFormatada}</Text>
                </Pressable>
                {somenteLeitura ? (
                    <View pointerEvents="none" style={estilos.lateralSomenteLeitura} />
                ) : (
                    <View testID="diary-entry-header-actions" style={estilos.acoes}>
                        <IconButton
                            icone={PencilSimpleIcon}
                            compacto
                            tamanhoCompacto={26}
                            tamanhoIconeCompacto={13}
                            aoPressionar={executar(aoEditar)}
                            rotuloAcessibilidade={`Editar registro de ${item.dataFormatada}`}
                            desativado={bloqueado || typeof aoEditar !== 'function'}
                        />
                        {typeof aoExcluir === 'function' ? (
                            <IconButton
                                icone={TrashIcon}
                                compacto
                                tamanhoCompacto={26}
                                tamanhoIconeCompacto={13}
                                aoPressionar={executar(aoExcluir)}
                                rotuloAcessibilidade={`Excluir registro de ${item.dataFormatada}`}
                                desativado={bloqueado}
                            />
                        ) : null}
                    </View>
                )}
            </View>

            {possuiResumoPublico ? (
                <Pressable
                    testID="diary-entry-content"
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalhes do registro de ${item.dataFormatada}`}
                    accessibilityState={{ disabled: !podeAbrir }}
                    disabled={!podeAbrir}
                    onPress={executar(aoAbrir)}
                    style={estilos.conteudo}
                >
                    {possuiCategoriasPublicas ? (
                        <>
                            <Text style={estilos.rotuloSecao}>CATEGORIAS MARCADAS</Text>
                            <View testID="diary-entry-chips" style={estilos.chips}>
                                {linhasChips.map((linha, indiceLinha) => (
                                    <View
                                        key={`linha-${indiceLinha}`}
                                        testID="diary-entry-chip-row"
                                        style={estilos.linhaChips}
                                    >
                                        {linha.map((chip) =>
                                            chip.contador ? (
                                                <DiaryAdditionalCategoriesChip
                                                    key={chip.chave}
                                                    quantidade={item.maisQuantidade}
                                                    estilos={estilos}
                                                    tema={tema}
                                                />
                                            ) : (
                                                <DiaryEntrySummaryChip
                                                    key={chip.chave}
                                                    principal={chip.principal}
                                                    estilos={estilos}
                                                    tema={tema}
                                                />
                                            )
                                        )}
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : null}

                    {possuiCategoriasPublicas && item.trechoAnotacao ? (
                        <View
                            testID="diary-entry-categories-note-divider"
                            style={estilos.divisorConteudo}
                        />
                    ) : null}

                    {item.trechoAnotacao ? (
                        <View testID="diary-entry-note" style={estilos.anotacao}>
                            <Text style={estilos.rotuloSecao}>ANOTAÇÃO DO DIA</Text>
                            <Text numberOfLines={3} style={estilos.textoAnotacao}>
                                {item.trechoAnotacao}
                            </Text>
                        </View>
                    ) : null}
                </Pressable>
            ) : null}

            {fase ? (
                <View testID="diary-entry-phase-section" style={estilos.containerFase}>
                    <View
                        accessible
                        accessibilityLabel={rotuloFase}
                        style={[estilos.fase, { backgroundColor: fase.fundo }]}
                    >
                        <RepeatIcon
                            testID="diary-entry-phase-tag-icon"
                            size={13}
                            width={13}
                            height={13}
                            color={cor}
                        />
                        <Text style={[estilos.textoFase, { color: cor }]}>{rotuloFase}</Text>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

const MemoizedDiaryEntryCard = memo(DiaryEntryCard);

export {
    MemoizedDiaryEntryCard as DiaryEntryCard,
    limitarTrechoAnotacao,
    normalizarRegistro,
    organizarChipsEmLinhas
};
