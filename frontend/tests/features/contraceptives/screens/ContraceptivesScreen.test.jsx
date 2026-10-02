//Testa cadastro, exibição e navegação para edição na listagem de anticoncepcionais.
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ContraceptivesScreen } from '../../../../src/features/contraceptives/screens/ContraceptivesScreen';

jest.mock('phosphor-react-native', () => {
    const {
        Text: MockText
    } = require('react-native');

    return new Proxy({}, {
        get: (_, nome) => (props) => (
            <MockText {...props}>
                {String(nome)}
            </MockText>
        )
    });
});

jest.mock('phosphor-react-native/src/icons/ArrowLeft', () => ({
    ArrowLeftIcon: () => null
}));

const anticoncepcional = {
    id: '1',
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    programacao: {
        frequenciaId: 'pilula_continuo',
        horarios: ['08:00'],
        periodosPausa: []
    }
};

test('oferece a ação para cadastrar um novo anticoncepcional', async () => {
    const onCadastrarNovo = jest.fn();

    await render(
        <ContraceptivesScreen
            onCadastrarNovo={onCadastrarNovo}
        />
    );

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Cadastrar novo anticoncepcional'
        })
    );

    expect(onCadastrarNovo).toHaveBeenCalledTimes(1);
});

test('exibe o próximo horário do anticoncepcional cadastrado', async () => {
    await render(
        <ContraceptivesScreen
            anticoncepcionais={[
                anticoncepcional
            ]}
        />
    );

    expect(
        screen.getByText('Próximo uso previsto: 08:00')
    ).toBeOnTheScreen();
});

test('encaminha o anticoncepcional correto para a edição', async () => {
    const onEditar = jest.fn();

    await render(
        <ContraceptivesScreen
            anticoncepcionais={[
                anticoncepcional
            ]}
            onEditar={onEditar}
        />
    );

    fireEvent.press(
        screen.getByRole('button', {
            name: 'Mercilon, Pílula. Editar anticoncepcional'
        })
    );

    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(anticoncepcional);
});

test('mantém o card inacessível para edição quando a ação não foi fornecida', async () => {
    await render(
        <ContraceptivesScreen
            anticoncepcionais={[
                anticoncepcional
            ]}
        />
    );

    expect(
        screen.getByRole('button', {
            name: 'Mercilon, Pílula. Editar anticoncepcional'
        })
    ).toBeDisabled();
});