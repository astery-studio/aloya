//Permite escolher o ícone e a cor usados para identificar um contato.
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CheckIcon } from '../../../../shared/components/icons/AppIcons';
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

function obterCorMarcador(corId) {
    return CORES_COM_MARCADOR_ESCURO.includes(corId) ? '#222222' : '#FFFFFF';
}

function ContactAppearancePicker({ iconeId, corId, aoAlterar, desabilitado = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

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
                    {OPCOES_ICONE_CONTATO.map((opcao) => {
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
                                    selecionado && estilos.opcaoIconeSelecionada,
                                    pressed && !bloqueado && estilos.opcaoPressionada,
                                    bloqueado && estilos.opcaoDesabilitada
                                ]}
                            >
                                <Icone
                                    testID={`icone-opcao-contato-${opcao.id}`}
                                    size={22}
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
            </View>

            <View style={estilos.secao}>
                <Text style={estilos.titulo}>Cor do Ícone</Text>

                <View
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
                                        backgroundColor: opcao.cor,
                                        borderColor:
                                            opcao.id === 'branco'
                                                ? tema.cores.interface.borda
                                                : opcao.cor
                                    },
                                    selecionada && estilos.opcaoCorSelecionada,
                                    pressed && !bloqueado && estilos.opcaoPressionada,
                                    bloqueado && estilos.opcaoDesabilitada
                                ]}
                            >
                                {selecionada ? (
                                    <CheckIcon
                                        testID={`marcador-cor-contato-${opcao.id}`}
                                        size={21}
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

export { CORES_COM_MARCADOR_ESCURO, ContactAppearancePicker, obterCorMarcador };
