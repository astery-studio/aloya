//Executa cadastro, listagem, edição e remoção segura dos anticoncepcionais da usuária autenticada.
import { AppError } from '../../../shared/errors/AppError.js';
import { calcularPeriodosPausa } from '../utils/contraceptive.schedule.js';
import { apresentarAnticoncepcional } from '../presenters/contraceptive.presenter.js';
import { apresentarAnticoncepcionalListagem, ordenarAnticoncepcionaisListagem } from '../presenters/contraceptive.listing.presenter.js';
import { validarFusoHorario } from '../validators/contraceptiveUsage.validator.js';
import { sincronizarNotificacoesEdicao } from '../utils/contraceptive.notifications.js';
import {
    validarCadastroAnticoncepcional,
    validarEdicaoAnticoncepcional,
    validarIdAnticoncepcional
} from '../validators/contraceptive.validator.js';

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

    //Lista os registros e seus usos sem produzir gravações durante a leitura.
    async function listar(usuarioId, { incluirRemovidos = false, fusoHorario = 'UTC' } = {}) {
        const fuso = validarFusoHorario(fusoHorario);
        const agora = relogio();
        const registros = await prisma.anticoncepcional.findMany({
            where: {
                usuarioId,
                ...(incluirRemovidos ? {} : { ativo: true })
            },
            orderBy: {
                criadoEm: 'desc'
            },
            include: {
                usos: {
                    orderBy: [
                        { dataUsoProgramado: 'desc' },
                        { horarioProgramado: 'desc' }
                    ]
                }
            }
        });

        return ordenarAnticoncepcionaisListagem(registros.map((registro) => (
            apresentarAnticoncepcionalListagem(registro, agora, fuso)
        )));
    }

    //Atualiza somente um anticoncepcional ativo e suas notificações futuras.
    async function editar(usuarioId, idRecebido, entrada) {
        const agora = relogio();
        const id = validarIdAnticoncepcional(idRecebido);
        const dados = validarEdicaoAnticoncepcional(entrada, agora);
        const dadosPersistencia = prepararDadosPersistencia(dados);

        return prisma.$transaction(async (transacao) => {
            const registroAtual = await transacao.anticoncepcional.findFirst({
                where: {
                    id,
                    usuarioId,
                    ativo: true
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
                    ativo: true,
                    atualizadoEm: registroAtual.atualizadoEm
                },
                data: dadosPersistencia
            });

            if (resultado.count !== 1) {
                throw new AppError('O anticoncepcional foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_EDICAO');
            }

            await sincronizarNotificacoesEdicao({
                transacao,
                usuarioId,
                anticoncepcionalId: id,
                registroAtual,
                dadosNovos: dadosPersistencia,
                agora
            });

            const registroAtualizado = await transacao.anticoncepcional.findFirst({
                where: {
                    id,
                    usuarioId,
                    ativo: true
                }
            });

            if (!registroAtualizado) {
                throw new AppError('O anticoncepcional foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_EDICAO');
            }

            return apresentarAnticoncepcional(registroAtualizado, agora);
        });
    }

    //Desativa o anticoncepcional e cancela seus reenvios pendentes na mesma transação.
    async function remover(usuarioId, idRecebido) {
        const agora = relogio();
        const id = validarIdAnticoncepcional(idRecebido);

        return prisma.$transaction(async (transacao) => {
            const registroAtual = await transacao.anticoncepcional.findFirst({
                where: {
                    id,
                    usuarioId,
                    ativo: true
                },
                select: {
                    id: true,
                    atualizadoEm: true
                }
            });

            if (!registroAtual) {
                throw new AppError('Anticoncepcional não encontrado.', 404, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
            }

            const resultado = await transacao.anticoncepcional.updateMany({
                where: {
                    id,
                    usuarioId,
                    ativo: true,
                    atualizadoEm: registroAtual.atualizadoEm
                },
                data: {
                    ativo: false,
                    removidoEm: agora
                }
            });

            if (resultado.count !== 1) {
                throw new AppError('O anticoncepcional foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_REMOCAO');
            }

            await transacao.notificacao.updateMany({
                where: {
                    usuarioId,
                    tipoOrigem: 'anticoncepcional',
                    origemId: id,
                    statusEnvio: 'agendada'
                },
                data: {
                    statusEnvio: 'cancelada'
                }
            });

            return {
                id
            };
        });
    }

    return {
        cadastrar,
        listar,
        editar,
        remover
    };
}

export { criarContraceptiveService };
