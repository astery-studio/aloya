/**
 * Centraliza os identificadores das rotas usadas pela navegação.
 */
//Guarda os nomes das telas usados pela navegação.

const rotas = Object.freeze({
    boasVindas: 'WelcomeScreen',
    login: 'LoginScreen',
    recuperarSenha: 'ForgotPasswordScreen',
    redefinirSenha: 'ResetPasswordScreen',
    onboarding: 'OnboardingScreen',
    configuracoes: 'SettingsScreen',
    perfil: 'ProfileSettingsScreen',
    alterarSenha: 'ChangePasswordScreen',
    anticoncepcionais: 'ContraceptivesScreen',
    novoAnticoncepcional: 'NewContraceptiveScreen'
})

export { rotas }
