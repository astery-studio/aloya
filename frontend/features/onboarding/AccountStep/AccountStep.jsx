/**
 * Etapa de criação da conta que coleta credenciais e aceite dos termos.
 */
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CheckIcon as Check } from 'phosphor-react-native/src/icons/Check';
import Button from '../../../components/common/Button/Button';
import EmailInput from '../../../components/forms/EmailInput';
import PasswordInput from '../../../components/forms/PasswordInput';
import TextInput from '../../../components/forms/TextInput';
import AuthLayout from '../../../layouts/AuthLayout/AuthLayout';
import { cores } from '../../../theme';
import { estilos } from './AccountStep.styles';

export default function AccountStep({ dados, aoAlterar, aoAvancar,
    aoVoltar, aoEntrar, carregando, erros = {} }) {
    const alterarNome = useCallback((nome) => aoAlterar({ nome }), [aoAlterar]);
    const alterarEmail = useCallback((email) => aoAlterar({ email }), [aoAlterar]);
    const alterarSenha = useCallback((senha) => aoAlterar({ senha }), [aoAlterar]);
    const alterarConfirmacao = useCallback(
        (confirmacao) => aoAlterar({ confirmacao }), [aoAlterar]
    );
    const preenchido = Boolean(dados.nome.trim() && dados.email.trim()
        && dados.senha && dados.confirmacao && dados.aceitouTermos);
    const rodape = <View style={estilos.rodape}>
        <View style={estilos.separador}><View style={estilos.linha} />
            <Text style={estilos.legenda}>Já tem uma conta?</Text><View style={estilos.linha} /></View>
        <Button texto="Entrar" variante="bordaLaranja" tamanho="compacto" aoPressionar={aoEntrar} />
    </View>;

    return (
        <AuthLayout titulo="Bem-vindo(a)!" aoVoltar={aoVoltar}
            descricao="Que bom ter você aqui. Crie sua conta para começar."
            rodape={rodape}>
            <View style={estilos.campos}>
                <TextInput label="Nome" placeholder="Nome" value={dados.nome}
                    sanitizar={(texto) => texto
                        .replace(/[^\p{L} -]/gu, '')
                        .replace(/\s+/g, ' ')}
                    erro={erros.nome} onChangeText={alterarNome} />
                <EmailInput value={dados.email} erro={erros.email}
                    onChangeText={alterarEmail} />
                <PasswordInput value={dados.senha} erro={erros.senha}
                    onChangeText={alterarSenha} />
                <PasswordInput label="Confirmar senha" value={dados.confirmacao}
                    erro={erros.confirmacao} onChangeText={alterarConfirmacao} />
            </View>
            <Pressable accessibilityRole="checkbox"
                accessibilityState={{ checked: dados.aceitouTermos }}
                onPress={() => aoAlterar({ aceitouTermos: !dados.aceitouTermos })}
                style={estilos.termos}>
                <View style={[estilos.caixa, dados.aceitouTermos && estilos.caixaMarcada]}>
                    {dados.aceitouTermos ? <Check size={11} weight="bold"
                        color={cores.neutras.superficieClara} /> : null}
                </View>
                <Text style={estilos.textoTermos}>Li e concordo com os{' '}
                    <Text style={estilos.linkTermos}>Termos e Política de Privacidade</Text></Text>
            </Pressable>
            <Button texto="Avançar" aoPressionar={aoAvancar}
                desativado={!preenchido} carregando={carregando} />
        </AuthLayout>
    );
}
