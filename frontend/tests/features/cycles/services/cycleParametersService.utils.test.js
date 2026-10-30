import {
    filtrarParametros,
    normalizarParametros
} from '../../../../src/features/cycles/services/cycleParametersService.utils';

const parametros = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

describe('normalização dos parâmetros do ciclo', () => {
    test('aceita somente a estrutura esperada da API', () => {
        expect(normalizarParametros({ parametros })).toEqual(parametros);
        expect(() =>
            normalizarParametros({
                parametros: {
                    ...parametros,
                    duracaoLuteaInformada: null
                }
            })
        ).toThrow('A API retornou parâmetros do ciclo inválidos.');
    });

    test('filtra os três campos permitidos', () => {
        expect(filtrarParametros(parametros)).toEqual(parametros);
    });

    test.each([
        null,
        [],
        { ...parametros, usuarioId: 9 },
        { ...parametros, duracaoCicloInformada: 0 },
        { ...parametros, duracaoMenstruacaoInformada: 5.5 }
    ])('rejeita dados inseguros: %p', (dados) => {
        expect(() => filtrarParametros(dados)).toThrow('Os parâmetros do ciclo são inválidos.');
    });
});
