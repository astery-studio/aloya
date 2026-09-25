import assert from 'node:assert/strict';
import test from 'node:test';
import { validarCadastroAnticoncepcional } from '../src/features/contraceptives/contraceptive.validator.js';

const hoje = new Date('2026-09-24T12:00:00.000Z');
const base = { nome: 'Mercilon', tipo: 'pilula', frequenciaId: 'pilula_continuo', horarios: ['08:00'] };

function mensagemDe(entrada) {
    try {
        validarCadastroAnticoncepcional(entrada, hoje);
        return null;
    } catch (erro) {
        return erro.message;
    }
}

test('exige nome com a mensagem definida na história', () => {
    assert.equal(mensagemDe({ ...base, nome: ' ' }), 'Informe o nome do anticoncepcional.');
});

test('exige ao menos um horário nos tipos programados', () => {
    assert.equal(mensagemDe({ ...base, horarios: [] }), 'Informe ao menos um horário de uso.');
});

test('permite múltiplos horários somente para pílula diária', () => {
    const pilula = validarCadastroAnticoncepcional({ ...base, horarios: ['08:00', '20:00'] }, hoje);
    assert.deepEqual(pilula.horarios, ['08:00', '20:00']);
    assert.match(mensagemDe({
        ...base, tipo: 'adesivo', frequenciaId: 'adesivo_continuo', horarios: ['08:00', '20:00']
    }), /exatamente um horário/);
});

test('recusa frequência incompatível com o tipo', () => {
    assert.match(mensagemDe({ ...base, tipo: 'injetavel' }), /frequência compatível/);
});

test('DIU exige validade atual ou futura e dispensa agenda', () => {
    const diu = { nome: 'Mirena', tipo: 'diu_hormonal' };
    assert.match(mensagemDe({ ...diu, dataValidade: '2026-09-23' }), /data de validade/);
    const valido = validarCadastroAnticoncepcional({ ...diu, dataValidade: '2026-09-24' }, hoje);
    assert.deepEqual(valido.horarios, []);
    assert.equal(valido.frequencia, null);
});

test('exige primeiro uso em frequência com pausa e aplica alerta crítico', () => {
    assert.equal(mensagemDe({ ...base, frequenciaId: 'pilula_21_7' }), 'Informe a data do primeiro uso.');
    const dados = validarCadastroAnticoncepcional({
        ...base, frequenciaId: 'pilula_21_7', dataPrimeiroUso: '2026-09-01'
    }, hoje);
    assert.equal(dados.intensidade, 'critico');
});
