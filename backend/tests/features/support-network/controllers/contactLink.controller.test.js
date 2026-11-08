import assert from 'node:assert/strict';
import test from 'node:test';

import { criarContactLinkController } from '../../../../src/features/support-network/controllers/contactLink.controller.js';

function resposta() {
    const estado = { status: null, body: null, headers: {} };
    return {
        estado,
        res: {
            set(nome, valor) { estado.headers[nome] = valor; return this; },
            status(valor) { estado.status = valor; return this; },
            json(valor) { estado.body = valor; return this; }
        }
    };
}

function criarController({ service = {}, contactValidator = {}, linkValidator = {} } = {}) {
    return criarContactLinkController({
        service: {
            async consultar() { return { versao: 'v1' }; },
            async atualizar() { return { contatoId: 9 }; },
            ...service
        },
        contactValidator: {
            validarContatoId() { return { valido: true, contatoId: 9 }; },
            ...contactValidator
        },
        linkValidator: {
            validarAtualizacao() {
                return {
                    valido: true,
                    dados: {
                        tipo: 'categoria',
                        categoriaId: 3,
                        permissoesIndividuais: null,
                        versao: new Date('2026-11-08T12:00:00.000Z')
                    }
                };
            },
            ...linkValidator
        }
    });
}

test('consulta vínculo usando somente a identidade autenticada', async () => {
    const chamadas = [];
    const controller = criarController({
        service: { async consultar(dados) { chamadas.push(dados); return { versao: 'v1' }; } }
    });
    const { res, estado } = resposta();

    await controller.consultar(
        { usuario: { id: 1, papel: 'principal' }, params: { contatoId: '9' } },
        res,
        assert.fail
    );

    assert.deepEqual(chamadas, [{ titularId: 1, papel: 'principal', contatoId: 9 }]);
    assert.equal(estado.status, 200);
    assert.equal(estado.headers['Cache-Control'], 'private, no-store');
});

test('atualiza vínculo validado e responde a mensagem exata', async () => {
    const chamadas = [];
    const controller = criarController({
        service: { async atualizar(dados) { chamadas.push(dados); return { contatoId: 9 }; } }
    });
    const { res, estado } = resposta();

    await controller.atualizar(
        { usuario: { id: 1, papel: 'principal' }, params: { contatoId: '9' }, body: {} },
        res,
        assert.fail
    );

    assert.equal(chamadas[0].titularId, 1);
    assert.equal(chamadas[0].contatoId, 9);
    assert.equal(estado.status, 200);
    assert.equal(estado.body.mensagem, 'Vínculo atualizado com sucesso.');
    assert.equal(estado.headers['Cache-Control'], 'no-store');
});

test('não chama o serviço com id ou corpo inválido', async () => {
    let chamadas = 0;
    const service = {
        async consultar() { chamadas += 1; },
        async atualizar() { chamadas += 1; }
    };
    const idInvalido = criarController({
        service,
        contactValidator: {
            validarContatoId() {
                return {
                    valido: false,
                    erro: { campo: 'contatoId', mensagem: 'Contato inválido.' }
                };
            }
        }
    });
    const corpoInvalido = criarController({
        service,
        linkValidator: {
            validarAtualizacao() {
                return {
                    valido: false,
                    erros: [{ campo: 'tipo', mensagem: 'Escolha um tipo válido.' }]
                };
            }
        }
    });

    const primeira = resposta();
    await idInvalido.consultar(
        { usuario: { id: 1 }, params: { contatoId: 'x' } },
        primeira.res,
        assert.fail
    );
    const segunda = resposta();
    await corpoInvalido.atualizar(
        { usuario: { id: 1 }, params: { contatoId: '9' }, body: {} },
        segunda.res,
        assert.fail
    );

    assert.equal(chamadas, 0);
    assert.equal(primeira.estado.status, 422);
    assert.equal(segunda.estado.status, 422);
});

test('preserva erro público e mascara falha interna com mensagem amigável', async () => {
    const publico = Object.assign(new Error('Desatualizado'), { status: 409 });
    const interno = new Error('detalhes do banco');
    const controllerPublico = criarController({
        service: { async atualizar() { throw publico; } }
    });
    const controllerInterno = criarController({
        service: { async consultar() { throw interno; } }
    });
    let erroPublico;
    let erroInterno;

    await controllerPublico.atualizar(
        { usuario: { id: 1 }, params: { contatoId: '9' }, body: {} },
        resposta().res,
        (erro) => { erroPublico = erro; }
    );
    await controllerInterno.consultar(
        { usuario: { id: 1 }, params: { contatoId: '9' } },
        resposta().res,
        (erro) => { erroInterno = erro; }
    );

    assert.equal(erroPublico.mensagemUsuario, undefined);
    assert.equal(
        erroInterno.mensagemUsuario,
        'Não foi possível atualizar o vínculo deste contato. Tente novamente.'
    );
});

test('rejeita configuração incompleta', () => {
    assert.throws(() => criarContactLinkController(), /configurar o controller de vínculo/);
});
