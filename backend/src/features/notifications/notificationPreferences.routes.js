import { camposExistentes, gruposNotificacao } from './notificationPreferenceFields.js';
import { permiteNotificacao } from './notificationEvents.service.js';

function responderComPreferencias(operacao) {
    return async (req, res, next) => {
        try {
            const preferencias = await operacao(req.usuario.id, req.body);
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
            return res.set('Cache-Control', 'no-store').json({ preferencias, efetivas });
        } catch (erro) {
            return next(erro);
        }
    };
}

export function criarNotificationPreferencesRoutes({ Router, autenticar, rateLimit, service }) {
    const rotas = Router();
    rotas.get('/', autenticar, responderComPreferencias(service.buscar));
    rotas.get('/padroes', autenticar, async (_req, res) =>
        res.set('Cache-Control', 'no-store').json({
            ...(await service.buscarCatalogo()),
            campos: Object.keys(camposExistentes)
        })
    );
    rotas.patch('/', autenticar, rateLimit, responderComPreferencias(service.atualizar));
    rotas.post('/restaurar', autenticar, rateLimit, responderComPreferencias(service.restaurar));
    return rotas;
}
