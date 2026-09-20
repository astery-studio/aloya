import TextInput from './TextInput';

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
            sanitizar={(texto) => texto.trim().replace(/[\r\n\t]/g, '')}
        />
    );
}
