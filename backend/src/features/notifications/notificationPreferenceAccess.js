import { AppError } from '../../shared/errors/AppError.js';
import { camposExistentes, valoresIniciais } from './notificationPreferenceFields.js';
import { ehPreferenciaCompartilhada } from './contactNotificationOptions.js';

export const filtrarChaves = (valores, chaves) =>
    Object.fromEntries(
        chaves
            .filter((chave) => Object.hasOwn(valores, chave))
            .map((chave) => [chave, valores[chave]])
    );

export function semAcesso() {
    return new AppError(
        'Esta preferência não está disponível para sua conta.',
        403,
        'PREFERENCIA_NOTIFICACAO_SEM_ACESSO'
    );
}

export async function buscarChavesDisponiveis(
    service,
    { id, papel },
    rotaContato = false,
    cliente
) {
    const somenteContato = papel === 'contato_apoio';
    if (rotaContato && !somenteContato && papel !== 'principal_e_contato_apoio') throw semAcesso();

    const chavesContato = new Set(await service.buscarChavesContato(id, cliente));
    if (rotaContato || somenteContato) return [...chavesContato];

    return Object.keys(valoresIniciais).filter(
        (chave) => !ehPreferenciaCompartilhada(chave) || chavesContato.has(chave)
    );
}

export function responderPadroes(service) {
    return async (req, res) => {
        const chaves = await buscarChavesDisponiveis(service, req.usuario);
        const disponivel = (codigo) =>
            chaves.includes(codigo === 'ciclo.diario.lembrete' ? 'lembreteDiarioAtivo' : codigo);
        const catalogo = await service.buscarCatalogo();
        const grupos = catalogo.grupos
            .map((grupo) => ({ ...grupo, tipos: grupo.tipos.filter(disponivel) }))
            .filter((grupo) => grupo.tipos.length > 0);
        return res.set('Cache-Control', 'no-store').json({
            ...catalogo,
            grupos,
            categorias: catalogo.categorias.filter(
                ({ codigo }) =>
                    codigo === 'seguranca' || grupos.some(({ categoria }) => categoria === codigo)
            ),
            preferencias: filtrarChaves(catalogo.preferencias, chaves),
            campos: Object.keys(camposExistentes).filter(disponivel)
        });
    };
}
