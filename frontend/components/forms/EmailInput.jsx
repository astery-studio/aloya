import { memo } from 'react';
import TextInput from './TextInput';

function sanitizarEmail(texto) {
    return texto.trim().replace(/[\r\n\t]/g, '');
}

// Recebe as opções de e-mail, remove espaços e devolve o valor ao formulário.
function EmailInput({
    label = 'Email', placeholder = 'Email', ...props
}) {
    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            {...props}
            sanitizar={sanitizarEmail}
        />
    );
}

export default memo(EmailInput);
/**
 * Especializa TextInput para entrada e sanitização de endereços de e-mail.
 */
