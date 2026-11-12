// Apresenta um resumo minimizado e seguro de cada registro na linha do tempo.
import { memo, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { PlusCircleIcon } from 'phosphor-react-native/src/icons/PlusCircle';

import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ArrowsClockwiseIcon,
    NotebookIcon,
    PencilSimpleIcon,
    TrashIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import {
    obterApresentacaoMacrocategoria,
    obterCorMacrocategoria
} from '../../config/diaryMacroPresentation';
import { formatarDataDiario } from '../../utils/diaryDate';
import { obterApresentacaoFaseRegistro } from '../../utils/diaryPhasePresentation';
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
    if (itens.length === 1) return [itens];
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
function normalizarRegistro(registro) {
    if (!registro || typeof registro !== 'object' || Array.isArray(registro)) return null;
    const dataFormatada = formatarDataDiario(registro.data);
    const fase = obterApresentacaoFaseRegistro(registro.fase);
    if (!Number.isSafeInteger(registro.id) || registro.id <= 0 || !dataFormatada || !fase)
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
        principais,
        maisQuantidade:
            quantidadeAdicionalRecebida + Math.max(0, principaisValidos.length - principais.length),
        trechoAnotacao: limitarTrechoAnotacao(registro.trechoAnotacao)
    };
}

// Renderiza o cartão e encaminha ações contextualizadas pelo registro e pela data.
function DiaryEntryCard({ registro, aoAbrir, aoEditar, aoExcluir, acaoEmAndamento = null }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const item = normalizarRegistro(registro);

    if (!item) return null;

    const bloqueado = acaoEmAndamento !== null;
    const podeAbrir = typeof aoAbrir === 'function' && !bloqueado;
    const { cor, rotulo } = item.apresentacaoFase;
    const possuiCategoriasPublicas = item.principais.length > 0 || item.maisQuantidade > 0;
    const possuiResumoPublico = possuiCategoriasPublicas || Boolean(item.trechoAnotacao);
    const chipsResumo = [
        ...item.principais.map((principal, indice) => ({
            chave: `${principal.categoriaId ?? 'categoria'}-${indice}`,
            texto: principal.valor.trim(),
            principal
        })),
        ...(item.maisQuantidade
            ? [{ chave: 'mais-categorias', texto: `+ ${item.maisQuantidade}`, contador: true }]
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
                    testID="diary-entry-icon"
                    style={[
                        estilos.iconeRegistro,
                        {
                            borderColor: cor,
                            backgroundColor: item.apresentacaoFase.fundoIcone
                        }
                    ]}
                >
                    <NotebookIcon size={13} color={cor} weight="regular" />
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir registro de ${item.dataFormatada}${resumoAcessivel ? `. ${resumoAcessivel}` : ''}`}
                    accessibilityState={{ disabled: !podeAbrir }}
                    disabled={!podeAbrir}
                    onPress={executar(aoAbrir)}
                    style={estilos.areaData}
                >
                    <Text style={estilos.data}>{item.dataFormatada}</Text>
                </Pressable>
                <View style={estilos.acoes}>
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
                            <View style={estilos.chips}>
                                {linhasChips.map((linha, indiceLinha) => (
                                    <View
                                        key={`linha-${indiceLinha}`}
                                        testID="diary-entry-chip-row"
                                        style={estilos.linhaChips}
                                    >
                                        {linha.map((chip) =>
                                            chip.contador ? (
                                                <View
                                                    key={chip.chave}
                                                    accessible
                                                    accessibilityLabel={`${item.maisQuantidade} outras categorias marcadas`}
                                                    style={estilos.chip}
                                                >
                                                    <PlusCircleIcon
                                                        accessible={false}
                                                        size={10.89}
                                                        color={tema.cores.interface.textoPrincipal}
                                                    />
                                                    <Text style={estilos.textoChip}>
                                                        {chip.texto}
                                                    </Text>
                                                </View>
                                            ) : (
                                                <ChipPrincipal
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

                    {item.trechoAnotacao ? (
                        <View style={estilos.anotacao}>
                            <Text style={estilos.rotuloSecao}>ANOTAÇÃO DO DIA</Text>
                            <Text numberOfLines={3} style={estilos.textoAnotacao}>
                                {item.trechoAnotacao}
                            </Text>
                        </View>
                    ) : null}
                </Pressable>
            ) : null}

            <View
                accessible
                accessibilityLabel={rotulo}
                style={[estilos.fase, { backgroundColor: item.apresentacaoFase.fundo }]}
            >
                <ArrowsClockwiseIcon size={13} color={cor} />
                <Text style={[estilos.textoFase, { color: cor }]}>{rotulo}</Text>
            </View>
        </View>
    );
}

function ChipPrincipal({ principal, estilos, tema }) {
    const macro = obterApresentacaoMacrocategoria(principal.macrocategoriaId);
    const cor = obterCorMacrocategoria(tema, principal.macrocategoriaId);
    const IconeMacro = macro.icone;
    return (
        <View style={estilos.chip}>
            <IconeMacro
                accessible={false}
                size={10.89}
                color={cor}
                weight={macro.iconeProps?.weight ?? 'regular'}
            />
            <Text style={estilos.textoChip}>{principal.valor.trim()}</Text>
        </View>
    );
}

const MemoizedDiaryEntryCard = memo(DiaryEntryCard);

export {
    ChipPrincipal,
    MemoizedDiaryEntryCard as DiaryEntryCard,
    limitarTrechoAnotacao,
    normalizarRegistro,
    organizarChipsEmLinhas
};
