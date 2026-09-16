import TextInput from './TextInput';

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
        />
    );
}
