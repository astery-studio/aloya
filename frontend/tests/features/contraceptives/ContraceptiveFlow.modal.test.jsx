import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { ContraceptiveFlow } from '../../../features/contraceptives/ContraceptiveFlow';

const mockSimpleModal = jest.fn(() => null);

jest.mock('../../../components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: (props) => mockSimpleModal(props)
}));
jest.mock('../../../screens/contraceptives/ContraceptivesScreen', () => {
    const { Pressable, Text } = require('react-native');
    return { ContraceptivesScreen: ({ onCadastrarNovo }) => (
        <Pressable accessibilityRole="button" onPress={onCadastrarNovo}>
            <Text>Cadastrar</Text>
        </Pressable>
    ) };
});
jest.mock('../../../screens/contraceptives/NewContraceptiveScreen', () => {
    const { Pressable, Text } = require('react-native');
    return { NewContraceptiveScreen: ({ onCadastrar }) => (
        <Pressable accessibilityRole="button" onPress={() => onCadastrar({ nome: 'Mercilon' })}>
            <Text>Salvar</Text>
        </Pressable>
    ) };
});

test('exibe o sucesso com o popup simples existente', async () => {
    await render(<ContraceptiveFlow />);
    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => {
        const propriedades = mockSimpleModal.mock.calls.at(-1)[0];
        expect(propriedades.visivel).toBe(true);
        expect(propriedades.titulo).toBe('Anticoncepcional cadastrado com sucesso.');
        expect(propriedades.acaoPrincipal).toEqual(expect.objectContaining({
            texto: 'OK', variante: 'verde'
        }));
    });
});
