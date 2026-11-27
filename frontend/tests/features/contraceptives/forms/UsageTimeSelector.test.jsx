// Testa o horário de uso e a redução de cadastros antigos a um horário.
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { render } from '../mockTheme';
import { UsageTimeSelector } from '../../../../src/features/contraceptives/forms/UsageTimeSelector';

const mockTimeInput = jest.fn();

jest.mock('phosphor-react-native', () => ({
    Clock: () => null
}));

jest.mock('../../../../src/features/contraceptives/forms/SelectorField', () => {
    const { Pressable, Text } = require('react-native');

    return {
        SelectorField: ({ label, valor, placeholder, onPress }) => (
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${label}: ${valor || placeholder}`}
                onPress={onPress}
            >
                <Text>{valor || placeholder}</Text>
            </Pressable>
        )
    };
});

jest.mock('../../../../src/shared/components/forms/TimeInput', () => {
    const { Pressable, Text, View } = require('react-native');

    return {
        __esModule: true,
        default: (props) => {
            mockTimeInput(props);
            const identificador = props.valor || 'vazio';

            return (
                <View>
                    <Text>{identificador}</Text>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Alterar horário ${identificador}`}
                        onPress={() => props.onChangeText(props.valor ? '09:30' : '08:00')}
                    >
                        <Text>Alterar</Text>
                    </Pressable>

                    {props.podeRemover ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Remover horário ${identificador}`}
                            onPress={props.aoRemover}
                        >
                            <Text>Remover</Text>
                        </Pressable>
                    ) : null}
                </View>
            );
        }
    };
});

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const { Pressable, Text } = require('react-native');

    return {
        __esModule: true,
        default: ({ texto, aoPressionar, desativado }) => (
            <Pressable accessibilityRole="button" accessibilityLabel={texto} onPress={aoPressionar}
                disabled={desativado} accessibilityState={{ disabled: desativado }}>
                <Text>{texto}</Text>
            </Pressable>
        )
    };
});

jest.mock('../../../../src/shared/components/navigation/Header/Header', () => {
    const { Pressable, Text, View } = require('react-native');

    return {
        Header: ({ titulo, onVoltar }) => (
            <View>
                <Text>{titulo}</Text>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    onPress={onVoltar}
                >
                    <Text>Voltar</Text>
                </Pressable>
            </View>
        )
    };
});

beforeEach(() => {
    jest.clearAllMocks();
});

test('mostra o resumo dos horários e abre o seletor', async () => {
    const usuario = userEvent.setup();
    const onAbrir = jest.fn();

    await render(
        <UsageTimeSelector
            horarios={['08:00', '20:00']}
            aberto={false}
            onAbrir={onAbrir}
            onConfirmar={jest.fn()}
            onFechar={jest.fn()}
        />
    );

    const campo = screen.getByRole('button', {
        name: 'Horário: 08:00, 20:00'
    });

    expect(screen.getByText('08:00, 20:00')).toBeOnTheScreen();

    await usuario.press(campo);

    expect(onAbrir).toHaveBeenCalledTimes(1);
});

test('mostra placeholder quando não existem horários', async () => {
    await render(
        <UsageTimeSelector
            horarios={[]}
            aberto={false}
            onAbrir={jest.fn()}
            onConfirmar={jest.fn()}
            onFechar={jest.fn()}
        />
    );

    expect(
        screen.getByRole('button', {
            name: 'Horário: Defina o horário'
        })
    ).toBeOnTheScreen();
});

test('edita e confirma um único horário', async () => {
    const usuario = userEvent.setup();
    const onConfirmar = jest.fn();

    await render(
        <UsageTimeSelector
            horarios={['08:00']}
            aberto
            onAbrir={jest.fn()}
            onConfirmar={onConfirmar}
            onFechar={jest.fn()}
        />
    );

    expect(
        screen.getByText('Defina o horário em que você usa seu anticoncepcional.')
    ).toBeOnTheScreen();
    expect(
        screen.queryByRole('button', {
            name: 'Adicionar horário'
        })
    ).not.toBeOnTheScreen();

    await usuario.press(
        screen.getByRole('button', {
            name: 'Alterar horário 08:00'
        })
    );

    await waitFor(() => {
        expect(screen.getByText('09:30')).toBeOnTheScreen();
    });

    await usuario.press(
        screen.getByRole('button', {
            name: 'Confirmar horário'
        })
    );

    expect(onConfirmar).toHaveBeenCalledTimes(1);
    expect(onConfirmar).toHaveBeenCalledWith(['09:30']);
});

test('começa com um horário vazio e permite preenchê-lo', async () => {
    const usuario = userEvent.setup();
    const onConfirmar = jest.fn();

    await render(
        <UsageTimeSelector
            horarios={[]}
            aberto
            onAbrir={jest.fn()}
            onConfirmar={onConfirmar}
            onFechar={jest.fn()}
        />
    );

    await usuario.press(
        screen.getByRole('button', {
            name: 'Alterar horário vazio'
        })
    );

    await waitFor(() => {
        expect(screen.getByText('08:00')).toBeOnTheScreen();
    });

    await usuario.press(
        screen.getByRole('button', {
            name: 'Confirmar horário'
        })
    );

    expect(onConfirmar).toHaveBeenCalledWith(['08:00']);
});

test('pede a escolha do horário ao editar um cadastro antigo', async () => {
    const usuario = userEvent.setup();
    const onConfirmar = jest.fn();
    await render(
        <UsageTimeSelector horarios={['08:00', '20:00']} aberto onConfirmar={onConfirmar} />
    );

    expect(screen.getByRole('button', { name: 'Confirmar horário' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Adicionar horário' })).toBeNull();
    await usuario.press(screen.getByRole('button', { name: 'Remover horário 08:00' }));
    await usuario.press(screen.getByRole('button', { name: 'Confirmar horário' }));
    expect(onConfirmar).toHaveBeenCalledWith(['20:00']);
});

test('restaura os horários recebidos sempre que o painel abre', async () => {
    const usuario = userEvent.setup();
    const onConfirmar = jest.fn();

    const resultado = await render(
        <UsageTimeSelector
            horarios={['08:00']}
            aberto={false}
            onAbrir={jest.fn()}
            onConfirmar={onConfirmar}
            onFechar={jest.fn()}
        />
    );

    await resultado.rerender(
        <UsageTimeSelector
            horarios={['20:00']}
            aberto
            onAbrir={jest.fn()}
            onConfirmar={onConfirmar}
            onFechar={jest.fn()}
        />
    );

    await waitFor(() => {
        expect(
            screen.getByRole('button', {
                name: 'Alterar horário 20:00'
            })
        ).toBeOnTheScreen();
    });

    await usuario.press(
        screen.getByRole('button', {
            name: 'Confirmar horário'
        })
    );

    expect(onConfirmar).toHaveBeenCalledWith(['20:00']);
});

test('fecha o painel pelo cabeçalho', async () => {
    const usuario = userEvent.setup();
    const onFechar = jest.fn();

    await render(
        <UsageTimeSelector
            horarios={['08:00']}
            aberto
            onAbrir={jest.fn()}
            onConfirmar={jest.fn()}
            onFechar={onFechar}
        />
    );

    await usuario.press(
        screen.getByRole('button', {
            name: 'Voltar'
        })
    );

    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('encaminha corretamente as propriedades para o campo de horário', async () => {
    await render(
        <UsageTimeSelector
            horarios={['08:00', '20:00']}
            aberto
            onAbrir={jest.fn()}
            onConfirmar={jest.fn()}
            onFechar={jest.fn()}
        />
    );

    const propriedades = mockTimeInput.mock.calls.map(([props]) => props);
    const horarioOito = propriedades.find((props) => props.valor === '08:00');
    const horarioVinte = propriedades.find((props) => props.valor === '20:00');

    expect(horarioOito).toEqual(
        expect.objectContaining({
            valor: '08:00',
            podeRemover: true,
            onChangeText: expect.any(Function),
            aoRemover: expect.any(Function)
        })
    );

    expect(horarioVinte).toEqual(
        expect.objectContaining({
            valor: '20:00',
            podeRemover: true,
            onChangeText: expect.any(Function),
            aoRemover: expect.any(Function)
        })
    );
});

test.each(['25:00', '12:60', '24:00'])(
    'mostra erro ao preencher %s e bloqueia sua confirmação',
    async (horario) => {
        const onConfirmar = jest.fn();
        await render(
            <UsageTimeSelector
                horarios={[]}
                aberto
                onConfirmar={onConfirmar}
                onFechar={jest.fn()}
            />
        );
        await act(async () => mockTimeInput.mock.calls.at(-1)[0].onChangeText(horario));
        expect(
            screen.getByText('Informe um horário válido entre 00:00 e 23:59.')
        ).toBeOnTheScreen();
        await userEvent.setup().press(screen.getByRole('button', { name: 'Confirmar horário' }));
        expect(onConfirmar).not.toHaveBeenCalled();
        await act(async () => mockTimeInput.mock.calls.at(-1)[0].onChangeText('23:59'));
        expect(screen.queryByText('Informe um horário válido entre 00:00 e 23:59.')).toBeNull();
        await userEvent.setup().press(screen.getByRole('button', { name: 'Confirmar horário' }));
        expect(onConfirmar).toHaveBeenCalledWith(['23:59']);
    }
);

test.each(['', '08:'])('não confirma um horário vazio ou incompleto: %s', async (horario) => {
    const onConfirmar = jest.fn();
    await render(
        <UsageTimeSelector
            horarios={[horario]}
            aberto
            onConfirmar={onConfirmar}
            onFechar={jest.fn()}
        />
    );
    expect(screen.queryByRole('alert')).toBeNull();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Confirmar horário' }));
    expect(screen.getByRole('alert')).toBeOnTheScreen();
    expect(onConfirmar).not.toHaveBeenCalled();
});
