import {
    camposExistentes,
    validarAlteracao,
    valoresIniciais
} from './notificationPreferenceFields.js';
import { inicializarCatalogoNotificacao } from './notificationCatalog.service.js';
import { permiteNotificacao } from './notificationEvents.service.js';
import { buscarChavesContato } from './contactNotificationOptions.js';

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

    async function atualizar(usuarioId, entrada, autorizar) {
        const alteracao = validarAlteracao(entrada);
        const { chave, valor } = alteracao;
        const cancelar = valor === false && chave !== 'previaDetalhada';

        if (!cancelar && !autorizar) return gravar(prisma, usuarioId, alteracao);

        const evento =
            {
                cicloPrevisoesAtivo: 'ciclo',
                anticoncepcionalAtivo: 'anticoncepcional',
                redeApoioAtiva: 'redeApoio',
                lembreteDiarioAtivo: 'ciclo.diario.lembrete'
            }[chave] ?? chave;

        return prisma.$transaction(async (tx) => {
            if (autorizar) await autorizar(tx, chave);
            const preferencias = await gravar(tx, usuarioId, alteracao);

            if (cancelar) {
                await cancelarAgendadas(tx, {
                    usuarioId,
                    OR: [{ evento }, { evento: { startsWith: `${evento}.` } }]
                });
            }

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

            await cancelarAgendadas(tx, { usuarioId, evento: { in: desativados } });

            return buscarNoBanco(tx, usuarioId);
        });
    }

    return {
        buscar: (usuarioId) => buscarNoBanco(prisma, usuarioId),
        buscarChavesContato: (usuarioId, cliente = prisma) => buscarChavesContato(cliente, usuarioId),
        buscarCatalogo: () => inicializarCatalogoNotificacao(prisma),
        atualizar,
        restaurar
    };
}

async function cancelarAgendadas(tx, criterio) {
    const where = { ...criterio, statusEnvio: 'agendada', dataHoraDisparo: null };
    await tx.entregaPush.updateMany({
        where: { status: 'pendente', notificacao: where },
        data: { status: 'cancelada' }
    });
    await tx.notificacao.updateMany({ where, data: { statusEnvio: 'cancelada' } });
}
