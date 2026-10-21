//Valida e normaliza os dados permitidos no cadastro e na edição de anticoncepcionais.
import { AppError } from '../../../shared/errors/AppError.js';
import { INTENSIDADES, TIPOS, obterFrequencia } from '../constants/contraceptive.constants.js';

const FORMATO_HORARIO = /^([01]\d|2[0-3]):[0-5]\d$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_ID = /^[1-9]\d*$/;
const LIMITE_NOME = 120;
const LIMITE_HORARIOS = 24;

const CAMPOS_PERMITIDOS_EDICAO = new Set([
    'nome',
    'tipo',
    'frequenciaId',
    'horarios',
    'dataPrimeiroUso',
    'dataValidade',
    'intensidadeAlerta'
]);

//Recebe um valor e informa se ele é um objeto simples seguro para validação.
function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return false;
    const prototipo = Object.getPrototypeOf(valor);
    return prototipo === Object.prototype || prototipo === null;
}

//Recebe uma data YYYY-MM-DD e devolve uma data UTC válida ou null.
function dataUtc(dataTexto) {
    if (typeof dataTexto !== 'string' || !FORMATO_DATA.test(dataTexto)) return null;
    const data = new Date(`${dataTexto}T00:00:00.000Z`);
    return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== dataTexto ? null : data;
}

//Recebe o ID da URL e devolve um número inteiro positivo seguro.
function validarIdAnticoncepcional(idRecebido) {
    const idTexto = typeof idRecebido === 'number' ? String(idRecebido) : idRecebido;

    if (typeof idTexto !== 'string' || !FORMATO_ID.test(idTexto)) {
        throw new AppError('Identificador de anticoncepcional inválido.', 400, 'ID_ANTICONCEPCIONAL_INVALIDO');
    }

    const id = Number(idTexto);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new AppError('Identificador de anticoncepcional inválido.', 400, 'ID_ANTICONCEPCIONAL_INVALIDO');
    }

    return id;
}

//Recebe o corpo da edição e impede campos desconhecidos, internos ou protegidos.
function validarCamposPermitidosEdicao(entrada) {
    if (!ehObjetoSimples(entrada)) {
        throw new AppError('Os dados do anticoncepcional são inválidos.', 422, 'CORPO_INVALIDO');
    }

    const camposDesconhecidos = Object.keys(entrada).filter((campo) => !CAMPOS_PERMITIDOS_EDICAO.has(campo));

    if (camposDesconhecidos.length > 0) {
        throw new AppError('Apenas os dados permitidos do anticoncepcional podem ser alterados.', 422, 'CAMPOS_NAO_PERMITIDOS');
    }
}

//Recebe uma data de validade e garante que ela seja real e não esteja vencida.
function validarDataValidade(dataRecebida, hoje) {
    const validade = dataUtc(dataRecebida);
    const hojeIso = hoje.toISOString().slice(0, 10);

    if (!validade || dataRecebida < hojeIso) {
        throw new AppError('Informe uma data de validade igual ou posterior à data atual.', 422, 'VALIDADE_INVALIDA');
    }

    return validade;
}

