import { isRequired } from '../../../utils/validation/isRequired';
import { horarioValido } from '../../../utils/validation/isValidTime';
import { obterFrequencia, obterFrequencias, obterTipo } from '../constants/contraceptiveOptions';

function dataIsoHoje() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
}

function validarAnticoncepcional(dados, hoje = dataIsoHoje()) {
    if (!isRequired(dados.nome)) return 'Informe o nome do anticoncepcional.';
    if (!obterTipo(dados.tipo)) return 'Selecione o tipo de anticoncepcional.';

    if (dados.tipo === 'diu_hormonal') {
        if (!dados.dataValidade || dados.dataValidade < hoje) return 'Informe uma data de validade igual ou posterior à data atual.';
        return null;
    }

    const frequencia = obterFrequencia(dados.tipo, dados.frequenciaId);
    if (!frequencia || !obterFrequencias(dados.tipo).some((item) => item.id === dados.frequenciaId)) {
        return 'Selecione uma frequência de uso.';
    }

    const horarios = (dados.horarios ?? []).filter(Boolean);
    if (horarios.length === 0) {
        return 'Informe ao menos um horário de uso.';
    }
    if (horarios.some((horario) => !horarioValido(horario))) return 'Informe um horário de uso válido.';
    if (new Set(horarios).size !== horarios.length) return 'Não adicione horários repetidos.';
    if (!(dados.tipo === 'pilula' && frequencia.periodicidade === 'diaria') && horarios.length > 1) {
        return 'Este tipo de anticoncepcional aceita somente um horário.';
    }
    if (frequencia.diasPausa && !dados.dataPrimeiroUso) return 'Informe a data do primeiro uso.';
    return null;
}

export { dataIsoHoje, validarAnticoncepcional };
