import assert from 'node:assert/strict';
import test from 'node:test';
import { prepararApiContato } from './contactNotificationPreferencesFixture.js';

test('limita preferências do contato às permissões vigentes e salva na conta autenticada', async (t) => {
    const { prisma, service, categoria, chamar } = await prepararApiContato(t);

    assert.equal((await chamar('/contato', 0)).status, 401);
    assert.equal((await chamar('/contato', 1)).status, 403);
    const { preferencias, chavesDisponiveis } = await (await chamar('/contato', 2)).json();
    assert.deepEqual(Object.keys(preferencias), chavesDisponiveis);
    assert.equal(preferencias['redeApoio.dicas.apoio'], false);
    assert.equal(preferencias['redeApoio.diario.energia'], false);
    assert.equal(preferencias['redeApoio.diario.corpo'], undefined);
    assert.equal(preferencias['redeApoio.ciclo.registro'], undefined);
    assert.equal(preferencias['redeApoio.anticoncepcional.horario'], undefined);
    assert.equal(preferencias['redeApoio.convites.respondido'], undefined);
    assert.equal(preferencias['redeApoio.convites.contaExcluida'], false);
    assert.equal(preferencias.horarioLembreteDiario, undefined);
    assert.equal((await chamar('/', 2, { chave: 'ciclo.fases', valor: false })).status, 403);
    assert.equal((await chamar('/restaurar', 2, undefined, 'POST')).status, 403);

    const ativarDicas = { chave: 'redeApoio.dicas.apoio', valor: true };
    assert.equal((await chamar('/contato', 2, ativarDicas)).status, 200);
    assert.equal((await service.buscar(2))[ativarDicas.chave], true);
    assert.equal((await service.buscar(1))[ativarDicas.chave], false);

    const ligarDiario = await chamar('/contato', 2, { chave: 'redeApoio.diario', valor: true });
    assert.equal(ligarDiario.status, 200);
    assert.equal((await ligarDiario.json()).efetivas['redeApoio.diario.energia'], true);
    assert.equal((await service.buscar(2))['redeApoio.diario.corpo'], false);

    await prisma.categoriaPermissao.update({
        where: { id: categoria.id },
        data: { conjuntoDadosVisiveis: [] }
    });
    assert.equal((await chamar('/contato', 2, ativarDicas)).status, 403);
    assert.equal((await chamar('/contato', 2, { chave: 'redeApoio.diario', valor: true })).status, 403);
    const semPermissoes = await (await chamar('/', 2)).json();
    assert.ok(
        semPermissoes.chavesDisponiveis.every((chave) => chave.startsWith('redeApoio.convites'))
    );

    const padroes = await (await chamar('/padroes', 2)).json();
    assert.deepEqual(padroes.grupos.map(({ codigo }) => codigo), ['redeApoio.convites']);
    assert.equal(padroes.preferencias[ativarDicas.chave], undefined);

    await prisma.usuario.update({ where: { id: 2 }, data: { papel: 'principal_e_contato_apoio' } });
    const preferenciasDuplas = (await (await chamar('/', 2)).json()).preferencias;
    assert.equal(preferenciasDuplas.horarioLembreteDiario, '20:00');
    assert.equal(preferenciasDuplas[ativarDicas.chave], undefined);
    assert.equal((await chamar('/', 2, ativarDicas)).status, 403);
    assert.equal((await chamar('/', 1, ativarDicas)).status, 403);
    assert.equal((await chamar('/contato', 2)).status, 200);
});
