//Testa a validação segura dos dados e identificadores usados na edição de anticoncepcionais.
import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validarEdicaoAnticoncepcional,
    validarIdAnticoncepcional
} from '../../../../src/features/contraceptives/validators/contraceptive.validator.js';

const hoje = new Date('2026-10-02T12:00:00.000Z');

const pilulaValida = {
    nome: 'Mercilon',
    tipo: 'pilula',
    frequenciaId: 'pilula_continuo',
    horarios: ['08:00'],
    dataPrimeiroUso: '2026-09-01',
    dataValidade: null,
    intensidadeAlerta: 'critico'
};

//Executa a validação e devolve o erro controlado para facilitar cada cenário.
function capturarErro(acao) {
    try {
        acao();
        return null;
    } catch (erro) {
        return erro;
    }
}

test('aceita e normaliza uma edição completa válida', () => {
    const dados = validarEdicaoAnticoncepcional({
        ...pilulaValida,
        nome: '  Mercilon Atualizado  ',
        horarios: ['20:00', '08:00'],
        intensidadeAlerta: 'moderado'
    }, hoje);

    assert.equal(dados.nome, 'Mercilon Atualizado');
    assert.equal(dados.tipo, 'pilula');
    assert.equal(dados.intensidade, 'moderado');
    assert.deepEqual(dados.horarios, ['08:00', '20:00']);
    assert.equal(dados.frequencia, 'uso_continuo');
    assert.equal(dados.dataValidade, null);
});

test('rejeita corpos nulos, listas e valores primitivos', () => {
    for (const entrada of [null, [], 'dados', 10, true]) {
        const erro = capturarErro(() => validarEdicaoAnticoncepcional(entrada, hoje));

        assert.equal(erro?.status, 422);
        assert.equal(erro?.codigo, 'CORPO_INVALIDO');
    }
});

test('rejeita campos desconhecidos e campos protegidos', () => {
    const camposProtegidos = [
        {usuarioId: 99},
        {id: 2},
        {criadoEm: '2026-01-01T00:00:00.000Z'},
        {atualizadoEm: '2026-01-01T00:00:00.000Z'},
        {nivelIntensidadeAlerta: 'leve'},
        {horariosProgramados: ['09:00']},
        {papel: 'admin'}
    ];

    for (const campo of camposProtegidos) {
        const erro = capturarErro(() => validarEdicaoAnticoncepcional({...pilulaValida, ...campo}, hoje));

        assert.equal(erro?.status, 422);
        assert.equal(erro?.codigo, 'CAMPOS_NAO_PERMITIDOS');
    }
});

test('exige a intensidade explicitamente na edição', () => {
    const entrada = {...pilulaValida};
    delete entrada.intensidadeAlerta;

    const erro = capturarErro(() => validarEdicaoAnticoncepcional(entrada, hoje));

    assert.equal(erro?.codigo, 'INTENSIDADE_INVALIDA');
});

test('rejeita frequência antiga incompatível quando o tipo muda', () => {
    const erro = capturarErro(() => validarEdicaoAnticoncepcional({
        ...pilulaValida,
        tipo: 'injetavel',
        frequenciaId: 'pilula_continuo'
    }, hoje));

    assert.equal(erro?.codigo, 'FREQUENCIA_INVALIDA');
});

test('limpa agenda e frequência quando o novo tipo é DIU', () => {
    const dados = validarEdicaoAnticoncepcional({
        ...pilulaValida,
        tipo: 'diu_hormonal',
        dataValidade: '2030-10-02'
    }, hoje);

    assert.deepEqual(dados.horarios, []);
    assert.equal(dados.frequencia, null);
    assert.equal(dados.regraFrequencia, null);
    assert.equal(dados.dataPrimeiroUso, null);
    assert.equal(dados.dataValidade.toISOString(), '2030-10-02T00:00:00.000Z');
});

test('anel não exige validade e descarta uma validade antiga', () => {
    const anel = {
        nome: 'Anel',
        tipo: 'anel_vaginal',
        frequenciaId: 'anel_21',
        horarios: ['09:00'],
        dataPrimeiroUso: '2026-10-02',
        dataValidade: '2026-12-01',
        intensidadeAlerta: 'leve'
    };

    const dados = validarEdicaoAnticoncepcional(anel, hoje);

    assert.equal(dados.frequencia, 'uso_21_dias');
    assert.deepEqual(dados.horarios, ['09:00']);
    assert.equal(dados.dataValidade, null);
});

test('aceita somente identificadores inteiros positivos e seguros', () => {
    assert.equal(validarIdAnticoncepcional('1'), 1);
    assert.equal(validarIdAnticoncepcional(42), 42);

    for (const id of [undefined, null, '', '0', '-1', '1.5', '1abc', '01', Number.MAX_SAFE_INTEGER + 1]) {
        const erro = capturarErro(() => validarIdAnticoncepcional(id));

        assert.equal(erro?.status, 400);
        assert.equal(erro?.codigo, 'ID_ANTICONCEPCIONAL_INVALIDO');
    }
});

test('rejeita listas de horários com posições vazias', () => {
    const horarios = new Array(1);
    const erro = capturarErro(() => validarEdicaoAnticoncepcional({...pilulaValida, horarios}, hoje));

    assert.equal(erro?.status, 422);
    assert.equal(erro?.codigo, 'HORARIO_INVALIDO');
});