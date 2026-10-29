import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleEditController } from '../../../../src/features/cycles/controllers/cycleEdit.controller.js';

function criarResposta() {
    return {
        codigo: null, corpo: null, headers: {},
        set(nome, valor) { this.headers[nome] = valor; },
        status(codigo) { this.codigo = codigo; return this; },
        json(corpo) { this.corpo = corpo; return this; }
    };
}

const validator = {
    validarIdCiclo: (id) => Number(id),
    validarCorpo: (body) => body
};

test('rejeita dependências inválidas', () => {
    const service = { buscar() {}, editar() {} };
    assert.throws(() => criarCycleEditController(), /service/);
    assert.throws(() => criarCycleEditController({ service: { buscar() {} } }), /service/);
    assert.throws(() => criarCycleEditController({ service }), /validator/);
    assert.throws(() => criarCycleEditController({ service, validator: { validarIdCiclo() {} } }), /validator/);
});

test('busca e edita o ciclo autenticado sem cache', async () => {
    const chamadas = [];
    const service = {
        async buscar(dados) { chamadas.push(dados); return { id: 7 }; },
        async editar(dados) { chamadas.push(dados); return { id: 7 }; }
    };
    const controller = criarCycleEditController({ service, validator });
    const req = { params: { id: '7' }, usuario: { id: 3 }, body: { dataFim: null } };
    const busca = criarResposta();
    const edicao = criarResposta();

    await controller.buscar(req, busca, assert.fail);
    await controller.editar(req, edicao, assert.fail);

    assert.deepEqual(chamadas, [
        { usuarioId: 3, cicloId: 7 },
        { usuarioId: 3, cicloId: 7, dados: { dataFim: null } }
    ]);
    assert.equal(busca.headers['Cache-Control'], 'no-store');
    assert.equal(edicao.codigo, 200);
    assert.match(edicao.corpo.mensagem, /sucesso/);
});

test('encaminha falhas com mensagem pública apenas para erros inesperados', async () => {
    const inesperado = new Error('banco');
    const esperado = Object.assign(new Error('inválido'), { status: 422 });
    const service = {
        async buscar() { throw inesperado; },
        async editar() { throw esperado; }
    };
    const controller = criarCycleEditController({ service, validator });
    let recebido;
    await controller.buscar({ params: { id: '1' }, usuario: { id: 2 } }, criarResposta(), (e) => { recebido = e; });
    assert.equal(recebido.mensagemUsuario, 'Ocorreu um erro ao carregar este registro. Tente novamente.');
    await controller.editar({ params: { id: '1' }, usuario: { id: 2 }, body: {} }, criarResposta(), (e) => { recebido = e; });
    assert.equal(recebido, esperado);
    assert.equal(esperado.mensagemUsuario, undefined);
});

test('protege a mensagem de erro inesperado durante a edição', async () => {
    const falha = new Error('banco');
    const controller = criarCycleEditController({
        service: { async buscar() {}, async editar() { throw falha; } },
        validator
    });
    let recebido;
    await controller.editar(
        { params: { id: '1' }, usuario: { id: 2 }, body: {} },
        criarResposta(),
        (erro) => { recebido = erro; }
    );
    assert.equal(recebido.mensagemUsuario, 'Ocorreu um erro ao atualizar este registro. Tente novamente.');
});
