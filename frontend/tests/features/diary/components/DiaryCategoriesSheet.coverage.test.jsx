import { fireEvent, screen } from '@testing-library/react-native';

const mockUseDiaryCategoryPreferences = jest.fn();

jest.mock('../../../../src/features/diary/hooks/useDiaryCategoryPreferences', () => ({
    useDiaryCategoryPreferences: (...args) => mockUseDiaryCategoryPreferences(...args)
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const { Pressable, Text, View } = require('react-native');
    return {
        BottomSheet: ({ children, podeIniciarDeslize }) => (
            <View>
                <Pressable testID="sonda-deslize-categorias" onPress={podeIniciarDeslize}>
                    <Text>Verificar deslize</Text>
                </Pressable>
                {children}
            </View>
        )
    };
});

import { DiaryCategoriesSheet } from '../../../../src/features/diary/components/DiaryCategoriesSheet/DiaryCategoriesSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const catalogo = {
    versao: 1,
    macrocategorias: [
        {
            id: 'ciclo_sangramento',
            nome: 'Ciclo e Sangramento',
            ativa: true,
            categorias: [
                {
                    id: 'fluxo_menstrual',
                    nome: 'Fluxo menstrual',
                    ativaIndividual: true,
                    ativaEfetiva: true
                }
            ]
        }
    ]
};

test('cobre salvamento visível, falha da macro e a sonda de deslize', async () => {
    const alterarMacrocategoria = jest.fn().mockResolvedValue(false);
    const estado = {
        catalogo,
        carregando: false,
        salvando: 'macrocategoria:ciclo_sangramento',
        erro: null,
        erroCarregamento: false,
        alterarMacrocategoria,
        alterarCategoria: jest.fn(),
        tentarNovamente: jest.fn(),
        fecharErro: jest.fn()
    };
    mockUseDiaryCategoryPreferences.mockReturnValue(estado);
    const resultado = await render(<DiaryCategoriesSheet visivel service={{}} />);
    expect(screen.getByTestId('salvando-preferencia-diario')).toBeOnTheScreen();

    mockUseDiaryCategoryPreferences.mockReturnValue({ ...estado, salvando: null });
    await resultado.rerender(<DiaryCategoriesSheet visivel service={{}} />);
    await fireEvent.press(screen.getByTestId('sonda-deslize-categorias'));
    await fireEvent.press(screen.getByRole('switch', { name: 'Desativar Ciclo e Sangramento' }));
    expect(alterarMacrocategoria).toHaveBeenCalledWith('ciclo_sangramento', false);
});
