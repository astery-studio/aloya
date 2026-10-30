//Testa a validação e a normalização segura das categorias de permissão.
import test from 'node:test';
import assert from 'node:assert/strict';

import { permissoesDaCategoria } from '../../../../src/features/support-network/constants/permissionCategory.constants.js';
import { criarPermissionCategoryValidator } from '../../../../src/features/support-network/validators/permissionCategory.validator.js';

const validator = criarPermissionCategoryValidator();

test('aceita 15 caracteres e rejeita 16 na criação e edição', () => {
    for (const nome of ['A'.repeat(15), 'A'.repeat(16)]) {
        const dados = { nome, dadosVisiveis: ['geral.fase_atual'] };
        assert.equal(validator.validarCriacaoCategoria(dados).valido, nome.length === 15);
        assert.equal(
            validator.validarEdicaoCategoria({ ...dados, atualizadoEm: '2026-10-26T12:00:00.000Z' })
                .valido,
            nome.length === 15
        );
    }
});

//Cria um corpo válido que pode ser modificado individualmente pelos testes.
function criarBodyValido() {
    return {
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual', 'ciclo.fluxo_menstrual']
    };
}

test('o catálogo possui 29 permissões únicas', () => {
    assert.equal(permissoesDaCategoria.length, 29);
    assert.equal(new Set(permissoesDaCategoria).size, 29);
    assert.equal(Object.isFrozen(permissoesDaCategoria), true);
});

test('aceita somente identificadores positivos e seguros na edição', () => {
    assert.equal(validator.validarIdCategoria('1'), 1);
    assert.equal(validator.validarIdCategoria(42), 42);

    for (const id of [
        undefined,
        null,
        '',
        '0',
        '-1',
        '1.5',
        '01',
        'abc',
        Number.MAX_SAFE_INTEGER + 1
    ]) {
        assert.throws(() => validator.validarIdCategoria(id), {
            name: 'TypeError',
            message: 'Identificador de categoria inválido.'
        });
    }
});

test('aceita e normaliza um corpo completo de edição', () => {
    const resultado = validator.validarEdicaoCategoria({
        nome: '  Namorado  ',
        dadosVisiveis: ['emocional.sintomas_emocionais', 'geral.fase_atual'],
        atualizadoEm: '2026-10-26T12:00:00.000Z'
    });

    assert.equal(resultado.valido, true);
    assert.deepEqual(resultado.dados, {
        nome: 'Namorado',
        nomeNormalizado: 'namorado',
        dadosVisiveis: ['geral.fase_atual', 'emocional.sintomas_emocionais'],
        atualizadoEm: new Date('2026-10-26T12:00:00.000Z'),
        quantidadeContatosConfirmada: null
    });
});

test('rejeita corpo de edição nulo, em lista ou com protótipo modificado', () => {
    const corpoComPrototipo = {
        ...criarBodyValido(),
        atualizadoEm: '2026-10-26T12:00:00.000Z'
    };

    Object.setPrototypeOf(corpoComPrototipo, { titularId: 999 });

    for (const body of [null, [], corpoComPrototipo]) {
        const resultado = validator.validarEdicaoCategoria(body);

        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros[0].campo, 'dados');
    }
});

