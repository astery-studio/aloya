import { permiteHistorico } from '../cycles/utils/cycleRegistration.js';
import { gruposNotificacao } from './notificationPreferenceFields.js';
import {
    grupoNotificacaoDiario,
    permiteAlertasCompartilhados,
    permiteDicasCompartilhadas
} from './sharedNotificationPermissions.js';

const convites = [
    'recebido',
    'renovado',
    'acessoAtualizado',
    'acessoRevogado',
    'proximoExpiracao',
    'expirado',
    'contaExcluida'
];

const gruposCompartilhados = new Set(['ciclo', 'dicas', 'diario', 'anticoncepcional']);

export function ehPreferenciaCompartilhada(chave) {
    const [categoria, grupo] = chave.split('.');
    return categoria === 'redeApoio' && gruposCompartilhados.has(grupo);
}

export async function buscarChavesContato(prisma, contatoId, agora = new Date()) {
    const vinculos = await prisma.vinculoRedeApoio.findMany({
        where: { contatoId, status: 'ativo', titular: { statusConta: 'ativa' } },
        select: {
            contatoId: true,
            status: true,
            permissoesIndividuais: true,
            categoria: { select: { conjuntoDadosVisiveis: true } },
            titular: {
                select: {
                    dataNascimento: true,
                    consentimentoParental: { select: { statusConsentimento: true } }
                }
            }
        }
    });

    const chaves = new Set();
    function incluir(grupo, eventos) {
        const prefixo = `redeApoio.${grupo}`;
        chaves.add(prefixo);
        for (const evento of eventos) chaves.add(`${prefixo}.${evento}`);
    }

    // Convites e mudanças de acesso também têm valor antes ou depois de um vínculo ativo.
    incluir('convites', convites);
    for (const vinculo of vinculos) {
        const permissoes = vinculo.categoria
            ? vinculo.categoria.conjuntoDadosVisiveis
            : vinculo.permissoesIndividuais;
        if (!Array.isArray(permissoes)) continue;

        if (permiteHistorico(vinculo)) incluir('ciclo', ['registro', 'resumo']);
        if (permiteDicasCompartilhadas(vinculo.titular, permissoes, agora))
            incluir('dicas', ['apoio']);
        if (permiteAlertasCompartilhados(permissoes))
            incluir('anticoncepcional', gruposNotificacao['redeApoio.anticoncepcional'].split(' '));

        const diario = permissoes.map(grupoNotificacaoDiario).filter(Boolean);
        if (diario.length) incluir('diario', diario);
    }
    return [...chaves];
}
