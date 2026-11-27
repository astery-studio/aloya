import { calcularIdade } from '../../shared/utils/date.utils.js';

const gruposDiario = {
    ciclo: 'ciclo',
    corpo: 'corpo',
    emocional: 'emocional',
    energia: 'energia',
    vida_intima: 'vidaIntima',
    saude: 'saude'
};

export function grupoNotificacaoDiario(permissao) {
    const [macro, categoria] = permissao.split('.');
    return categoria && Object.hasOwn(gruposDiario, macro) ? gruposDiario[macro] : undefined;
}

export function permiteAlertasCompartilhados(permissoes) {
    return (
        permissoes.includes('geral.anticoncepcionais') &&
        permissoes.includes('geral.alerta_anticoncepcional')
    );
}

export function permiteDicasCompartilhadas(titular, permissoes, agora) {
    if (!permissoes.includes('geral.dicas')) return false;
    const idade = calcularIdade(titular.dataNascimento, agora);
    return (
        idade !== null &&
        (idade >= 16 || titular.consentimentoParental?.statusConsentimento === 'liberado')
    );
}
