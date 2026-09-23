import TextInput from './TextInput';

function sanitizarEmail(texto) {
    return texto.trim().replace(/[\r\n\t]/g, '');
}

// Recebe as opções de e-mail, remove espaços e devolve o valor ao formulário.
export default function EmailInput({
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
