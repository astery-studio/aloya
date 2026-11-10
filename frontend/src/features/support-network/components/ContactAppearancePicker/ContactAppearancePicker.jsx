//Permite escolher o ícone e a cor usados para identificar um contato.
import { useMemo } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { ChecksIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import {
    COR_ICONE_NAO_SELECIONADO,
    OPCOES_COR_CONTATO,
    OPCOES_ICONE_CONTATO,
    corContatoEhValida,
    iconeContatoEhValido
} from '../../constants/contactAppearanceOptions';
import { ICONES_POR_ID } from '../ContactAvatar/ContactAvatar';
import { criarEstilos } from './ContactAppearancePicker.styles';

const CORES_COM_MARCADOR_ESCURO = Object.freeze(['branco', 'laranja', 'cinza']);
const ICONES_POR_LINHA = 5;

function dividirEmLinhas(opcoes, quantidadePorLinha = ICONES_POR_LINHA) {
    const linhas = [];

    for (let indice = 0; indice < opcoes.length; indice += quantidadePorLinha) {
        linhas.push(opcoes.slice(indice, indice + quantidadePorLinha));
    }

    return linhas;
}

function calcularTamanhosAparencia(larguraTela) {
    const larguraSegura = Number.isFinite(larguraTela) && larguraTela > 0 ? larguraTela : 390;

    const larguraDisponivel = Math.max(120, larguraSegura - 40);

    const tamanhoQuadroIcone = Math.min(
        34,
        Math.max(24, Math.floor(larguraDisponivel / ICONES_POR_LINHA))
    );

    const tamanhoQuadroCor = Math.min(
        34,
        Math.max(22, Math.floor(larguraDisponivel / OPCOES_COR_CONTATO.length))
    );

    const tamanhoIcone =
        tamanhoQuadroIcone === 34 ? 18 : Math.max(13, Math.floor((tamanhoQuadroIcone * 18) / 34));

    return Object.freeze({
        tamanhoQuadroIcone,
        tamanhoQuadroCor,
        tamanhoIcone
    });
}

function obterCorMarcador(corId) {
    return CORES_COM_MARCADOR_ESCURO.includes(corId) ? '#222222' : '#FFFFFF';
}

function ContactAppearancePicker({ iconeId, corId, aoAlterar, desabilitado = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const { width: larguraTela } = useWindowDimensions();

    const tamanhos = useMemo(() => calcularTamanhosAparencia(larguraTela), [larguraTela]);

    const linhasDeIcones = useMemo(() => dividirEmLinhas(OPCOES_ICONE_CONTATO), []);

    const iconeSelecionado = iconeContatoEhValido(iconeId) ? iconeId : null;

    const corSelecionada = corContatoEhValida(corId) ? corId : null;

    const bloqueado = desabilitado || typeof aoAlterar !== 'function';

    function selecionarIcone(novoIconeId) {
        if (bloqueado || novoIconeId === iconeSelecionado) {
            return;
        }

        aoAlterar({
            iconeId: novoIconeId,
            corId: corSelecionada
        });
    }

    function selecionarCor(novaCorId) {
        if (bloqueado || novaCorId === corSelecionada) {
            return;
        }

        aoAlterar({
            iconeId: iconeSelecionado,
            corId: novaCorId
        });
    }

    return (
        <View testID="contact-appearance-picker" style={estilos.container}>
            <View style={estilos.secao}>
                <Text style={estilos.titulo}>Ícone do Contato</Text>

                <View
                    accessibilityRole="radiogroup"
                    accessibilityLabel="Ícone do Contato"
                    style={estilos.gradeIcones}
                >
                    {linhasDeIcones.map((linha, indiceLinha) => (
                        <View
                            key={`linha-icones-${indiceLinha}`}
                            testID={`linha-icones-contato-${indiceLinha + 1}`}
                            style={estilos.linhaIcones}
                        >
                            {linha.map((opcao) => {
                                const Icone = ICONES_POR_ID[opcao.id];
                                const selecionado = opcao.id === iconeSelecionado;

                                return (
                                    <Pressable
                                        key={opcao.id}
                                        testID={`opcao-icone-contato-${opcao.id}`}
                                        accessibilityRole="radio"
                                        accessibilityLabel={opcao.rotulo}
                                        accessibilityState={{
                                            checked: selecionado,
                                            disabled: bloqueado
                                        }}
                                        disabled={bloqueado}
                                        onPress={() => selecionarIcone(opcao.id)}
                                        style={({ pressed }) => [
                                            estilos.opcaoIcone,
                                            {
                                                width: tamanhos.tamanhoQuadroIcone,
                                                height: tamanhos.tamanhoQuadroIcone
                                            },
                                            selecionado && estilos.opcaoIconeSelecionada,
                                            pressed && !bloqueado && estilos.opcaoPressionada,
                                            bloqueado && estilos.opcaoDesabilitada
                                        ]}
                                    >
                                        <Icone
                                            testID={`icone-opcao-contato-${opcao.id}`}
                                            size={tamanhos.tamanhoIcone}
                                            color={
                                                selecionado
                                                    ? tema.cores.interface.textoSobreDestaque
                                                    : COR_ICONE_NAO_SELECIONADO
                                            }
                                            weight="regular"
                                        />
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            <View style={estilos.secao}>
                <Text style={estilos.titulo}>Cor do Ícone</Text>

                <View
                    testID="linha-cores-contato"
                    accessibilityRole="radiogroup"
                    accessibilityLabel="Cor do Ícone"
                    style={estilos.gradeCores}
                >
                    {OPCOES_COR_CONTATO.map((opcao) => {
                        const selecionada = opcao.id === corSelecionada;

                        return (
                            <Pressable
                                key={opcao.id}
                                testID={`opcao-cor-contato-${opcao.id}`}
                                accessibilityRole="radio"
                                accessibilityLabel={opcao.rotulo}
                                accessibilityState={{
                                    checked: selecionada,
                                    disabled: bloqueado
                                }}
                                disabled={bloqueado}
                                onPress={() => selecionarCor(opcao.id)}
                                style={({ pressed }) => [
                                    estilos.opcaoCor,
                                    {
                                        width: tamanhos.tamanhoQuadroCor,
                                        height: tamanhos.tamanhoQuadroCor,
                                        minWidth: tamanhos.tamanhoQuadroCor,
                                        minHeight: tamanhos.tamanhoQuadroCor,
                                        maxWidth: tamanhos.tamanhoQuadroCor,
                                        maxHeight: tamanhos.tamanhoQuadroCor,
                                        backgroundColor:
                                            opcao.id === 'branco' ? opcao.fundo : opcao.cor,
                                        borderColor: opcao.borda
                                    },
                                    selecionada && estilos.opcaoCorSelecionada,
                                    pressed && !bloqueado && estilos.opcaoPressionada,
                                    bloqueado && estilos.opcaoDesabilitada
                                ]}
                            >
                                {selecionada ? (
                                    <ChecksIcon
                                        testID={`marcador-cor-contato-${opcao.id}`}
                                        size={Math.min(18, tamanhos.tamanhoQuadroCor - 8)}
                                        color={obterCorMarcador(opcao.id)}
                                        weight="bold"
                                    />
                                ) : null}
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

export {
    CORES_COM_MARCADOR_ESCURO,
    ContactAppearancePicker,
    calcularTamanhosAparencia,
    dividirEmLinhas,
    obterCorMarcador
};
