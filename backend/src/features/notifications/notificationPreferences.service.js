import { camposExistentes, validarAlteracao, valoresIniciais } from './notificationPreferenceFields.js';

const select = {
    ajustesPorEvento: true,
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
    async function buscar(usuarioId) {
        const registro = await prisma.preferenciaNotificacao.findUnique({
            where: { usuarioId },
            select
        });
        return apresentar(registro);
    }

    async function atualizar(usuarioId, entrada) {
        const { chave, valor } = validarAlteracao(entrada);
        if (Object.hasOwn(camposExistentes, chave)) {
            const registro = await prisma.preferenciaNotificacao.upsert({
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
        await prisma.$executeRaw`
            INSERT INTO preferencias_notificacao (usuario_id, ajustes_por_evento, atualizado_em)
            VALUES (${usuarioId}, ${ajuste}, ${atualizadoEm})
            ON CONFLICT (usuario_id) DO UPDATE SET
                ajustes_por_evento = json_patch(preferencias_notificacao.ajustes_por_evento, excluded.ajustes_por_evento),
                atualizado_em = excluded.atualizado_em
        `;
        return buscar(usuarioId);
    }

    return { buscar, atualizar };
}
