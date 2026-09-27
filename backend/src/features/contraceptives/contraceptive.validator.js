import { AppError } from '../../errors/AppError.js';
import { INTENSIDADES, TIPOS, obterFrequencia } from './contraceptive.constants.js';

const FORMATO_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const LIMITE_NOME = 120;
const LIMITE_HORARIOS = 24;

function dataUtc(dataTexto) {
    if (!FORMATO_DATA.test(dataTexto ?? '')) return null;
    const data = new Date(`${dataTexto}T00:00:00.000Z`);
    return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== dataTexto ? null : data;
}

function validarCadastroAnticoncepcional(entrada, hoje = new Date()) {
    const nome = typeof entrada?.nome === 'string' ? entrada.nome.trim() : '';
    if (!nome) throw new AppError('Informe o nome do anticoncepcional.', 422, 'NOME_OBRIGATORIO');
    if (nome.length > LIMITE_NOME) throw new AppError('O nome deve ter no máximo 120 caracteres.', 422, 'NOME_MUITO_LONGO');

    const tipo = entrada?.tipo;
    if (!TIPOS.has(tipo)) throw new AppError('Selecione um tipo de anticoncepcional válido.', 422, 'TIPO_INVALIDO');

    const intensidade = entrada?.intensidadeAlerta || entrada?.nivelIntensidadeAlerta || 'critico';
    if (!INTENSIDADES.has(intensidade)) throw new AppError('Selecione uma intensidade de alerta válida.', 422, 'INTENSIDADE_INVALIDA');

    if (tipo === 'diu_hormonal') {
        const validade = dataUtc(entrada.dataValidade);
        const hojeIso = hoje.toISOString().slice(0, 10);
        if (!validade || entrada.dataValidade < hojeIso) {
            throw new AppError('Informe uma data de validade igual ou posterior à data atual.', 422, 'VALIDADE_INVALIDA');
        }
        return { nome, tipo, intensidade, horarios: [], frequencia: null, dataPrimeiroUso: null, dataValidade: validade };
    }

    const regraFrequencia = obterFrequencia(tipo, entrada.frequenciaId || entrada.frequencia);
    if (!regraFrequencia) throw new AppError('Selecione uma frequência compatível com o tipo informado.', 422, 'FREQUENCIA_INVALIDA');

    const horarios = Array.isArray(entrada.horarios) ? entrada.horarios : entrada.horariosProgramados;
    if (!Array.isArray(horarios) || horarios.length === 0 || horarios.every((horario) => !horario)) {
        throw new AppError('Informe ao menos um horário de uso.', 422, 'HORARIO_OBRIGATORIO');
    }
    if (horarios.length > LIMITE_HORARIOS) {
        throw new AppError('Informe no máximo 24 horários de uso.', 422, 'LIMITE_HORARIOS_EXCEDIDO');
    }
    if (horarios.some((horario) => !FORMATO_HORARIO.test(horario))) {
        throw new AppError('Informe os horários no formato HH:mm.', 422, 'HORARIO_INVALIDO');
    }
    if (new Set(horarios).size !== horarios.length) throw new AppError('Não informe horários repetidos.', 422, 'HORARIO_REPETIDO');
    if (!(tipo === 'pilula' && regraFrequencia.periodicidade === 'diaria') && horarios.length !== 1) {
        throw new AppError('Este tipo de anticoncepcional aceita exatamente um horário.', 422, 'QUANTIDADE_HORARIOS_INVALIDA');
    }

    let primeiroUso = entrada.dataPrimeiroUso ? dataUtc(entrada.dataPrimeiroUso) : null;
    if (regraFrequencia.diasPausa && !primeiroUso) {
        throw new AppError('Informe a data do primeiro uso.', 422, 'PRIMEIRO_USO_OBRIGATORIO');
    }
    primeiroUso ??= new Date(`${hoje.toISOString().slice(0, 10)}T00:00:00.000Z`);

    return {
        nome, tipo, intensidade, horarios: [...horarios].sort(), regraFrequencia,
        frequencia: regraFrequencia.valor, dataPrimeiroUso: primeiroUso, dataValidade: null
    };
}

export { dataUtc, validarCadastroAnticoncepcional };