test('rejeita campos internos e de outra titular na edição', () => {
    const resultado = validator.validarEdicaoCategoria({
        ...criarBodyValido(),
        atualizadoEm: '2026-10-26T12:00:00.000Z',
        titularId: 999,
        quantidadeContatos: 30,
        nomeNormalizado: 'categoria-forjada'
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((erro) => erro.campo === 'dados'),
        true
    );
});

test('rejeita versão ausente, inválida ou não canônica na edição', () => {
    for (const atualizadoEm of [
        undefined,
        null,
        '',
        '2026-10-26',
        '2026-10-26T12:00:00Z',
        'data-inválida'
    ]) {
        const resultado = validator.validarEdicaoCategoria({
            ...criarBodyValido(),
            atualizadoEm
        });

        assert.equal(resultado.valido, false);
        assert.equal(
            resultado.erros.some((erro) => erro.campo === 'atualizadoEm'),
            true
        );
    }
});

test('aceita a quantidade exata de contatos confirmada pela titular', () => {
    const resultado = validator.validarEdicaoCategoria({
        ...criarBodyValido(),
        atualizadoEm: '2026-10-26T12:00:00.000Z',
        quantidadeContatosConfirmada: 3
    });

    assert.equal(resultado.valido, true);
    assert.equal(resultado.dados.quantidadeContatosConfirmada, 3);
});

test('rejeita confirmação de impacto negativa, fracionária ou textual', () => {
    for (const quantidadeContatosConfirmada of [-1, 1.5, '3', null, Number.MAX_SAFE_INTEGER + 1]) {
        const resultado = validator.validarEdicaoCategoria({
            ...criarBodyValido(),
            atualizadoEm: '2026-10-26T12:00:00.000Z',
            quantidadeContatosConfirmada
        });

        assert.equal(resultado.valido, false);
        assert.equal(
            resultado.erros.some((erro) => erro.campo === 'quantidadeContatosConfirmada'),
            true
        );
    }
});

test('reaplica a mensagem de nome obrigatório durante a edição', () => {
    const resultado = validator.validarEdicaoCategoria({
        nome: '   ',
        dadosVisiveis: ['geral.fase_atual'],
        atualizadoEm: '2026-10-26T12:00:00.000Z'
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((erro) => erro.mensagem === 'Dê um nome para a categoria.'),
        true
    );
});

test('reaplica a mensagem de permissão obrigatória durante a edição', () => {
    const resultado = validator.validarEdicaoCategoria({
        nome: 'Namorado',
        dadosVisiveis: [],
        atualizadoEm: '2026-10-26T12:00:00.000Z'
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some(
            (erro) =>
                erro.mensagem ===
                'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
        ),
        true
    );
});

test('aceita uma categoria válida e normaliza seu nome', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: '  Família   Próxima  ',
        dadosVisiveis: ['geral.fase_atual']
    });

    assert.equal(resultado.valido, true);

    assert.deepEqual(resultado.dados, {
        nome: 'Família Próxima',
        nomeNormalizado: 'família próxima',
        dadosVisiveis: ['geral.fase_atual']
    });
});

test('rejeita nome vazio ou formado somente por espaços', () => {
    for (const nome of ['', '   ', null, undefined]) {
        const resultado = validator.validarCriacaoCategoria({
            nome,
            dadosVisiveis: ['geral.fase_atual']
        });

        assert.equal(resultado.valido, false);
        assert.equal(
            resultado.erros.some((erro) => erro.mensagem === 'Dê um nome para a categoria.'),
            true
        );
    }
});

test('rejeita categoria sem nenhuma permissão', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Família',
        dadosVisiveis: []
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some(
            (erro) =>
                erro.mensagem ===
                'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.'
        ),
        true
    );
});

test('rejeita identificadores de permissão que não pertencem ao catálogo', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Categoria perigosa',
        dadosVisiveis: ['administrador.acesso_total']
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((erro) => erro.campo === 'dadosVisiveis'),
        true
    );
});

test('remove permissões repetidas e mantém a ordem oficial', () => {
    const resultado = validator.validarCriacaoCategoria({
        nome: 'Família',
        dadosVisiveis: ['ciclo.fluxo_menstrual', 'geral.fase_atual', 'ciclo.fluxo_menstrual']
    });

    assert.equal(resultado.valido, true);

    assert.deepEqual(resultado.dados.dadosVisiveis, ['geral.fase_atual', 'ciclo.fluxo_menstrual']);
});

test('rejeita campos protegidos enviados pelo cliente', () => {
    const resultado = validator.validarCriacaoCategoria({
        ...criarBodyValido(),
        titularId: 999,
        quantidadeContatos: 50,
        papel: 'administrador'
    });

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((erro) => erro.campo === 'dados'),
        true
    );
});

test('rejeita tentativa de prototype pollution', () => {
    const body = JSON.parse(
        '{"nome":"Família","dadosVisiveis":["geral.fase_atual"],"__proto__":{"papel":"administrador"}}'
    );
    const resultado = validator.validarCriacaoCategoria(body);

    assert.equal(resultado.valido, false);
    assert.equal(
        resultado.erros.some((erro) => erro.campo === 'dados'),
        true
    );
    assert.equal({}.papel, undefined);
});

test('rejeita HTML, caracteres de controle e nomes excessivamente grandes', () => {
    const nomesInvalidos = ['<script>alert(1)</script>', 'Família\nPrivada', 'A'.repeat(81)];

    for (const nome of nomesInvalidos) {
        const resultado = validator.validarCriacaoCategoria({
            nome,
            dadosVisiveis: ['geral.fase_atual']
        });

        assert.equal(resultado.valido, false);
        assert.equal(
            resultado.erros.some((erro) => erro.campo === 'nome'),
            true
        );
    }
});

test('rejeita corpo nulo, lista ou objeto com protótipo modificado', () => {
    const objetoComPrototipoModificado = criarBodyValido();

    Object.setPrototypeOf(objetoComPrototipoModificado, {
        titularId: 999
    });

    for (const body of [null, [], objetoComPrototipoModificado]) {
        const resultado = validator.validarCriacaoCategoria(body);

        assert.equal(resultado.valido, false);
        assert.equal(resultado.erros[0].campo, 'dados');
    }
});
