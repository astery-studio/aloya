import { AppError } from '../../../shared/errors/AppError.js';
import { formatarData, paraDataCalendario } from '../utils/calendar.js';

const CAMPOS_PERMITIDOS = Object.freeze(['dataInicio', 'dataFim']);

function erro(mensagem, codigo, status = 422) {
    return new AppError(mensagem, status, codigo);
}

function validarIdCiclo(valor) {
    if (typeof valor !== 'string' || !/^[1-9]\d*$/.test(valor)) {
        throw erro('O identificador do ciclo é inválido.', 'ID_CICLO_INVALIDO', 400);
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw erro('O identificador do ciclo é inválido.', 'ID_CICLO_INVALIDO', 400);
    }

    return id;
}

function validarData(valor, campo, hoje) {
    if (campo === 'dataFim' && valor === null) {
        return null;
    }

    try {
        const texto = formatarData(valor);
        const data = paraDataCalendario(texto);

        if (data > hoje) {
            throw erro(
                'Não é possível registrar menstruação em uma data futura.',
                'DATA_CICLO_FUTURA'
            );
        }

        return data;
    } catch (falha) {
        if (falha instanceof AppError) {
            throw falha;
        }

        throw erro(`O campo "${campo}" deve usar o formato AAAA-MM-DD.`, 'DATA_CICLO_INVALIDA');
    }
}

function criarCycleEditValidator({ agora = () => new Date() } = {}) {
    function validarCorpo(body) {
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw erro('Os dados da edição são inválidos.', 'EDICAO_CICLO_INVALIDA', 400);
        }

        const campos = Object.keys(body);
        const desconhecido = campos.find((campo) => !CAMPOS_PERMITIDOS.includes(campo));

        if (desconhecido) {
            throw erro(`O campo "${desconhecido}" não é permitido.`, 'CAMPOS_CICLO_NAO_PERMITIDOS');
        }

        if (campos.length === 0) {
            throw erro('Informe ao menos uma data para editar.', 'EDICAO_CICLO_VAZIA');
        }

        const hoje = paraDataCalendario(formatarData(agora()));
        const dados = {};

        for (const campo of campos) {
            dados[campo] = validarData(body[campo], campo, hoje);
        }

        if (dados.dataInicio && dados.dataFim && dados.dataInicio > dados.dataFim) {
            throw erro(
                'A data de início não pode ser posterior à data de término.',
                'ORDEM_DATAS_CICLO_INVALIDA'
            );
        }

        return dados;
    }

    return { validarIdCiclo, validarCorpo };
}

export { criarCycleEditValidator, validarIdCiclo };
