import { AppError } from '../../../shared/errors/AppError.js';
import {
    adicionarDias,
    diferencaDias,
    formatarData,
    paraDataCalendario
} from '../utils/calendar.js';
import { calcularPrevisao } from '../utils/prediction.js';
import { permiteHistorico, selecionarPeriodo } from '../utils/cycleRegistration.js';

function criarCycleRegistrationRepository({ prisma }) {
    if (typeof prisma?.$transaction !== 'function')
        throw new TypeError('Repositório de registro menstrual inválido.');

    async function registrar({ usuarioId, chave, inicio, fim, agora }) {
        try {
            return await prisma.$transaction(async (tx) => {
                const solicitacao = { inicio, fim };
                const recibo = await tx.sincronizacaoMenstrual.findUnique({
                    where: { usuarioId_chave: { usuarioId, chave } }
                });
                if (recibo) {
                    if (recibo.solicitacao.inicio !== inicio || recibo.solicitacao.fim !== fim) {
                        throw new AppError(
                            'Esta chave já foi usada para outro registro.',
                            409,
                            'CHAVE_SINCRONIZACAO_REUTILIZADA'
                        );
                    }
                    return { ...recibo.resultado, repetida: true };
                }
                const usuario = await tx.usuario.findUnique({
                    where: { id: usuarioId },
                    select: {
                        duracaoCicloInformada: true,
                        duracaoMenstruacaoInformada: true,
                        duracaoLuteaInformada: true
                    }
                });
                if (!usuario)
                    throw new AppError('Usuário não encontrado.', 404, 'USUARIO_NAO_ENCONTRADO');
                const registros = await tx.registroCiclo.findMany({
                    where: { usuarioId },
                    orderBy: { dataInicio: 'asc' },
                    include: {
                        diasMenstruacao: { orderBy: { data: 'asc' } }
                    }
                });
                const { registro } = selecionarPeriodo(registros, inicio, fim);
                const dataInicio =
                    registro && formatarData(registro.dataInicio) < inicio
                        ? registro.dataInicio
                        : paraDataCalendario(inicio);
                const ultimo = registro?.diasMenstruacao.at(-1)?.data;
                const dataFim =
                    ultimo && formatarData(ultimo) > fim ? ultimo : paraDataCalendario(fim);
                const duracaoMenstruacao =
                    (registro?.diasMenstruacao.length ?? 0) + diferencaDias(inicio, fim) + 1;
                const dados = { dataInicio, dataFim, duracaoMenstruacao };
                const ciclo = registro
                    ? await tx.registroCiclo.update({ where: { id: registro.id }, data: dados })
                    : await tx.registroCiclo.create({ data: { usuarioId, ...dados } });
                await tx.diaMenstruacao.createMany({
                    data: Array.from({ length: diferencaDias(inicio, fim) + 1 }, (_, i) => ({
                        registroCicloId: ciclo.id,
                        data: paraDataCalendario(adicionarDias(inicio, i)),
                        statusSincronizacao: 'sincronizado'
                    }))
                });
                const atualizados = await tx.registroCiclo.findMany({
                    where: { usuarioId },
                    orderBy: { dataInicio: 'asc' },
                    include: {
                        diasMenstruacao: { orderBy: { data: 'asc' } }
                    }
                });
                for (const [indice, item] of atualizados.entries()) {
                    const proximo = atualizados[indice + 1];
                    const duracaoCiclo = proximo
                        ? diferencaDias(item.dataInicio, proximo.dataInicio)
                        : null;
                    const encerramento =
                        proximo && !item.dataFim
                            ? {
                                  dataFim: item.diasMenstruacao.at(-1)?.data ?? item.dataInicio,
                                  duracaoMenstruacao: item.diasMenstruacao.length || 1
                              }
                            : {};
                    if (
                        item.duracaoCiclo !== duracaoCiclo ||
                        item.ehCicloInicial !== (indice === 0) ||
                        Object.keys(encerramento).length
                    ) {
                        await tx.registroCiclo.update({
                            where: { id: item.id },
                            data: { ...encerramento, duracaoCiclo, ehCicloInicial: indice === 0 }
                        });
                    }
                    Object.assign(item, encerramento, {
                        duracaoCiclo,
                        ehCicloInicial: indice === 0
                    });
                }
                await tx.previsao.deleteMany({ where: { usuarioId } });
                const previsao = calcularPrevisao({
                    registros: atualizados,
                    parametros: usuario,
                    dataReferencia: formatarData(agora)
                });
                const vinculos = await tx.vinculoRedeApoio.findMany({
                    where: {
                        titularId: usuarioId,
                        status: 'ativo',
                        contatoId: { not: null },
                        contato: {
                            statusConta: 'ativa',
                            OR: [
                                { preferenciaNotificacao: { is: null } },
                                { preferenciaNotificacao: { is: { redeApoioAtiva: true } } }
                            ]
                        }
                    },
                    include: { categoria: true }
                });
                const contatos = [
                    ...new Set(vinculos.filter(permiteHistorico).map((v) => v.contatoId))
                ];
                if (contatos.length)
                    await tx.notificacao.createMany({
                        data: contatos.map((contatoId) => ({
                            usuarioId: contatoId,
                            tipoOrigem: 'rede_apoio',
                            origemId: ciclo.id,
                            dataHoraProgramada: agora,
                            statusEnvio: 'agendada'
                        }))
                    });
                const atualizado = atualizados.find((item) => item.id === ciclo.id);
                const resultado = {
                    mensagem: 'Registro de menstruação adicionado com sucesso.',
