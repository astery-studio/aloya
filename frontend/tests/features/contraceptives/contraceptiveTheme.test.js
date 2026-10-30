import { temaEscuro } from '../../../src/shared/theme/themePalettes';
import { criarEstilosCartao } from '../../../src/features/contraceptives/components/ContraceptiveUsageCard.styles';
import { criarEstilosUso } from '../../../src/features/contraceptives/components/usageComponents.styles';
import { criarEstilos as criarEstilosFormulario } from '../../../src/features/contraceptives/forms/contraceptiveForms.styles';
import { criarEstilos as criarEstilosTelas } from '../../../src/features/contraceptives/screens/contraceptiveScreens.styles';
import { criarEstilosAcompanhamento } from '../../../src/features/contraceptives/screens/ContraceptiveTrackingScreen.styles';

describe('tema escuro de anticoncepcionais', () => {
    test('aplica superfícies e textos escuros aos cartões e ao histórico', () => {
        const cartao = criarEstilosCartao(temaEscuro);
        const historico = criarEstilosUso(temaEscuro);

        expect(cartao.card).toMatchObject({
            backgroundColor: temaEscuro.cores.interface.superficie,
            borderColor: temaEscuro.cores.interface.borda
        });
        expect(historico.calendario.backgroundColor).toBe(
            temaEscuro.cores.interface.superficieElevada
        );
        expect(historico.numeroDia.color).toBe(temaEscuro.cores.interface.textoPrincipal);
    });

    test('aplica o fundo escuro aos formulários e telas', () => {
        const formulario = criarEstilosFormulario(temaEscuro);
        const telas = criarEstilosTelas(temaEscuro);
        const acompanhamento = criarEstilosAcompanhamento(temaEscuro);

        expect(formulario.telaFluxo.backgroundColor).toBe(temaEscuro.cores.interface.fundo);
        expect(telas.tela.backgroundColor).toBe(temaEscuro.cores.interface.fundo);
        expect(acompanhamento.tela.backgroundColor).toBe(temaEscuro.cores.interface.fundo);
        expect(acompanhamento.titulo.color).toBe(temaEscuro.cores.interface.textoPrincipal);
    });
});
