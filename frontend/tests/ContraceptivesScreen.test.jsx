import { fireEvent, render, screen } from '@testing-library/react-native';
import { ContraceptivesScreen } from '../screens/contraceptives/ContraceptivesScreen';

jest.mock('phosphor-react-native', () => {
    const { Text: MockText } = require('react-native');
    return new Proxy({}, { get: (_, nome) => (props) => <MockText {...props}>{String(nome)}</MockText> });
});
jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({ ArrowLeftIcon: () => null }));

test('oferece a ação para cadastrar um novo anticoncepcional', async () => {
    const onCadastrarNovo = jest.fn();
    await render(<ContraceptivesScreen onCadastrarNovo={onCadastrarNovo} />);
    fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(onCadastrarNovo).toHaveBeenCalledTimes(1);
});

test('exibe o próximo horário do anticoncepcional cadastrado', async () => {
    await render(<ContraceptivesScreen anticoncepcionais={[{
        id: '1', nome: 'Mercilon', tipo: 'pilula', intensidadeAlerta: 'critico',
        programacao: { frequenciaId: 'pilula_continuo', horarios: ['08:00'], periodosPausa: [] }
    }]} />);
    expect(screen.getByText('Próximo uso previsto: 08:00')).toBeOnTheScreen();
});
