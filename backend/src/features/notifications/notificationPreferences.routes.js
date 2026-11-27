import { gruposNotificacao } from './notificationPreferenceFields.js';
import { permiteNotificacao } from './notificationEvents.service.js';
import {
    buscarChavesDisponiveis,
    filtrarChaves,
    responderPadroes,
    semAcesso
} from './notificationPreferenceAccess.js';

function responderComPreferencias(service, operacao, rotaContato = false) {
    return async (req, res, next) => {
        try {
            const { id, papel } = req.usuario;
            if (papel === 'contato_apoio' && operacao === 'restaurar') throw semAcesso();

            const buscarChaves = (cliente) =>
                buscarChavesDisponiveis(service, req.usuario, rotaContato, cliente);
            const preferencias =
                operacao === 'atualizar'
                    ? await service.atualizar(id, req.body, async (cliente, chave) => {
                          const permitidas = await buscarChaves(cliente);
                          if (!permitidas.includes(chave)) throw semAcesso();
                      })
                    : await service[operacao](id);
            const chaves = await buscarChaves();
            const {
                cicloPrevisoesAtivo,
                anticoncepcionalAtivo,
                redeApoioAtiva,
                lembreteDiarioAtivo
            } = preferencias;
            const estado = {
                cicloPrevisoesAtivo,
                anticoncepcionalAtivo,
                redeApoioAtiva,
                lembreteDiarioAtivo,
                ajustesPorEvento: preferencias
            };
            const efetivas = Object.fromEntries(
                Object.entries(gruposNotificacao).flatMap(([grupo, eventos]) =>
                    eventos.split(' ').map((evento) => {
                        const chave = `${grupo}.${evento}`;
                        return [chave, permiteNotificacao(estado, chave)];
                    })
                )
            );
            efetivas.lembreteDiarioAtivo = permiteNotificacao(estado, 'ciclo.diario.lembrete');
            return res.set('Cache-Control', 'no-store').json({
                preferencias: filtrarChaves(preferencias, chaves),
                efetivas: filtrarChaves(efetivas, chaves),
                chavesDisponiveis: chaves
            });
        } catch (erro) {
            return next(erro);
        }
    };
}

export function criarNotificationPreferencesRoutes({ Router, autenticar, rateLimit, service }) {
    const rotas = Router();
    rotas.get('/', autenticar, responderComPreferencias(service, 'buscar'));
    rotas.get('/contato', autenticar, responderComPreferencias(service, 'buscar', true));
    rotas.get('/padroes', autenticar, responderPadroes(service));
    rotas.patch('/', autenticar, rateLimit, responderComPreferencias(service, 'atualizar'));
    rotas.patch(
        '/contato',
        autenticar,
        rateLimit,
        responderComPreferencias(service, 'atualizar', true)
    );
    rotas.post('/restaurar', autenticar, rateLimit, responderComPreferencias(service, 'restaurar'));
    return rotas;
}
