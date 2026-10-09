import { AppError } from '../../../shared/errors/AppError.js';
import { dataUtc, FORMATO_HORARIO } from './contraceptive.validator.js';

const CAMPOS_PERMITIDOS = new Set(['data', 'horario', 'confirmar', 'fusoHorario']);
const DIA_MS = 86_400_000;

function validarFusoHorario(valor = 'UTC') {
    if (typeof valor !== 'string' || !valor || valor.length > 100) {
        throw new AppError('Informe um fuso horário válido.', 422, 'FUSO_HORARIO_INVALIDO');
    }
    try {
        return new Intl.DateTimeFormat('en', { timeZone: valor }).resolvedOptions().timeZone;
    } catch {
        throw new AppError('Informe um fuso horário válido.', 422, 'FUSO_HORARIO_INVALIDO');
    }
}

function formatadorNoFuso(fusoHorario) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: validarFusoHorario(fusoHorario),
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    });
}

function partesDaData(formatador, instante) {
    return Object.fromEntries(formatador.formatToParts(instante)
        .filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value]));
}

function dataDasPartes(partes) {
    return `${partes.year.padStart(4, '0')}-${partes.month}-${partes.day}`;
}

function dataLocalNoFuso(instante, fusoHorario = 'UTC') {
    return dataDasPartes(partesDaData(formatadorNoFuso(fusoHorario), instante));
}

function horarioNoFuso(instante, fusoHorario = 'UTC') {
    const partes = partesDaData(formatadorNoFuso(fusoHorario), instante);
    return `${partes.hour}:${partes.minute}`;
}

// Valida que o horário civil existe no fuso, inclusive nas transições de horário de verão.
// Na repetição do horário civil, mantém a primeira ocorrência.
function dataHoraNoFuso(data, horario, fusoHorario = 'UTC') {
    if (!dataUtc(data) || typeof horario !== 'string' || !FORMATO_HORARIO.test(horario)) return null;
    const formatador = formatadorNoFuso(fusoHorario);
    const civilUtc = new Date(`${data}T${horario}:00.000Z`).getTime();
    const deslocamentos = new Set();
    for (const dias of [-2, -1, 0, 1, 2]) {
        const amostra = new Date(civilUtc + dias * DIA_MS);
        const partes = partesDaData(formatador, amostra);
        const representacaoUtc = Date.parse(`${dataDasPartes(partes)}T${partes.hour}:${partes.minute}:${partes.second}.000Z`);
        deslocamentos.add(representacaoUtc - amostra.getTime());
    }
    const candidatos = [...deslocamentos].map((deslocamento) => new Date(civilUtc - deslocamento))
        .filter((instante) => {
            const partes = partesDaData(formatador, instante);
            return dataDasPartes(partes) === data && `${partes.hour}:${partes.minute}` === horario;
        }).sort((primeiro, segundo) => primeiro - segundo);
    return candidatos[0] ?? null;
}

function validarConfirmacaoUso(entrada) {
    if (!entrada || typeof entrada !== 'object' || Array.isArray(entrada)
        || ![Object.prototype, null].includes(Object.getPrototypeOf(entrada))) {
        throw new AppError('Os dados do uso são inválidos.', 422, 'CORPO_USO_INVALIDO');
    }
    if (Object.keys(entrada).some((campo) => !CAMPOS_PERMITIDOS.has(campo))) {
        throw new AppError('Informe somente os dados permitidos do uso.', 422, 'CAMPOS_USO_NAO_PERMITIDOS');
    }
    const dataUsoProgramado = dataUtc(entrada.data);
    if (!dataUsoProgramado) {
        throw new AppError('Informe uma data de uso válida.', 422, 'DATA_USO_INVALIDA');
    }
    if (typeof entrada.horario !== 'string' || !FORMATO_HORARIO.test(entrada.horario)) {
        throw new AppError('Informe os horários no formato HH:mm.', 422, 'HORARIO_INVALIDO');
    }
    if (typeof entrada.confirmar !== 'boolean') {
        throw new AppError('Informe se o uso deve ser confirmado ou desmarcado.', 422, 'CONFIRMACAO_USO_INVALIDA');
    }
    return {
        data: entrada.data,
        dataUsoProgramado,
        horarioProgramado: entrada.horario,
        confirmar: entrada.confirmar,
        fusoHorario: validarFusoHorario(entrada.fusoHorario)
    };
}

export { validarConfirmacaoUso, dataHoraNoFuso, dataLocalNoFuso, horarioNoFuso, validarFusoHorario };
