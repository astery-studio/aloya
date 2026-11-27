import { exemplosCycle } from './notificationPreviewCycle';
import { exemplosContraceptive } from './notificationPreviewContraceptive';
import { exemplosSupport } from './notificationPreviewSupport';
import dicasPorFase from '../cycles/constants/cycleSelfCareTips.json';
import dicasDeApoio from './supportCareTips.json';

const exemplos = {
    ...exemplosCycle,
    ...exemplosContraceptive,
    ...exemplosSupport,
    'seguranca.dispositivo.novo': [null, 'Um novo dispositivo entrou na sua conta Aloya.'],
    'seguranca.senha.alterada': [null, 'A senha da sua conta Aloya foi alterada.'],
    'seguranca.email.alterado': [null, 'O e-mail da sua conta Aloya foi atualizado.'],
    'seguranca.senha.recuperacao': [null, 'Foi solicitada a recuperação da senha da sua conta.'],
    'seguranca.senha.redefinida': [null, 'A redefinição da senha da sua conta foi concluída.']
};

export function conteudoDaPrevia(codigo, rotulo) {
    if (codigo.startsWith('redeApoio.dicas.apoio.')) {
        const fase = codigo.split('.').at(-1);
        if (Object.hasOwn(dicasDeApoio, fase))
            return { ...dicasDeApoio[fase], data: { previaLocal: true } };
    }

    if (codigo.startsWith('ciclo.dicas.')) {
        const [, , fase, numero = '1'] = codigo.split('.');
        const dica = dicasPorFase[fase]?.[Number(numero) - 1];
        if (dica) return { ...dica, data: { previaLocal: true } };
    }

    const [title, body] = exemplos[codigo] ?? [];
    const notaEducativa = codigo.startsWith('ciclo.fases.')
        ? ' As informações são educativas. As manifestações podem variar de pessoa para pessoa e de ciclo para ciclo.'
        : '';
    return {
        title:
            title ??
            (codigo.startsWith('ciclo.fases.') ? 'Uma nova fase do seu ciclo começou!' : rotulo),
        body: body ? body + notaEducativa : 'Abra o Aloya para conferir os detalhes.',
        data: { previaLocal: true }
    };
}
