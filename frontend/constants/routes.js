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
    selecaoFluxo: 'FlowSelectionScreen',
    configuracoes: 'SettingsScreen',
    perfil: 'ProfileSettingsScreen',
    alterarSenha: 'ChangePasswordScreen',
    novaCategoria: 'NewSupportCategoryScreen'
})

export {rotas}