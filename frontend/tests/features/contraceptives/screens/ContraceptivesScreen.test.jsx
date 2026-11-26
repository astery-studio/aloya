import { fireEvent, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { render } from '../mockTheme';
import { ContraceptivesScreen } from '../../../../src/features/contraceptives/screens/ContraceptivesScreen';

const metricas = {
    frame: { x: 0, y: 0, width: 393, height: 852 },
    insets: { top: 32, left: 0, right: 0, bottom: 24 }
};

jest.mock('phosphor-react-native', () => {
    const { Text: MockText } = require('react-native');
    return new Proxy(
        {},
        { get: (_, nome) => (props) => <MockText {...props}>{String(nome)}</MockText> }
    );
});
jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({ ArrowLeftIcon: () => null }));

test('oferece a ação para cadastrar um novo anticoncepcional', async () => {
    const onCadastrarNovo = jest.fn();
    await render(
        <SafeAreaProvider initialMetrics={metricas}>
            <ContraceptivesScreen onCadastrarNovo={onCadastrarNovo} />
        </SafeAreaProvider>
    );
    fireEvent.press(screen.getByRole('button', { name: 'Cadastrar novo anticoncepcional' }));
    expect(onCadastrarNovo).toHaveBeenCalledTimes(1);
});

test.each([
    ['durante o carregamento', { carregando: true }],
    ['quando ocorre erro', { erro: 'Falha ao carregar' }]
])('oculta a ação de cadastro %s', async (_, estado) => {
    await render(
        <SafeAreaProvider initialMetrics={metricas}>
            <ContraceptivesScreen onCadastrarNovo={jest.fn()} {...estado} />
        </SafeAreaProvider>
    );

    expect(
        screen.queryByRole('button', { name: 'Cadastrar novo anticoncepcional' })
    ).not.toBeOnTheScreen();
});

test('exibe o próximo horário do anticoncepcional cadastrado', async () => {
    await render(
        <ContraceptivesScreen
            anticoncepcionais={[
                {
                    id: '1',
                    nome: 'Mercilon',
                    tipo: 'pilula',
                    intensidadeAlerta: 'critico',
                    programacao: {
                        frequenciaId: 'pilula_continuo',
                        horarios: ['08:00'],
                        periodosPausa: []
                    }
                }
            ]}
        />
    );
    expect(screen.getByText('Próximo uso previsto: 08:00')).toBeOnTheScreen();
});
