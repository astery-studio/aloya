import {
    criarEstilos,
    estilos
} from '../../../../src/features/settings/screens/ProfileSettingsScreen.style';
import { temaClaro, temaEscuro } from '../../../../src/shared/theme/themePalettes';

describe('ProfileSettingsScreen.style', () => {
    test('mantém os estilos claros usados durante a migração', () => {
        expect(estilos.textoEstado.color).toBe('#5C5C59');
        expect(estilos.tituloErro.color).toBe('#222222');
        expect(estilos.separadorRodape.backgroundColor).toBe('#E6E2D8');
    });

    test('cria estilos com as cores do tema claro', () => {
        const estilosClaros = criarEstilos(temaClaro);

        expect(estilosClaros.textoEstado.color).toBe('#5C5C59');
        expect(estilosClaros.tituloErro.color).toBe('#222222');
        expect(estilosClaros.mensagemErro.color).toBe('#5C5C59');
        expect(estilosClaros.acaoNormal.color).toBe('#5C5C59');
        expect(estilosClaros.separadorRodape.backgroundColor).toBe('#E6E2D8');
    });

    test('cria estilos com as cores do tema escuro', () => {
        const estilosEscuros = criarEstilos(temaEscuro);

        expect(estilosEscuros.textoEstado.color).toBe('#C4C8C5');
        expect(estilosEscuros.tituloErro.color).toBe('#F4F1EA');
        expect(estilosEscuros.mensagemErro.color).toBe('#C4C8C5');
        expect(estilosEscuros.acaoNormal.color).toBe('#C4C8C5');
        expect(estilosEscuros.separadorRodape.backgroundColor).toBe('#4A514D');
    });

    test('preserva os estados visuais de interação', () => {
        const estilosClaros = criarEstilos(temaClaro);
        const estilosEscuros = criarEstilos(temaEscuro);

        expect(estilosClaros.acaoPressionada.opacity).toBe(0.6);
        expect(estilosEscuros.acaoPressionada.opacity).toBe(0.6);
        expect(estilosClaros.acaoDesabilitada.opacity).toBe(0.4);
        expect(estilosEscuros.acaoDesabilitada.opacity).toBe(0.4);
    });

    test('mantém a cor semântica de perigo', () => {
        const estilosClaros = criarEstilos(temaClaro);
        const estilosEscuros = criarEstilos(temaEscuro);

        expect(estilosClaros.acaoPerigo.color).toBe(temaClaro.cores.feedback.erro);
        expect(estilosEscuros.acaoPerigo.color).toBe(temaEscuro.cores.feedback.erro);
    });
});
