import assert from 'node:assert/strict';
import test from 'node:test';
import { dataUtc, validarCadastroAnticoncepcional } from '../../../src/features/contraceptives/contraceptive.validator.js';

const hoje = new Date('2026-09-24T12:00:00.000Z');
const base = { nome: 'Mercilon', tipo: 'pilula', frequenciaId: 'pilula_continuo', horarios: ['08:00'] };

function codigo(entrada) {
    try {
        validarCadastroAnticoncepcional(entrada, hoje);
        return null;
    } catch (erro) {
        return erro.codigo;
    }
}

test('recusa tipos, intensidades, datas e horários malformados', () => {
    const casos = [
        [null, 'NOME_OBRIGATORIO'],
        [{ nome: 10 }, 'NOME_OBRIGATORIO'],
        [{ ...base, tipo: 'implante' }, 'TIPO_INVALIDO'],
        [{ ...base, intensidadeAlerta: 'urgente' }, 'INTENSIDADE_INVALIDA'],
        [{ ...base, horarios: ['8h'] }, 'HORARIO_INVALIDO'],
        [{ ...base, horarios: ['08:00', '08:00'] }, 'HORARIO_REPETIDO'],
        [{ ...base, tipo: 'adesivo', frequenciaId: 'adesivo_continuo', horarios: ['08:00', '09:00'] }, 'QUANTIDADE_HORARIOS_INVALIDA'],
        [{ ...base, frequenciaId: 'pilula_21_7', dataPrimeiroUso: '2026-02-30' }, 'PRIMEIRO_USO_OBRIGATORIO']
    ];
    for (const [entrada, esperado] of casos) assert.equal(codigo(entrada), esperado);
    assert.equal(dataUtc(), null);
    assert.equal(dataUtc('2026/09/24'), null);
});

test('aceita aliases públicos e normaliza os dados persistidos', () => {
    const dados = validarCadastroAnticoncepcional({
        nome: '  Mercilon  ', tipo: 'pilula', frequencia: 'uso_continuo',
        horariosProgramados: ['20:00', '08:00'], nivelIntensidadeAlerta: 'leve'
    }, hoje);

    assert.equal(dados.nome, 'Mercilon');
    assert.equal(dados.intensidade, 'leve');
    assert.deepEqual(dados.horarios, ['08:00', '20:00']);
    assert.equal(dados.dataPrimeiroUso.toISOString(), '2026-09-24T00:00:00.000Z');
});

test('preserva a data inicial válida em um ciclo com pausa', () => {
    const dados = validarCadastroAnticoncepcional({
        ...base, frequenciaId: 'pilula_21_7', dataPrimeiroUso: '2026-09-01', intensidadeAlerta: 'moderado'
    }, hoje);

    assert.equal(dados.dataPrimeiroUso.toISOString(), '2026-09-01T00:00:00.000Z');
    assert.equal(dados.intensidade, 'moderado');
});
