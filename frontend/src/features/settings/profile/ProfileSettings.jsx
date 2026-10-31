// Reúne os campos e ações exibidos no conteúdo das configurações de perfil.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { NavigationField } from '../../../shared/components/common/NavigationField/NavigationField';
import { LockKeyIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { ProfileField } from './ProfileField';
import { criarEstilos } from './ProfileSettings.style';

function formatarDataNascimento(dataNascimento) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento ?? '');

    if (!partes) {
        return null;
    }

    return `${partes[3]}/${partes[2]}/${partes[1]}`;
}

function ProfileSettings({
    dados,
    onEditarCampo,
    onAlterarSenha,
    onSalvar,
    podeSalvar = false,
    salvando = false,
    bloqueado = false
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const camposBloqueados = bloqueado || salvando;
    const salvarDesativado = !podeSalvar || camposBloqueados || typeof onSalvar !== 'function';

    return (
        <View style={estilos.container}>
            <View style={estilos.secao}>
                <Text style={estilos.tituloSecao}>Dados Pessoais</Text>

                <View style={estilos.campos}>
                    <ProfileField
                        label="Nome"
                        valor={dados?.nome}
                        onPress={() => onEditarCampo?.('nome')}
                        desabilitado={camposBloqueados}
                    />

                    <ProfileField
                        label="E-mail"
                        valor={dados?.email}
                        onPress={() => onEditarCampo?.('email')}
                        desabilitado={camposBloqueados}
                    />

                    <ProfileField
                        label="Data de Nascimento"
                        valor={formatarDataNascimento(dados?.dataNascimento)}
                        onPress={() => onEditarCampo?.('dataNascimento')}
                        desabilitado={camposBloqueados}
                    />

                    <ProfileField
                        label="Identidade de Gênero"
                        valor={dados?.identidadeGenero}
                        onPress={() => onEditarCampo?.('identidadeGenero')}
                        desabilitado={camposBloqueados}
                    />
                </View>
            </View>

            <View style={estilos.secao}>
                <Text style={estilos.tituloSecao}>Segurança</Text>

                <NavigationField
                    label="Alterar Senha"
                    estilo={estilos.campoAlterarSenha}
                    icone={LockKeyIcon}
                    paleta="corAzul"
                    coresIcone={
                        tema.escuro
                            ? { caixa: 'rgba(179, 157, 219, 0.16)', icone: '#B39DDB' }
                            : undefined
                    }
                    onPress={onAlterarSenha}
                    desabilitado={camposBloqueados}
                />
            </View>

            <ButtonScreen
                texto="Salvar alterações"
                variante="verde"
                aoPressionar={onSalvar}
                desativado={salvarDesativado}
                estilo={salvarDesativado && estilos.botaoSalvarDesativado}
                estiloTexto={salvarDesativado && estilos.textoSalvarDesativado}
                carregando={salvando}
            />
        </View>
    );
}

export { ProfileSettings, formatarDataNascimento };
