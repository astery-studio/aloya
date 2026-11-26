import { screen } from '@testing-library/react-native';

import { CyclesScreen } from '../../../../src/features/cycles/screens/CyclesScreen';
import { criarEstilos } from '../../../../src/features/cycles/screens/CyclesScreen.styles';
import { temaClaro } from '../../../../src/shared/theme/themePalettes';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test('apresenta a vitrine de ciclos com contraste do tema escuro', async () => {
    await renderWithTheme(<CyclesScreen />, { preferencia: 'escuro' });

    expect(screen.getByText('Teste do histórico de ciclos')).toHaveStyle({
        color: '#F4F1EA'
    });
    expect(screen.getByText('Ciclos registrados')).toBeOnTheScreen();
    expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(5);
});

test('mantém o espaçamento no início da lista sem alterar a descrição', () => {
    const estilos = criarEstilos(temaClaro);

    expect(estilos.conteudo.paddingTop).toBe(8);
    expect(estilos.descricao).toMatchObject({
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
        lineHeight: 24
    });
});
