import { AppError } from '../../../shared/errors/AppError.js';
import { validarIdAnticoncepcional } from '../validators/contraceptive.validator.js';
import { horarioPertenceAgenda } from '../utils/contraceptive.listing.schedule.js';
import { validarConfirmacaoUso, dataHoraNoFuso, dataLocalNoFuso, horarioNoFuso, validarFusoHorario } from '../validators/contraceptiveUsage.validator.js';

// O prazo precisa ser configurado por medicamento; não infere eficácia do tipo/nome.
function lerJanelasDeUso(valor = process.env.ANTICONCEPCIONAIS_JANELAS_MINUTOS) {
    if (!valor) return Object.freeze({});
    let janelas;
    try { janelas = JSON.parse(valor); } catch {
        throw new Error('ANTICONCEPCIONAIS_JANELAS_MINUTOS deve ser um objeto JSON por identificador.');
    }
    if (!janelas || Array.isArray(janelas) || typeof janelas !== 'object'
        || Object.entries(janelas).some(([id, minutos]) => !/^[1-9]\d*$/.test(id)
            || !Number.isSafeInteger(Number(id)) || !Number.isSafeInteger(minutos) || minutos < 0)) {
        throw new Error('A configuração das janelas de uso é inválida.');
    }
    return Object.freeze(janelas);
}

function criarAvaliadorJanelaEficacia(janelasEmMinutos = {}) {
    return ({ anticoncepcional, programadoEm }) => {
        const minutos = janelasEmMinutos[String(anticoncepcional.id)];
        if (minutos === undefined) return null;
        if (!Number.isSafeInteger(minutos) || minutos < 0) throw new Error('Janela de uso inválida.');
        const limite = new Date(programadoEm.getTime() + minutos * 60_000);
        if (!Number.isFinite(limite.getTime())) throw new Error('Janela de uso inválida.');
        return limite;
    };
}

function apresentarUsoConfirmacao(uso, fusoHorario = 'UTC', prazoConfigurado = false) {
    const confirmado = uso.statusUso === 'confirmado';
    const timestamp = confirmado && uso.horarioRealConfirmacao ? uso.horarioRealConfirmacao : null;
    return {
        id: String(uso.id),
        data: uso.dataUsoProgramado.toISOString().slice(0, 10),
        horario: uso.horarioProgramado,
        status: confirmado ? (uso.confirmacaoForaPrazo ? 'foraDoPrazo' : 'confirmado') : 'pendente',
        confirmadoEm: timestamp ? timestamp.toISOString() : null,
        horarioConfirmacao: timestamp ? horarioNoFuso(timestamp, fusoHorario) : null,
        confirmacaoForaPrazo: confirmado && uso.confirmacaoForaPrazo,
        prazoConfigurado,
        fusoHorario
    };
}

function criarContraceptiveUsageService(prisma, { relogio = () => new Date(), avaliarJanelaEficacia = criarAvaliadorJanelaEficacia() } = {}) {
    async function definirConfirmacao(usuarioId, idRecebido, entrada) {
        const anticoncepcionalId = validarIdAnticoncepcional(idRecebido);
        const dados = validarConfirmacaoUso(entrada);
        const agora = relogio();

        // O índice composto representa a dose, mesmo antes de existir um ID no banco.
        const where = {
            anticoncepcionalId_dataUsoProgramado_horarioProgramado: {
                anticoncepcionalId, dataUsoProgramado: dados.dataUsoProgramado,
                horarioProgramado: dados.horarioProgramado
            }
        };

        for (let tentativa = 0; tentativa < 3; tentativa += 1) {
            try {
                return await prisma.$transaction(async (transacao) => {
                    const anticoncepcional = await transacao.anticoncepcional.findFirst({
                        where: { id: anticoncepcionalId, usuarioId, ativo: true }
                    });
                    if (!anticoncepcional) {
                        throw new AppError('Anticoncepcional não encontrado.', 404, 'ANTICONCEPCIONAL_NAO_ENCONTRADO');
                    }
                    if (!horarioPertenceAgenda(anticoncepcional, dados.data, dados.horarioProgramado)) {
                        throw new AppError('Este uso não pertence à programação do anticoncepcional.', 422, 'USO_FORA_DA_PROGRAMACAO');
                    }
                    const fusoHorario = validarFusoHorario(dados.fusoHorario);
                    if (dados.data > dataLocalNoFuso(agora, fusoHorario)) {
                        throw new AppError('Não é possível confirmar usos de dias futuros.', 422, 'USO_FUTURO');
                    }
                    const programadoEm = dataHoraNoFuso(dados.data, dados.horarioProgramado, fusoHorario);
                    if (!programadoEm) {
                        throw new AppError('O horário informado não existe nessa data e fuso.', 422, 'HORARIO_INEXISTENTE_NO_FUSO');
                    }
                    const fimJanela = await avaliarJanelaEficacia({ anticoncepcional, programadoEm, agora });
                    if (fimJanela !== null && (!(fimJanela instanceof Date) || !Number.isFinite(fimJanela.getTime()))) {
                        throw new Error('A configuração do prazo de uso é inválida.');
                    }
                    const prazoConfigurado = fimJanela instanceof Date;

                    const uso = await transacao.usoAnticoncepcional.upsert({
                        where,
                        create: {
                            anticoncepcionalId, dataUsoProgramado: dados.dataUsoProgramado,
                            horarioProgramado: dados.horarioProgramado,
                            statusUso: 'pendente', confirmacaoForaPrazo: false
                        },
                        update: {}
                    });
                    const jaConfirmado = uso.statusUso === 'confirmado';
                    let atualizado = uso;
                    if (jaConfirmado !== dados.confirmar) {
                        const alteracoes = {
                            statusUso: dados.confirmar ? 'confirmado' : 'pendente',
                            horarioRealConfirmacao: dados.confirmar ? agora : null,
                            confirmacaoForaPrazo: dados.confirmar && prazoConfigurado && agora > fimJanela
                        };
                        const resultado = await transacao.usoAnticoncepcional.updateMany({
                            where: { id: uso.id, anticoncepcionalId, atualizadoEm: uso.atualizadoEm },
                            data: alteracoes
                        });
                        if (resultado.count !== 1) {
                            throw new AppError('O uso foi alterado em outra operação. Atualize os dados e tente novamente.', 409, 'CONFLITO_CONFIRMACAO_USO');
                        }
                        atualizado = { ...uso, ...alteracoes };
                    }
                    // Notificações estão fora do escopo desta etapa: só persiste o uso.
                    return apresentarUsoConfirmacao(atualizado, fusoHorario, prazoConfigurado);
                });
            } catch (erro) {
                // Corrida de criação/serialização repete a transação, nunca a dose inteira.
                if (tentativa < 2 && ['P2002', 'P2034'].includes(erro?.code)) continue;
                throw erro;
            }
        }
    }
    return { definirConfirmacao };
}

export { apresentarUsoConfirmacao, criarAvaliadorJanelaEficacia, lerJanelasDeUso, criarContraceptiveUsageService };
