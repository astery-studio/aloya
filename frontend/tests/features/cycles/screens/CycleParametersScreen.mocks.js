const React = require('react');
const { Pressable, Text, View } = require('react-native');

const settingsLayoutModule = {
    SettingsLayout: ({ titulo, children }) =>
        React.createElement(View, null, React.createElement(Text, null, titulo), children)
};
const stateViewModule = {
    CycleParametersStateView: ({ carregando }) =>
        React.createElement(Text, null, carregando ? 'Carregando' : 'Falha')
};
const feedbackModule = {
    CycleParametersFeedback: ({ sucesso, erro }) =>
        React.createElement(Text, null, sucesso ? 'Sucesso' : erro || 'Sem retorno')
};
const formModule = {
    CycleParametersForm: ({ valores, onAlterar, onSalvar, podeSalvar }) =>
        React.createElement(
            View,
            null,
            React.createElement(Text, null, `Ciclo: ${valores.duracaoCicloInformada}`),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Alterar ciclo',
                onPress: () => onAlterar('duracaoCicloInformada', 30)
            }),
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: 'Salvar alterações',
                disabled: !podeSalvar,
                accessibilityState: { disabled: !podeSalvar },
                onPress: onSalvar
            })
        )
};

export { feedbackModule, formModule, settingsLayoutModule, stateViewModule };
