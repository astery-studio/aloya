/**
 * Especializa TextInput para senhas e controla a alternância de visibilidade.
 */
import { memo, useState } from 'react';
import { Pressable } from 'react-native';
import { EyeIcon as Eye } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon as EyeSlash } from 'phosphor-react-native/src/icons/EyeSlash';
import { cores } from '../../../theme';
import TextInput from '../TextInput/TextInput';
import { estilos } from '../TextInput/TextInput.styles';

// Recebe as opções de senha, permite alternar sua visibilidade e devolve o texto.
function PasswordInput({
    label = 'Senha', placeholder = label, desativado = false, ...props
}) {
    const [visivel, definirVisivel] = useState(false);
    const Icone = visivel ? Eye : EyeSlash;

    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            desativado={desativado}
            secureTextEntry={!visivel}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            acaoDireita={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
                    disabled={desativado}
                    onPress={() => definirVisivel(!visivel)}
                    style={estilos.acao}
                >
                    <Icone size={22} color={cores.neutras.textoSecundarioClaro} />
                </Pressable>
            }
            {...props}
        />
    );
}

export default memo(PasswordInput);
