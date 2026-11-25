import { AppError } from '../../shared/errors/AppError.js';

const grupos = {
    'ciclo.menstrual': 'proxima confirmacao',
    'ciclo.fases': 'menstrual folicular ovulatoria lutea',
    'ciclo.dicas': 'menstrual folicular ovulatoria lutea',
    'ciclo.diario': 'resumoSemanal comparacaoPeriodos',
    'anticoncepcional.rotina': 'horario inicioPausa fimPausa retomada',
    'anticoncepcional.naoConfirmado': 'aviso moderados criticos fimJanela',
    'anticoncepcional.injetavel': 'proxima hoje',
    'anticoncepcional.adesivo': 'troca retirada novo',
    'anticoncepcional.anel': 'retirada insercao troca',
    'anticoncepcional.diu': 'proxima data',
    'anticoncepcional.validade': 'proxima atingida',
    'redeApoio.convites': 'recebido respondido renovado acessoAtualizado acessoRevogado proximoExpiracao expirado contaExcluida',
    'redeApoio.ciclo': 'registro resumo',
    'redeApoio.diario': 'ciclo corpo emocional energia vidaIntima saude',
    'redeApoio.consentimento': 'confirmado expirado',
    'redeApoio.anticoncepcional': 'horario naoConfirmado moderados criticos fimJanela aplicacoesTrocas'
};

export const camposExistentes = Object.freeze({
    lembreteDiarioAtivo: true,
    horarioLembreteDiario: '20:00',
    antecedenciaProximoCiclo: 2
});

export const valoresIniciais = Object.freeze({
    ...Object.fromEntries(Object.entries(grupos).flatMap(([grupo, eventos]) => [
        [grupo, true], ...eventos.split(' ').map((evento) => [`${grupo}.${evento}`, false])
    ])),
    ...camposExistentes
});

export function validarAlteracao(entrada) {
    const chave = entrada?.chave;
    const valor = entrada?.valor;
    const padrao = Object.hasOwn(valoresIniciais, chave) ? valoresIniciais[chave] : undefined;
    const valido = typeof chave === 'string' && typeof valor === typeof padrao && (
        typeof valor === 'boolean' ||
        (typeof valor === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(valor)) ||
        (Number.isInteger(valor) && valor >= 0 && valor <= 5)
    );
    if (!valido || Object.keys(entrada).some((campo) => campo !== 'chave' && campo !== 'valor')) {
        throw new AppError('Preferência de notificação inválida.', 422, 'PREFERENCIA_NOTIFICACAO_INVALIDA');
    }
    return { chave, valor };
}
