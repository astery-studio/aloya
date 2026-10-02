//Executa cadastro, listagem e edição segura dos anticoncepcionais da usuária autenticada.
import { AppError } from '../../shared/errors/AppError.js';
import { calcularPeriodosPausa } from './contraceptive.schedule.js';
import { apresentarAnticoncepcional } from './contraceptive.presenter.js';
import {
    validarCadastroAnticoncepcional,
    validarEdicaoAnticoncepcional,
    validarIdAnticoncepcional
} from './contraceptive.validator.js';

//Recebe os dados normalizados e devolve somente os campos permitidos para persistência.
function prepararDadosPersistencia(dados) {
    const periodosPausa = dados.regraFrequencia
        ? calcularPeriodosPausa(dados.dataPrimeiroUso, dados.regraFrequencia)
        : [];

    return {
        nome: dados.nome,
        tipo: dados.tipo,
        horariosProgramados: dados.horarios,
        frequencia: dados.frequencia,
        dataInicioUso: dados.dataPrimeiroUso,
        periodosPausa,
        dataValidade: dados.dataValidade,
        nivelIntensidadeAlerta: dados.intensidade
    };
}

//Recebe duas datas opcionais e informa se representam o mesmo instante.
function datasSaoIguais(dataAtual, dataNova) {
    if (dataAtual === null && dataNova === null) return true;
    if (!(dataAtual instanceof Date) || !(dataNova instanceof Date)) return false;
    return dataAtual.getTime() === dataNova.getTime();
}

//Recebe dois valores JSON e informa se possuem o mesmo conteúdo normalizado.
function valoresJsonSaoIguais(valorAtual, valorNovo) {
    return JSON.stringify(valorAtual) === JSON.stringify(valorNovo);
}

//Compara o registro atual com os dados normalizados e informa se existe alteração real.
function possuiAlteracaoReal(registroAtual, dadosNovos) {
    return registroAtual.nome !== dadosNovos.nome
        || registroAtual.tipo !== dadosNovos.tipo
        || !valoresJsonSaoIguais(registroAtual.horariosProgramados, dadosNovos.horariosProgramados)
        || registroAtual.frequencia !== dadosNovos.frequencia
        || !datasSaoIguais(registroAtual.dataInicioUso, dadosNovos.dataInicioUso)
        || !valoresJsonSaoIguais(registroAtual.periodosPausa, dadosNovos.periodosPausa)
        || !datasSaoIguais(registroAtual.dataValidade, dadosNovos.dataValidade)
        || registroAtual.nivelIntensidadeAlerta !== dadosNovos.nivelIntensidadeAlerta;
}

//Recebe o Prisma e um relógio injetável e devolve as operações de anticoncepcionais.
function criarContraceptiveService(prisma, relogio = () => new Date()) {
    //Valida e cadastra um anticoncepcional vinculado exclusivamente à usuária autenticada.
    async function cadastrar(usuarioId, entrada) {
        const dados = validarCadastroAnticoncepcional(entrada, relogio());
        const dadosPersistencia = prepararDadosPersistencia(dados);

        const registro = await prisma.anticoncepcional.create({
            data: {
                usuarioId,
                ...dadosPersistencia
            }
        });

        return apresentarAnticoncepcional(registro, relogio());
    }

    //Lista somente os anticoncepcionais pertencentes à usuária autenticada.
    async function listar(usuarioId) {
        const registros = await prisma.anticoncepcional.findMany({
            where: {usuarioId},
            orderBy: {criadoEm: 'desc'}
        });

        return registros.map((registro) => apresentarAnticoncepcional(registro, relogio()));
    }

    //Atualiza somente um anticoncepcional da usuária e impede sobrescrita concorrente.
    async function editar(usuarioId, idRecebido, entrada) {
        const id = validarIdAnticoncepcional(idRecebido);
        const dados = validarEdicaoAnticoncepcional(entrada, relogio());
        const dadosPersistencia = prepararDadosPersistencia(dados);

        return prisma.$transaction(async (transacao) => {
            const registroAtual = await transacao.anticoncepcional.findFirst({
                where: {
                    id,
                    usuarioId
                }
            });

            if (!registroAtual) {
                throw new AppError('Anticoncepcional não encontrado.', 404, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
            }

            if (!possuiAlteracaoReal(registroAtual, dadosPersistencia)) {
                throw new AppError('Faça ao menos uma alteração antes de salvar.', 422, 'SEM_ALTERACOES');
            }

            const resultado = await transacao.anticoncepcional.updateMany({
                where: {
                    id,
                    usuarioId,
                    atualizadoEm: registroAtual.atualizadoEm
                },
                data: dadosPersistencia
            });

            if (resultado.count !== 1) {
                throw new AppError('O anticoncepcional foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_EDICAO');
            }

            const registroAtualizado = await transacao.anticoncepcional.findFirst({
                where: {
                    id,
                    usuarioId
                }
            });

            if (!registroAtualizado) {
                throw new AppError('O anticoncepcional foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_EDICAO');
            }

            return apresentarAnticoncepcional(registroAtualizado, relogio());
        });
    }

    return {
        cadastrar,
        listar,
        editar
    };
}

export { criarContraceptiveService };