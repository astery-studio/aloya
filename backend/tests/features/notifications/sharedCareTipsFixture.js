import { criarNotificationPreferencesService } from '../../../src/features/notifications/notificationPreferences.service.js';
import { reconciliarAgendamentos } from '../../../src/features/notifications/notificationPlanner.js';
import { planejarCompartilhadas } from '../../../src/features/notifications/sharedPushPlanner.js';
import { criarPushWorker } from '../../../src/features/notifications/pushWorker.js';
import { registrarDispositivo } from '../../../src/features/notifications/pushDeviceRegistration.js';
import { aparelho, criarBanco } from './pushWorkerFixture.js';

export async function criarVinculoDeTeste(t) {
    const prisma = await criarBanco(t);
    const dispositivo = aparelho();
    await registrarDispositivo(prisma, { id: 2, sessaoId: 2 }, dispositivo);
    await prisma.registroCiclo.create({
        data: { usuarioId: 1, dataInicio: new Date('2026-10-01') }
    });
    const categoria = await prisma.categoriaPermissao.create({
        data: { titularId: 1, nome: 'Rede', nomeNormalizado: 'rede', conjuntoDadosVisiveis: [] }
    });
    const vinculo = await prisma.vinculoRedeApoio.create({
        data: {
            titularId: 1,
            contatoId: 2,
            categoriaId: categoria.id,
            emailConvidado: 'conta-2@example.com',
            status: 'ativo'
        }
    });
    const darPermissao = (permissoes) =>
        prisma.categoriaPermissao.update({
            where: { id: categoria.id },
            data: { conjuntoDadosVisiveis: permissoes }
        });

    const marcarTitularMenor = () => prisma.usuario.update({
        where: { id: 1 },
        data: { dataNascimento: new Date('2012-01-01') }
    });
    const liberarConsentimento = () => prisma.consentimentoParental.create({
        data: {
            titularMenorId: 1,
            emailResponsavelLegal: 'responsavel@example.com',
            tokenConfirmacaoHash: 'token-teste-dicas',
            statusConsentimento: 'liberado',
            validadeLink: new Date('2026-10-01')
        }
    });

    return { prisma, dispositivo, vinculo, darPermissao, marcarTitularMenor, liberarConsentimento };
}

export function criarWorkerDeTeste(prisma, relogio) {
    const enviados = [];
    const worker = criarPushWorker({
        prisma,
        relogio,
        provider: {
            enviar: async (msg) => {
                enviados.push(msg);
                return { status: 'ok', id: 'ticket' };
            }
        }
    });
    return { worker, enviados };
}

export const eventoDicas = 'redeApoio.dicas.apoio';

export async function prepararAgendaDicas(t) {
    const { prisma, darPermissao } = await criarVinculoDeTeste(t);
    const preferencias = criarNotificationPreferencesService(prisma);
    await darPermissao(['geral.dicas']);
    await preferencias.atualizar(2, { chave: eventoDicas, valor: true });
    const preferencia = await prisma.preferenciaNotificacao.findUnique({ where: { usuarioId: 2 } });
    const agenda = await planejarCompartilhadas(
        prisma,
        2,
        preferencia,
        new Date('2026-10-01T20:00Z')
    );
    await reconciliarAgendamentos(prisma, 2, agenda);
    const agora = new Date('2026-10-02T23:10Z');
    return { prisma, darPermissao, preferencias, agenda, agora };
}
