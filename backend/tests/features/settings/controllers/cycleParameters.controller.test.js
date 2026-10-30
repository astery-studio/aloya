import assert from 'node:assert/strict';
import test from 'node:test';

import { criarCycleParametersController } from '../../../../src/features/settings/controllers/cycleParameters.controller.js';

function resposta() {
    return { status(codigo) { this.codigo = codigo; return this; }, json(corpo) { this.corpo = corpo; return this; } };
}

test('consulta e atualiza parâmetros válidos', async () => {
    const service = {
        async buscar(id) { assert.equal(id, 4); return { duracaoCicloInformada: 28 }; },
        async atualizar(id, dados) { assert.equal(id, 4); return dados; }
    };
    const validator = { validar: (dados) => ({ valido: true, dados, erros: [] }) };
    const controller = criarCycleParametersController({ service, validator });
    const req = { usuario: { id: 4 }, body: { duracaoCicloInformada: 30 } };
    const consulta = resposta();
    const edicao = resposta();
    await controller.buscar(req, consulta, assert.fail);
    await controller.atualizar(req, edicao, assert.fail);
    assert.equal(consulta.codigo, 200);
    assert.equal(edicao.corpo.parametros.duracaoCicloInformada, 30);
});

test('responde 422 sem chamar o serviço quando a validação falha', async () => {
    const service = { atualizar: assert.fail };
    const validator = { validar: () => ({ valido: false, erros: [{ campo: 'ciclo' }] }) };
    const controller = criarCycleParametersController({ service, validator });
    const res = resposta();
    await controller.atualizar({ usuario: { id: 1 }, body: {} }, res, assert.fail);
    assert.equal(res.codigo, 422);
    assert.equal(res.corpo.erro.codigo, 'ERRO_VALIDACAO');
});

test('encaminha falhas e protege mensagens inesperadas', async () => {
    const erroBusca = new Error('banco');
    const erroEdicao = Object.assign(new Error('regra'), { status: 409 });
    const controller = criarCycleParametersController({
        service: { async buscar() { throw erroBusca; }, async atualizar() { throw erroEdicao; } },
        validator: { validar: (dados) => ({ valido: true, dados }) }
    });
    let recebido;
    await controller.buscar({ usuario: { id: 1 } }, resposta(), (e) => { recebido = e; });
    assert.match(recebido.mensagemUsuario, /carregar/);
    await controller.atualizar({ usuario: { id: 1 }, body: {} }, resposta(), (e) => { recebido = e; });
    assert.equal(recebido, erroEdicao);
    assert.equal(erroEdicao.mensagemUsuario, undefined);
});

test('protege a mensagem de falha inesperada ao atualizar', async () => {
    const falha = new Error('banco');
    const controller = criarCycleParametersController({
        service: { async atualizar() { throw falha; } },
        validator: { validar: (dados) => ({ valido: true, dados }) }
    });
    let recebido;
    await controller.atualizar(
        { usuario: { id: 1 }, body: {} },
        resposta(),
        (erro) => { recebido = erro; }
    );
    assert.match(recebido.mensagemUsuario, /atualizar/);
});
