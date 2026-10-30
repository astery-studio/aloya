// Confere apresentação, interação, tema e acessibilidade.
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockNotePencilIcon = jest.fn(() => null);

jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    NotePencilIcon: (propriedades) => mockNotePencilIcon(propriedades)
}));

import {
    ProfileField,
    obterValorVisivel,
    valorFoiInformado
} from '../../../../src/features/settings/profile/ProfileField';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

function renderizarCampo(propriedades = {}, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            <ProfileField label="Nome" valor="Julia" onPress={jest.fn()} {...propriedades} />
        </ThemeProvider>
    );
}

describe('ProfileField', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('mostra nome e valor', async () => {
        await renderizarCampo();

        expect(screen.getByText('Nome')).toBeOnTheScreen();

        expect(screen.getByText('Julia')).toBeOnTheScreen();
    });

    test('executa a edição', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            label: 'E-mail',
            valor: 'julia@email.com',
            onPress
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar E-mail'
            })
        );

        expect(onPress).toHaveBeenCalledTimes(1);
    });

    test.each([null, undefined, '', '   ', {}, []])(
        'mostra valor alternativo para %p',
        async (valor) => {
            await renderizarCampo({
                valor
            });

            expect(screen.getByText('Não informado')).toBeOnTheScreen();

            expect(
                screen.getByRole('button', {
                    name: 'Editar Nome'
                }).props.accessibilityValue
            ).toEqual({
                text: 'Não informado'
            });
        }
    );

    test('aceita número zero', async () => {
        await renderizarCampo({
            label: 'Quantidade',
            valor: 0
        });

        expect(screen.getByText('0')).toBeOnTheScreen();

        expect(valorFoiInformado(0)).toBe(true);

        expect(obterValorVisivel(0)).toBe('0');
    });

    test('desabilita sem ação', async () => {
        await renderizarCampo({
            onPress: undefined
        });

        expect(
            screen.getByRole('button', {
                name: 'Editar Nome'
            })
        ).toBeDisabled();
    });

    test('respeita desabilitação explícita', async () => {
        const onPress = jest.fn();

        await renderizarCampo({
            onPress,
            desabilitado: true
        });

        const campo = screen.getByRole('button', {
            name: 'Editar Nome'
        });

        expect(campo).toBeDisabled();

        await fireEvent.press(campo);

        expect(onPress).not.toHaveBeenCalled();
    });

    test('limita valores longos', async () => {
        const valor = 'email-muito-longo@example.com';

        await renderizarCampo({
            label: 'E-mail',
            valor
        });

        expect(screen.getByText(valor)).toHaveProp('numberOfLines', 1);

        expect(screen.getByText(valor)).toHaveProp('ellipsizeMode', 'tail');
    });

    test('usa cores claras', async () => {
        await renderizarCampo();

        expect(
            screen.getByRole('button', {
                name: 'Editar Nome'
            })
        ).toHaveStyle({
            backgroundColor: '#FFFFFF',
            borderColor: '#E6E2D8'
        });

        expect(screen.getByText('Nome')).toHaveStyle({
            color: '#5C5C59'
        });

        expect(screen.getByText('Julia')).toHaveStyle({
            color: '#222222'
        });
    });

    test('usa cores escuras', async () => {
        await renderizarCampo({}, 'escuro');

        expect(
            screen.getByRole('button', {
                name: 'Editar Nome'
            })
        ).toHaveStyle({
            backgroundColor: '#232926',
            borderColor: '#4A514D'
        });

        expect(screen.getByText('Nome')).toHaveStyle({
            color: '#C4C8C5'
        });

        expect(screen.getByText('Julia')).toHaveStyle({
            color: '#F4F1EA'
        });
    });

    test('usa texto secundário no valor ausente', async () => {
        await renderizarCampo(
            {
                valor: null
            },
            'escuro'
        );

        expect(screen.getByText('Não informado')).toHaveStyle({
            color: '#C4C8C5'
        });
    });

    test('usa ícone de edição temático', async () => {
        await renderizarCampo({}, 'escuro');

        expect(mockNotePencilIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                size: 20,
                color: '#A3A8A5',
                weight: 'regular'
            })
        );
    });
});
