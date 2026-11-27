/**
 * Tela dedicada à escolha definitiva do tipo de conta após os dados pessoais.
 */
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import Button from '../../../../shared/components/common/Button/Button';
import { ArrowLeftIcon as ArrowLeft } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import FormLayout from '../../../../shared/layouts/FormLayout/FormLayout';
import { criarEstilos } from './UserTypeStep.styles';

export default function UserTypeStep({ tipoUsuario, aoSelecionar, aoVoltar, carregando = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const cabecalho = (
        <View style={estilos.cabecalho}>
            <Pressable
                accessibilityLabel="Voltar"
                accessibilityRole="button"
                accessibilityState={{ disabled: carregando }}
                disabled={carregando}
                hitSlop={12}
                onPress={aoVoltar}
                style={estilos.botaoVoltar}
            >
                <ArrowLeft
                    color={tema.escuro ? '#999999' : tema.cores.interface.textoSecundario}
                    size={32}
                />
            </Pressable>
        </View>
    );

    return (
        <FormLayout
            cabecalho={cabecalho}
            centralizado
            corFundo={tema.escuro ? '#1E1E1E' : undefined}
            testeId="user-type-step"
        >
            <View style={estilos.conteudo}>
                <View style={estilos.textos}>
                    <Text style={estilos.titulo}>Qual tipo de usuário você é?</Text>
                    <Text style={estilos.descricao}>Isso não poderá ser alterado.</Text>
                </View>

                <View style={estilos.acoes}>
                    <Button
                        carregando={carregando && tipoUsuario === 'principal'}
                        desativado={carregando && tipoUsuario !== 'principal'}
                        texto="Usuário que vivencia o ciclo"
                        aoPressionar={() => aoSelecionar('principal')}
                    />
                    <Button
                        carregando={carregando && tipoUsuario === 'contato_apoio'}
                        desativado={carregando && tipoUsuario !== 'contato_apoio'}
                        texto="Usuário da rede de apoio"
                        variante="verde"
                        aoPressionar={() => aoSelecionar('contato_apoio')}
                    />
                </View>
            </View>
        </FormLayout>
    );
}
