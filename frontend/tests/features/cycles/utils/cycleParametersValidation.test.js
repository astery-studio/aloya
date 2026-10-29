import {
    parametrosSaoIguais,
    validarParametrosCiclo
} from '../../../../src/features/cycles/utils/cycleParametersValidation';

const validos = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

describe('validação dos parâmetros do ciclo', () => {
    test('rejeita objeto ausente usando os valores padrão', () => {
        expect(Object.keys(validarParametrosCiclo())).toHaveLength(3);
        expect(parametrosSaoIguais()).toBe(false);
    });
    test('aceita os valores válidos e detecta alteração real', () => {
        expect(validarParametrosCiclo(validos)).toEqual({});
        expect(parametrosSaoIguais(validos, { ...validos })).toBe(true);
        expect(
            parametrosSaoIguais(validos, {
                ...validos,
                duracaoCicloInformada: 30
            })
        ).toBe(false);
    });

    test('exige valores inteiros e positivos', () => {
        const erros = validarParametrosCiclo({
            duracaoCicloInformada: null,
            duracaoMenstruacaoInformada: 5.5,
            duracaoLuteaInformada: 0
        });
        expect(Object.keys(erros)).toHaveLength(3);
    });

    test('impede menstruação maior ou igual ao ciclo', () => {
        const erros = validarParametrosCiclo({
            ...validos,
            duracaoMenstruacaoInformada: 28
        });
        expect(erros.duracaoMenstruacaoInformada).toBe(
            'A duração da menstruação deve ser menor que a duração do ciclo.'
        );
    });

    test('aplica o limite calculado da fase lútea', () => {
        const erros = validarParametrosCiclo({
            ...validos,
            duracaoCicloInformada: 20
        });
        expect(erros.duracaoLuteaInformada).toContain(
            'A duração da fase lútea informada não é compatível'
        );
    });
});
