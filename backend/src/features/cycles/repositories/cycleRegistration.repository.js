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
