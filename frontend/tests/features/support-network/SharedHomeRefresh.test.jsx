import { act, screen } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { SharedSupportFlow } from '../../../src/features/support-network/screens/SharedSupportFlow/SharedSupportFlow';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

function criarCiclo(ovulacao) {
    return {
        possuiCiclos: true,
        faseAtual: 'FOLICULAR',
        previsao: {
            proximoInicioEstimado: '2026-12-05',
            dataOvulacaoEstimada: ovulacao,
            confiabilidadeMenstrual: { nivel: 'media' }
        }
    };
}

test('atualiza a previsão na Home aberta, sem sobrepor consultas e somente em primeiro plano', async () => {
    jest.useFakeTimers();
    const estadoOriginal = AppState.currentState;
    const ouvintes = new Set();
    const assinatura = jest.spyOn(AppState, 'addEventListener').mockImplementation((_, ouvir) => {
        ouvintes.add(ouvir);
        return { remove: () => ouvintes.delete(ouvir) };
    });
    const permissoes = ['geral.fase_atual', 'geral.historico_ciclo'];
    let resolverAtualizacao;
    const consultarFase = jest
        .fn()
        .mockResolvedValueOnce(criarCiclo('2026-11-18'))
        .mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    resolverAtualizacao = resolve;
                })
        )
        .mockResolvedValue(criarCiclo('2026-11-24'));
    const service = {
        async consultar(_vinculoId, recurso) {
            const dados = recurso === '/fase' ? await consultarFase() : { nomeTitular: 'Júlia' };
            return { permissoes, dados };
        }
    };

    try {
        AppState.currentState = 'active';
        const tela = await render(
            <SharedSupportFlow tela="inicio" vinculoId={9} service={service} />
        );
        expect(screen.getByText('18 de novembro')).toBeOnTheScreen();

        await act(async () => jest.advanceTimersByTimeAsync(10000));
        expect(consultarFase).toHaveBeenCalledTimes(2);
        expect(screen.getByText('18 de novembro')).toBeOnTheScreen();

        await act(async () => resolverAtualizacao(criarCiclo('2026-11-21')));
        expect(screen.getByText('21 de novembro')).toBeOnTheScreen();
        expect(screen.queryByText('18 de novembro')).toBeNull();

        AppState.currentState = 'background';
        await act(async () => jest.advanceTimersByTimeAsync(5000));
        expect(consultarFase).toHaveBeenCalledTimes(2);

        AppState.currentState = 'active';
        await act(async () => ouvintes.forEach((ouvir) => ouvir('active')));
        expect(screen.getByText('24 de novembro')).toBeOnTheScreen();

        await tela.unmount();
        await act(async () => jest.advanceTimersByTimeAsync(5000));
        expect(consultarFase).toHaveBeenCalledTimes(3);
        expect(ouvintes.size).toBe(0);
    } finally {
        AppState.currentState = estadoOriginal;
        assinatura.mockRestore();
        jest.useRealTimers();
    }
});
