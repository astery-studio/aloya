//Reúne os campos e ações exibidos no conteúdo das configurações de perfil.
import { Text, View } from 'react-native'
import { LockKeyIcon } from 'phosphor-react-native/src/icons/LockKey'
import ButtonScreen from '../../../components/common/Button/ButtonScreen'
import { NavigationField } from '../../../components/common/NavigationField/NavigationField'
import { ProfileField } from './ProfileField'
import { estilos } from './ProfileSettings.style'

function formatarDataNascimento(dataNascimento) {
    const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dataNascimento ?? '')

    if (!partes) {
        return null
    }

    return `${partes[3]}/${partes[2]}/${partes[1]}`
}

function ProfileSettings({dados, onEditarCampo, onAlterarSenha, onSalvar, podeSalvar = false, salvando = false, bloqueado = false}) {
    const camposBloqueados = bloqueado || salvando

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
                    icone={LockKeyIcon}
                    paleta="corAzul"
                    onPress={onAlterarSenha}
                    desabilitado={camposBloqueados}
                />
            </View>

            <ButtonScreen
                texto="Salvar alterações"
                aoPressionar={onSalvar}
                desativado={!podeSalvar || camposBloqueados}
                carregando={salvando}
            />
        </View>
    )
}

export { ProfileSettings }