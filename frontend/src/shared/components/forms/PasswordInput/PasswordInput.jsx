/**
 * Especializa TextInput para senhas e controla a alternância de visibilidade.
 */
import { memo, useState } from 'react';
import { Pressable } from 'react-native';
import { EyeIcon as Eye } from 'phosphor-react-native/src/icons/Eye';
import { EyeSlashIcon as EyeSlash } from 'phosphor-react-native/src/icons/EyeSlash';
import { useTheme } from '../../../hooks/useTheme';
import TextInput from '../TextInput/TextInput';

// Recebe as opções de senha, permite alternar sua visibilidade e devolve o texto.
function PasswordInput({ label = 'Senha', placeholder = label, desativado = false, ...props }) {
    const tema = useTheme();
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
                    style={{ padding: 8, marginRight: -8 }}
                >
                    <Icone size={22} color={tema.cores.interface.textoSecundario} />
                </Pressable>
            }
            {...props}
        />
    );
}

export default memo(PasswordInput);
