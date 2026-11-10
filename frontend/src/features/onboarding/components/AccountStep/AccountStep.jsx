/**
 * Etapa de criação da conta que coleta credenciais e aceite dos termos.
 */
import { useCallback, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Button from '../../../../shared/components/common/Button/Button';
import { CheckIcon as Check } from '../../../../shared/components/icons/AppIcons';
import EmailInput from '../../../../shared/components/forms/EmailInput';
import PasswordInput from '../../../../shared/components/forms/PasswordInput';
import RadioOption from '../../../../shared/components/forms/RadioOption';
import TextInput from '../../../../shared/components/forms/TextInput';
import AuthLayout from '../../../../shared/layouts/AuthLayout/AuthLayout';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos } from './AccountStep.styles';

export default function AccountStep({
    dados,
    aoAlterar,
    aoAvancar,
    aoVoltar,
    aoEntrar,
    carregando,
    erros = {}
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const aparenciaCampo = tema.escuro
        ? {
              estilo: estilos.campo,
              estiloEntrada: estilos.textoCampo,
              estiloLabel: estilos.labelCampo,
              placeholderTextColor: '#999999'
          }
        : {};
    const alterarNome = useCallback((nome) => aoAlterar({ nome }), [aoAlterar]);
    const alterarEmail = useCallback((email) => aoAlterar({ email }), [aoAlterar]);
    const alterarSenha = useCallback((senha) => aoAlterar({ senha }), [aoAlterar]);
    const alterarTipoUsuario = useCallback(
        (tipoUsuario) => aoAlterar({ tipoUsuario }),
        [aoAlterar]
    );
    const alterarConfirmacao = useCallback(
        (confirmacao) => aoAlterar({ confirmacao }),
        [aoAlterar]
    );
    const preenchido = Boolean(
        dados.nome.trim() &&
        dados.email.trim() &&
        dados.senha &&
        dados.confirmacao &&
        dados.aceitouTermos
    );
    const rodape = (
        <View style={estilos.rodape}>
            <View style={estilos.separador}>
                <View style={estilos.linha} />
                <Text style={estilos.legenda}>Já tem uma conta?</Text>
                <View style={estilos.linha} />
            </View>
            <Button
                texto="Entrar"
                variante="bordaLaranja"
                estilo={estilos.botaoEntrar}
                estiloTexto={estilos.textoEntrar}
                tamanho="compacto"
                aoPressionar={aoEntrar}
            />
        </View>
    );

    return (
        <AuthLayout
            corFundo={tema.escuro ? '#1E1E1E' : undefined}
            estiloTitulo={estilos.titulo}
            estiloDescricao={estilos.labelCampo}
            corIconeVoltar={tema.escuro ? '#999999' : undefined}
            titulo="Bem-vindo(a)!"
            aoVoltar={aoVoltar}
            descricao="Que bom ter você aqui. Crie sua conta para começar."
            rodape={rodape}
        >
            <View style={estilos.campos}>
                <View accessibilityRole="radiogroup" style={estilos.tiposConta}>
                    <Text style={estilos.tituloTiposConta}>Como você usará o Aloya?</Text>

                    <RadioOption
                        titulo="Acompanhar meu ciclo"
                        descricao="Crie sua conta principal e use todos os recursos de autocuidado."
                        selecionado={dados.tipoUsuario === 'principal'}
                        aoPressionar={() => alterarTipoUsuario('principal')}
                        desativado={carregando}
                    />

                    <RadioOption
                        titulo="Participar de uma Rede de Apoio"
                        descricao="Acesse convites e acompanhe somente os dados compartilhados com você."
                        selecionado={dados.tipoUsuario === 'contato_apoio'}
                        aoPressionar={() => alterarTipoUsuario('contato_apoio')}
                        desativado={carregando}
                    />
                </View>

                <TextInput
                    {...aparenciaCampo}
                    label="Nome"
                    placeholder="Nome"
                    value={dados.nome}
                    sanitizar={(texto) => texto.replace(/[^\p{L} -]/gu, '').replace(/\s+/g, ' ')}
                    erro={erros.nome}
                    onChangeText={alterarNome}
                />
                <EmailInput
                    {...aparenciaCampo}
                    value={dados.email}
                    erro={erros.email}
                    onChangeText={alterarEmail}
                />
                <PasswordInput
                    {...aparenciaCampo}
                    corIcone={tema.escuro ? '#999999' : undefined}
                    value={dados.senha}
                    erro={erros.senha}
                    onChangeText={alterarSenha}
                />
                <PasswordInput
                    {...aparenciaCampo}
                    corIcone={tema.escuro ? '#999999' : undefined}
                    label="Confirmar senha"
                    value={dados.confirmacao}
                    erro={erros.confirmacao}
                    onChangeText={alterarConfirmacao}
                />
            </View>
            <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: dados.aceitouTermos }}
                onPress={() => aoAlterar({ aceitouTermos: !dados.aceitouTermos })}
                style={estilos.termos}
            >
                <View style={[estilos.caixa, dados.aceitouTermos && estilos.caixaMarcada]}>
                    {dados.aceitouTermos ? (
                        <Check
                            size={11}
                            weight="bold"
                            color={
                                tema.escuro ? '#121212' : tema.cores.interface.textoSobreDestaque
                            }
                        />
                    ) : null}
                </View>
                <Text style={estilos.textoTermos}>
                    Li e concordo com os{' '}
                    <Text style={estilos.linkTermos}>Termos e Política de Privacidade</Text>
                </Text>
            </Pressable>
            <Button
                texto="Avançar"
                aoPressionar={aoAvancar}
                desativado={!preenchido}
                carregando={carregando}
            />
        </AuthLayout>
    );
}
