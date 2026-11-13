import assert from 'node:assert/strict';
import test from 'node:test';
import { criarDiaryRoutes } from '../../../../src/features/diary/routes/diary.routes.js';

test('protege todas as rotas e impede cache de dados sensíveis', () => {
    const usos = [];
    const rotas = [];
    const router = {
        use(handler) {
            usos.push(handler);
        },
        get(...args) {
            rotas.push(['GET', ...args]);
        },
        post(...args) {
            rotas.push(['POST', ...args]);
        },
        put(...args) {
            rotas.push(['PUT', ...args]);
        },
        delete(...args) {
            rotas.push(['DELETE', ...args]);
        },
        patch(...args) {
            rotas.push(['PATCH', ...args]);
        }
    };
    const autenticar = () => {};
    const handler = () => {};
    const preferencesRateLimit = () => {};

    criarDiaryRoutes({
        Router: () => router,
        autenticar,
        catalogController: {
            buscar: handler,
            atualizarLote: handler,
            atualizarMacrocategoria: handler,
            atualizarCategoria: handler
        },
        entryController: { criar: handler },
        historyController: { listar: handler, buscar: handler },
        overviewController: { buscar: handler },
        mutationController: { editar: handler, excluir: handler },
        validarPreferencia: handler,
        rateLimit: handler,
        preferencesRateLimit
    });

    assert.equal(usos[0], autenticar);
    const headers = {};
    usos[1](
        {},
        {
            set: (nome, valor) => {
                headers[nome] = valor;
            }
        },
        handler
    );
    assert.equal(headers['Cache-Control'], 'private, no-store');
    assert.equal(rotas.length, 10);
    assert.ok(rotas.every(([, caminho]) => !caminho.includes('termic')));
    const rotasPreferencias = rotas.filter(([, caminho]) => caminho.includes('/preferencias'));
    assert.equal(rotasPreferencias.length, 3);
    assert.ok(rotasPreferencias.every(([, , middleware]) => middleware === preferencesRateLimit));
});