//Recebe os campos comuns e devolve somente dados normalizados para persistência.
function validarDadosAnticoncepcional(entrada, hoje, permitirAliases, aplicarIntensidadePadrao) {
    const nome = typeof entrada?.nome === 'string' ? entrada.nome.trim() : '';

    if (!nome) throw new AppError('Informe o nome do anticoncepcional.', 422, 'NOME_OBRIGATORIO');
    if (nome.length > LIMITE_NOME) throw new AppError('O nome deve ter no máximo 120 caracteres.', 422, 'NOME_MUITO_LONGO');

    const tipo = entrada?.tipo;

    if (!TIPOS.has(tipo)) {
        throw new AppError('Selecione um tipo de anticoncepcional válido.', 422, 'TIPO_INVALIDO');
    }

    const intensidadeRecebida = permitirAliases
        ? entrada?.intensidadeAlerta || entrada?.nivelIntensidadeAlerta
        : entrada?.intensidadeAlerta;
    const intensidade = intensidadeRecebida || (aplicarIntensidadePadrao ? 'critico' : null);

    if (!INTENSIDADES.has(intensidade)) {
        throw new AppError('Selecione uma intensidade de alerta válida.', 422, 'INTENSIDADE_INVALIDA');
    }

    if (tipo === 'diu_hormonal') {
        return {
            nome,
            tipo,
            intensidade,
            horarios: [],
            frequencia: null,
            regraFrequencia: null,
            dataPrimeiroUso: null,
            dataValidade: validarDataValidade(entrada.dataValidade, hoje)
        };
    }

    const frequenciaRecebida = permitirAliases ? entrada?.frequenciaId || entrada?.frequencia : entrada?.frequenciaId;
    const regraFrequencia = obterFrequencia(tipo, frequenciaRecebida);

    if (!regraFrequencia) {
        throw new AppError('Selecione uma frequência compatível com o tipo informado.', 422, 'FREQUENCIA_INVALIDA');
    }

    const horarios = permitirAliases && !Array.isArray(entrada?.horarios) ? entrada?.horariosProgramados : entrada?.horarios;

    if (!Array.isArray(horarios) || horarios.length === 0) {
        throw new AppError('Informe ao menos um horário de uso.', 422, 'HORARIO_OBRIGATORIO');
    }

    if (horarios.length > LIMITE_HORARIOS) {
        throw new AppError('Informe no máximo 24 horários de uso.', 422, 'LIMITE_HORARIOS_EXCEDIDO');
    }

    const possuiHorarioInvalido = Array.from({length: horarios.length}, (_, indice) => indice).some((indice) => !Object.hasOwn(horarios, indice) || typeof horarios[indice] !== 'string' || !FORMATO_HORARIO.test(horarios[indice]));

    if (possuiHorarioInvalido) {
        throw new AppError('Informe os horários no formato HH:mm.', 422, 'HORARIO_INVALIDO');
    }

    if (new Set(horarios).size !== horarios.length) {
        throw new AppError('Não informe horários repetidos.', 422, 'HORARIO_REPETIDO');
    }

    if (!(tipo === 'pilula' && regraFrequencia.periodicidade === 'diaria') && horarios.length !== 1) {
        throw new AppError('Este tipo de anticoncepcional aceita exatamente um horário.', 422, 'QUANTIDADE_HORARIOS_INVALIDA');
    }

    let dataPrimeiroUso = entrada?.dataPrimeiroUso ? dataUtc(entrada.dataPrimeiroUso) : null;

    if (regraFrequencia.diasPausa && !dataPrimeiroUso) {
        throw new AppError('Informe a data do primeiro uso.', 422, 'PRIMEIRO_USO_OBRIGATORIO');
    }

    dataPrimeiroUso ??= new Date(`${hoje.toISOString().slice(0, 10)}T00:00:00.000Z`);

    return {
        nome,
        tipo,
        intensidade,
        horarios: [...horarios].sort(),
        regraFrequencia,
        frequencia: regraFrequencia.valor,
        dataPrimeiroUso,
        dataValidade: null
    };
}

//Recebe o cadastro e preserva os aliases públicos já aceitos pela HU-020.
function validarCadastroAnticoncepcional(entrada, hoje = new Date()) {
    return validarDadosAnticoncepcional(entrada, hoje, true, true);
}

//Recebe a edição completa e aceita somente o contrato público canônico da HU-021.
function validarEdicaoAnticoncepcional(entrada, hoje = new Date()) {
    validarCamposPermitidosEdicao(entrada);
    return validarDadosAnticoncepcional(entrada, hoje, false, false);
}

export {
    FORMATO_HORARIO,
    dataUtc,
    validarCadastroAnticoncepcional,
    validarEdicaoAnticoncepcional,
    validarIdAnticoncepcional
};
