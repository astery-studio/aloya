import {
    camposExistentes,
    gruposNotificacao,
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

function chavesDoGrupo(grupo) {
    const chaves = gruposNotificacao[grupo].split(' ').map((evento) => `${grupo}.${evento}`);
    if (grupo === 'ciclo.diario') chaves.push('lembreteDiarioAtivo');
    return chaves;
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

        return gravarAjustes(cliente, usuarioId, { [chave]: valor });
    }

    async function gravarAjustes(cliente, usuarioId, ajustes) {
        // O SQLite mescla as escolhas em uma operação atômica.
        const ajuste = JSON.stringify(ajustes);
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

    async function gravarGrupo(cliente, usuarioId, grupo, ajustes) {
        if (grupo === 'ciclo.diario' && Object.hasOwn(ajustes, 'lembreteDiarioAtivo')) {
            const { lembreteDiarioAtivo, ...demais } = ajustes;
            await gravar(cliente, usuarioId, { chave: 'lembreteDiarioAtivo', valor: lembreteDiarioAtivo });
            return gravarAjustes(cliente, usuarioId, demais);
        }
        return gravarAjustes(cliente, usuarioId, ajustes);
    }

    async function atualizar(usuarioId, entrada, autorizar) {
        const alteracao = validarAlteracao(entrada);
        const { chave, valor } = alteracao;
        const cancelar = valor === false && chave !== 'previaDetalhada';
        const emGrupo = Object.hasOwn(gruposNotificacao, chave);
        const grupo = chave === 'lembreteDiarioAtivo' ? 'ciclo.diario' : chave.slice(0, chave.lastIndexOf('.'));
        const ativandoIndividual = valor === true && Object.hasOwn(gruposNotificacao, grupo);

        if (!cancelar && !autorizar && !emGrupo && !ativandoIndividual) {
            return gravar(prisma, usuarioId, alteracao);
        }

        const evento =
            {
                cicloPrevisoesAtivo: 'ciclo',
                anticoncepcionalAtivo: 'anticoncepcional',
                redeApoioAtiva: 'redeApoio',
                lembreteDiarioAtivo: 'ciclo.diario.lembrete'
            }[chave] ?? chave;

        return prisma.$transaction(async (tx) => {
            const permitidas = await autorizar?.(tx, chave);
            let preferencias;

            if (emGrupo || ativandoIndividual) {
                const grupoAlterado = emGrupo ? chave : grupo;
                const chaves = chavesDoGrupo(grupoAlterado);
                const ajustes = {};

                // Contas antigas podem ter escolhas ligadas que o grupo desligado mascarava.
                if (valor && (await buscarNoBanco(tx, usuarioId))[grupoAlterado] === false) {
                    for (const opcao of chaves) ajustes[opcao] = false;
                }

                if (emGrupo) {
                    for (const opcao of chaves) {
                        if (!permitidas || permitidas.includes(opcao)) ajustes[opcao] = valor;
                    }
                    ajustes[grupoAlterado] = valor;
                } else {
                    ajustes[grupoAlterado] = true;
                    ajustes[chave] = true;
                }
                preferencias = await gravarGrupo(tx, usuarioId, grupoAlterado, ajustes);
            } else {
                preferencias = await gravar(tx, usuarioId, alteracao);
            }

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
