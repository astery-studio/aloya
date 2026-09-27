import test from 'node:test';
import assert from 'node:assert/strict';
import { criarAuthValidator } from '../../src/validators/auth.validator.js';

function criarValidator() {
    return criarAuthValidator({
        dateUtils: {
            criarDataValida: (valor) => {
                const data = new Date(`${valor}T00:00:00.000Z`);
                return Number.isNaN(data.getTime()) ? null : data;
            },
            calcularIdade: () => 25
        }
    });
}

function dadosValidos(alteracoes = {}) {
    return {
        nome: 'Carla Cristina', dataNascimento: '2000-05-13',
        email: 'carla@email.com', senha: 'senha-segura',
        dataInicioUltimaMenstruacao: '2026-01-10', ...alteracoes
    };
}

test('valida formatos inválidos dos campos opcionais', () => {
    const resultado = criarValidator().validarCadastro(dadosValidos({
        nome: 'Carla_123', dataFimUltimaMenstruacao: 'invalida',
        duracaoCicloInformada: 28.5, duracaoMenstruacaoInformada: -1,
        duracaoLuteaInformada: 0, emailResponsavelLegal: 'invalido'
    }));
    assert.equal(resultado.valido, false);
    assert.equal(resultado.erros.length, 6);
});

test('normaliza o e-mail antes de verificar disponibilidade', () => {
    const validator = criarValidator();
    assert.deepEqual(validator.validarEmail({ email: '  CARLA@EMAIL.COM  ' }), {
        valido: true, erros: [], dados: { email: 'carla@email.com' }
    });
    assert.equal(validator.validarEmail({ email: 'invalido' }).valido, false);
    assert.equal(validator.validarEmail({}).valido, false);
});
