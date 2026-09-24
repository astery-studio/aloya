/**
 * Testes das regras de entrada aplicadas ao cadastro de conta.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    criarAuthValidator
} from '../src/validators/auth.validator.js';

import * as dateUtils from '../src/utils/date.utils.js';

function criarDadosValidos(alteracoes = {}) {
    return {
        nome: 'Carla Cristina',
        dataNascimento: '2000-05-13',
        email: 'carla@email.com',
        senha: 'senha-segura',
        dataInicioUltimaMenstruacao: '2026-01-10',
        dataFimUltimaMenstruacao: '2026-01-14',
        duracaoCicloInformada: 28,
        duracaoMenstruacaoInformada: 5,
        duracaoLuteaInformada: 14,
        ...alteracoes
    };
}

function criarValidator() {
    return criarAuthValidator({
        dateUtils
    });
}

test(
    'aceita cadastro válido e normaliza nome e e-mail',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    nome: '  Carla   Cristina  ',
                    email: '  CARLA@EMAIL.COM  '
                })
            );

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.equal(
            resultado.dados.nome,
            'Carla Cristina'
        );

        assert.equal(
            resultado.dados.email,
            'carla@email.com'
        );

        assert.equal(
            resultado.dados.menorDe16,
            false
        );

        assert.equal(
            resultado.dados.emailResponsavelLegal,
            null
        );

        assert.equal(
            resultado.dados.dataNascimento
                instanceof Date,
            true
        );

        assert.equal(
            resultado.dados
                .dataInicioUltimaMenstruacao
                instanceof Date,
            true
        );
    }
);

test(
    'permite cadastro sem os parâmetros opcionais do ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataFimUltimaMenstruacao:
                        undefined,

                    duracaoCicloInformada:
                        undefined,

                    duracaoMenstruacaoInformada:
                        undefined,

                    duracaoLuteaInformada:
                        undefined
                })
            );

        assert.equal(resultado.valido, true);
        assert.deepEqual(resultado.erros, []);

        assert.equal(
            resultado.dados
                .dataFimUltimaMenstruacao,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoCicloInformada,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoMenstruacaoInformada,
            null
        );

        assert.equal(
            resultado.dados
                .duracaoLuteaInformada,
            null
        );
    }
);

test(
    'identifica menor de 16 anos e normaliza o e-mail do responsável',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',

                    emailResponsavelLegal:
                        '  RESPONSAVEL@EMAIL.COM  '
                })
            );

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.menorDe16,
            true
        );

        assert.equal(
            resultado.dados
                .emailResponsavelLegal,
            'responsavel@email.com'
        );
    }
);

test(
    'permite que menor conclua o cadastro sem e-mail do responsável',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',
                    emailResponsavelLegal: ''
                })
            );

        assert.equal(resultado.valido, true);

        assert.equal(
            resultado.dados.menorDe16,
            true
        );

        assert.equal(
            resultado.dados
                .emailResponsavelLegal,
            null
        );
    }
);

test(
    'rejeita o e-mail do responsável igual ao e-mail do titular',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2015-05-13',

                    email:
                        'TITULAR@EMAIL.COM',

                    emailResponsavelLegal:
                        ' titular@email.com '
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                        'emailResponsavelLegal' &&
                    item.mensagem ===
                        'O e-mail do responsável deve ser diferente do seu e-mail de cadastro.'
            ),
            true
        );
    }
);

test(
    'rejeita duração da menstruação maior ou igual à duração do ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    duracaoCicloInformada: 28,
                    duracaoMenstruacaoInformada: 28
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                        'duracaoMenstruacaoInformada' &&
                    item.mensagem ===
                        'A duração da menstruação deve ser menor que a duração do ciclo.'
            ),
            true
        );
    }
);

test(
    'rejeita duração da fase lútea incompatível com o ciclo',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    duracaoCicloInformada: 20,
                    duracaoMenstruacaoInformada: 5,
                    duracaoLuteaInformada: 14
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                        'duracaoLuteaInformada' &&
                    item.mensagem ===
                        'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.'
            ),
            true
        );
    }
);

test(
    'rejeita datas futuras de nascimento e menstruação',
    () => {
        const validator = criarValidator();

        const resultado =
            validator.validarCadastro(
                criarDadosValidos({
                    dataNascimento: '2999-01-01',

                    dataInicioUltimaMenstruacao:
                        '2999-01-01',

                    dataFimUltimaMenstruacao:
                        undefined
                })
            );

        assert.equal(resultado.valido, false);

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                    'dataNascimento'
            ),
            true
        );

        assert.equal(
            resultado.erros.some(
                (item) =>
                    item.campo ===
                    'dataInicioUltimaMenstruacao'
            ),
            true
        );
    }
);

test(
    'rejeita senha de cadastro com menos de oito caracteres',
    () => {
        const validator = criarValidator();
        const resultado = validator.validarCadastro(
            criarDadosValidos({ senha: '1234567' })
        );

        assert.equal(resultado.valido, false);
        assert.deepEqual(
            resultado.erros,
            [{
                campo: 'senha',
                mensagem:
                    'A senha deve possuir pelo menos 8 caracteres.'
            }]
        );
    }
);

test(
    'rejeita senha excessivamente longa antes de executar o bcrypt',
    () => {
        const resultado = criarValidator().validarCadastro(
            criarDadosValidos({ senha: 'a'.repeat(129) })
        );

        assert.equal(resultado.valido, false);
        assert.deepEqual(
            resultado.erros,
            [{
                campo: 'senha',
                mensagem:
                    'A senha deve possuir no máximo 128 caracteres.'
            }]
        );
    }
);

test(
    'trata corpo ausente como cadastro inválido sem gerar erro interno',
    () => {
        const resultado =
            criarValidator().validarCadastro(null);

        assert.equal(resultado.valido, false);
        assert.ok(resultado.erros.length > 0);
        assert.ok(
            resultado.erros.some(
                ({ campo }) => campo === 'senha'
            )
        );
    }
);
