import { obterEstiloCampo } from '../../../../src/features/settings/profile/ProfileField';
import { criarEstilos } from '../../../../src/features/settings/profile/ProfileField.style';
import { temaClaro } from '../../../../src/shared/theme/themePalettes';

describe('ProfileField - interação visual', () => {
    const estilos = criarEstilos(temaClaro);

    test('aplica estilo pressionado durante o toque', () => {
        const resultado = obterEstiloCampo({
            estilos,
            pressionado: true,
            desabilitado: false
        });

        expect(resultado).toContain(estilos.pressionado);

        expect(resultado).not.toContain(estilos.desabilitado);
    });

    test('não aplica pressionado no estado normal', () => {
        const resultado = obterEstiloCampo({
            estilos,
            pressionado: false,
            desabilitado: false
        });

        expect(resultado).not.toContain(estilos.pressionado);

        expect(resultado).not.toContain(estilos.desabilitado);
    });

    test('não aplica pressionado quando desabilitado', () => {
        const resultado = obterEstiloCampo({
            estilos,
            pressionado: true,
            desabilitado: true
        });

        expect(resultado).not.toContain(estilos.pressionado);

        expect(resultado).toContain(estilos.desabilitado);
    });

    test('sempre mantém o estilo estrutural', () => {
        const resultado = obterEstiloCampo({
            estilos,
            pressionado: false,
            desabilitado: true
        });

        expect(resultado[0]).toBe(estilos.container);
    });
});
