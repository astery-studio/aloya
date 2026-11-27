import { exemplosCycle } from './notificationPreviewCycle';
import { exemplosContraceptive } from './notificationPreviewContraceptive';
import { exemplosSupport } from './notificationPreviewSupport';

const exemplos = { ...exemplosCycle, ...exemplosContraceptive, ...exemplosSupport };

export function conteudoDaPrevia(codigo, rotulo) {
    const ilustracaoFase = codigo.replace('ciclo.dicas.', 'ciclo.fases.');
    const [title, body] = exemplos[ilustracaoFase] ?? [];
    const notaEducativa = ilustracaoFase.startsWith('ciclo.fases.')
        ? ' As informações são educativas. As manifestações podem variar de pessoa para pessoa e de ciclo para ciclo.'
        : '';
    return {
        title:
            title ??
            (codigo.startsWith('ciclo.fases.') ? 'Uma nova fase do seu ciclo começou!' : rotulo),
        body: body
            ? body + notaEducativa
            : `${rotulo}. Exemplo para verificar a apresentação no aparelho.`,
        data: { previaLocal: true }
    };
}
