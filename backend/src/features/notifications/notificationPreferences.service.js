import {
    camposExistentes,
    validarAlteracao,
    valoresIniciais
} from './notificationPreferenceFields.js';
import { inicializarCatalogoNotificacao } from './notificationCatalog.service.js';
import { permiteNotificacao } from './notificationEvents.service.js';

const select = {
    ajustesPorEvento: true,
    cicloPrevisoesAtivo: true,
    anticoncepcionalAtivo: true,
    redeApoioAtiva: true,
    lembreteDiarioAtivo: true,
    horarioLembreteDiario: true,
    antecedenciaProximoCiclo: true
};

function apresentar(registro) {
    if (!registro) return { ...valoresIniciais };

    const { ajustesPorEvento, ...legado } = registro;
    return { ...valoresIniciais, ...ajustesPorEvento, ...legado };
}

export function criarNotificationPreferencesService(prisma) {
    async function buscarNoBanco(cliente, usuarioId) {
        return apresentar(
            await cliente.preferenciaNotificacao.findUnique({ where: { usuarioId }, select })
        );
    }

    async function gravar(cliente, usuarioId, { chave, valor }) {
        if (Object.hasOwn(camposExistentes, chave)) {
            const registro = await cliente.preferenciaNotificacao.upsert({
                where: { usuarioId },
                create: { usuarioId, [chave]: valor },
                update: { [chave]: valor },
                select
            });
            return apresentar(registro);
        }

        // O SQLite mescla a chave em uma operação atômica, sem sobrescrever escolhas paralelas.
        const ajuste = JSON.stringify({ [chave]: valor });
        const atualizadoEm = new Date().toISOString();
        await cliente.$executeRaw`
            INSERT INTO preferencias_notificacao (usuario_id, ajustes_por_evento, atualizado_em)
            VALUES (${usuarioId}, ${ajuste}, ${atualizadoEm})
            ON CONFLICT (usuario_id) DO UPDATE SET
                ajustes_por_evento = json_patch(preferencias_notificacao.ajustes_por_evento, excluded.ajustes_por_evento),
                atualizado_em = excluded.atualizado_em
        `;

        return buscarNoBanco(cliente, usuarioId);
    }

    async function atualizar(usuarioId, entrada) {
        const alteracao = validarAlteracao(entrada);

        if (alteracao.valor !== false || alteracao.chave === 'previaDetalhada') {
            return gravar(prisma, usuarioId, alteracao);
        }

        const { chave } = alteracao;
        const evento =
            {
                cicloPrevisoesAtivo: 'ciclo',
                anticoncepcionalAtivo: 'anticoncepcional',
                redeApoioAtiva: 'redeApoio',
                lembreteDiarioAtivo: 'ciclo.diario.lembrete'
            }[chave] ?? chave;

        return prisma.$transaction(async (tx) => {
            const preferencias = await gravar(tx, usuarioId, alteracao);

            await tx.notificacao.updateMany({
                where: {
                    usuarioId,
                    statusEnvio: 'agendada',
                    dataHoraDisparo: null,
                    OR: [{ evento }, { evento: { startsWith: `${evento}.` } }]
                },
                data: { statusEnvio: 'cancelada' }
            });

            return preferencias;
        });
    }

    async function restaurar(usuarioId) {
        const desativados = Object.keys(valoresIniciais).filter(
            (chave) => chave.split('.').length === 3 && !permiteNotificacao(null, chave)
        );

        return prisma.$transaction(async (tx) => {
            await tx.preferenciaNotificacao.updateMany({
                where: { usuarioId },
                data: { ...camposExistentes, ajustesPorEvento: {} }
            });

            await tx.notificacao.updateMany({
                where: {
                    usuarioId,
                    evento: { in: desativados },
                    statusEnvio: 'agendada',
                    dataHoraDisparo: null
                },
                data: { statusEnvio: 'cancelada' }
            });

            return buscarNoBanco(tx, usuarioId);
        });
    }

    return {
        buscar: (usuarioId) => buscarNoBanco(prisma, usuarioId),
        buscarCatalogo: () => inicializarCatalogoNotificacao(prisma),
        atualizar,
        restaurar
    };
}
