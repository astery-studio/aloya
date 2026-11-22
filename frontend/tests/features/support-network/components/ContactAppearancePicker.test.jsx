//Testa a seleção controlada dos ícones e cores do contato.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    function criarIcone(nome) {
        return function IconeFalso(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: propriedades.testID ?? nome
            });
        };
    }

    return {
        ChecksIcon: criarIcone('ChecksIcon'),
        FlowerLotusIcon: criarIcone('FlowerLotusIcon'),
        FlowerTulipIcon: criarIcone('FlowerTulipIcon'),
        HandshakeIcon: criarIcone('HandshakeIcon'),
        HeartIcon: criarIcone('HeartIcon'),
        RainbowCloudIcon: criarIcone('RainbowCloudIcon'),
        ShieldCheckIcon: criarIcone('ShieldCheckIcon'),
        SmileyWinkIcon: criarIcone('SmileyWinkIcon'),
        SparkleIcon: criarIcone('SparkleIcon'),
        SunIcon: criarIcone('SunIcon'),
        UserIcon: criarIcone('UserIcon')
    };
});

import {
    ContactAppearancePicker,
    calcularTamanhosAparencia,
    dividirEmLinhas,
    obterCorMarcador
} from '../../../../src/features/support-network/components/ContactAppearancePicker/ContactAppearancePicker';

describe('ContactAppearancePicker', () => {
    test('organiza exatamente cinco ícones em cada linha', () => {
        const linhas = dividirEmLinhas(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);

        expect(linhas).toEqual([
            ['1', '2', '3', '4', '5'],
            ['6', '7', '8', '9', '10']
        ]);
    });

    test('mantém quadro de 34 e ícone de 18 em telas comuns', () => {
        expect(calcularTamanhosAparencia(390)).toEqual({
            tamanhoQuadroIcone: 34,
            tamanhoQuadroCor: 34,
            tamanhoIcone: 18
        });
    });

    test('reduz proporcionalmente somente em telas muito estreitas', () => {
        expect(calcularTamanhosAparencia(160)).toEqual({
            tamanhoQuadroIcone: 24,
            tamanhoQuadroCor: 22,
            tamanhoIcone: 13
        });
    });

    test('mostra todas as opções de ícone e cor', async () => {
        await render(<ContactAppearancePicker aoAlterar={jest.fn()} />);

        expect(screen.getByText('Ícone do Contato')).toBeOnTheScreen();
        expect(screen.getByText('Cor do Ícone')).toBeOnTheScreen();

        expect(screen.getAllByRole('radio')).toHaveLength(17);

        expect(screen.getByTestId('linha-icones-contato-1').children).toHaveLength(5);
        expect(screen.getByTestId('linha-icones-contato-2').children).toHaveLength(5);

        expect(screen.getByTestId('linha-cores-contato')).toHaveStyle({
            flexDirection: 'row'
        });

        expect(
            screen.getByRole('radio', {
                name: 'Pessoa'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('radio', {
                name: 'Roxo'
            })
        ).toBeOnTheScreen();

        expect(screen.getByTestId('opcao-icone-contato-pessoa')).toHaveStyle({
            width: 34,
            height: 34
        });

        expect(screen.getByTestId('icone-opcao-contato-pessoa')).toHaveProp('size', 18);

        const coresEsperadas = {
            branco: '#FFFFFF',
            coral: '#C85A44',
            verde: '#2C4C3B',
            laranja: '#D68C3A',
            azul: '#4A758E',
            roxo: '#7B5EA7',
            cinza: '#999999'
        };

        for (const [corId, backgroundColor] of Object.entries(coresEsperadas)) {
            expect(screen.getByTestId(`opcao-cor-contato-${corId}`)).toHaveStyle({
                width: 34,
                height: 34,
                minWidth: 34,
                minHeight: 34,
                maxWidth: 34,
                maxHeight: 34,
                borderWidth: 0.7,
                borderRadius: 9,
                borderColor: '#E6E2D8',
                backgroundColor
            });
        }
    });

    test('indica o ícone e a cor selecionados', async () => {
        await render(
            <ContactAppearancePicker iconeId="lotus" corId="roxo" aoAlterar={jest.fn()} />
        );

        expect(
            screen.getByRole('radio', {
                name: 'Flor de lótus'
            })
        ).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        });

        expect(
            screen.getByRole('radio', {
                name: 'Roxo'
            })
        ).toHaveProp('accessibilityState', {
            checked: true,
            disabled: false
        });

        expect(screen.getByTestId('marcador-cor-contato-roxo')).toHaveProp('color', '#FFFFFF');
        expect(screen.getByTestId('marcador-cor-contato-roxo')).toHaveProp('weight', 'bold');
    });

    test('altera somente o ícone e preserva a cor', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactAppearancePicker iconeId="pessoa" corId="verde" aoAlterar={aoAlterar} />
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Coração'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith({
            iconeId: 'coracao',
            corId: 'verde'
        });
    });

    test('altera somente a cor e preserva o ícone', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactAppearancePicker iconeId="sorriso" corId="cinza" aoAlterar={aoAlterar} />
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Azul'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith({
            iconeId: 'sorriso',
            corId: 'azul'
        });
    });

    test('não repete a alteração ao pressionar a opção atual', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactAppearancePicker iconeId="sol" corId="laranja" aoAlterar={aoAlterar} />
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Sol'
            })
        );

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Laranja'
            })
        );

        expect(aoAlterar).not.toHaveBeenCalled();
    });

    test('bloqueia todas as opções quando está desabilitado', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactAppearancePicker
                iconeId="pessoa"
                corId="branco"
                aoAlterar={aoAlterar}
                desabilitado
            />
        );

        const opcoes = screen.getAllByRole('radio');

        for (const opcao of opcoes) {
            expect(opcao).toBeDisabled();
        }

        await fireEvent.press(
            screen.getByRole('radio', {
                name: 'Coração'
            })
        );

        expect(aoAlterar).not.toHaveBeenCalled();
    });

    test('fica desabilitado sem função de alteração', async () => {
        await render(<ContactAppearancePicker iconeId="pessoa" corId="branco" />);

        expect(
            screen.getByRole('radio', {
                name: 'Pessoa'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('radio', {
                name: 'Branco'
            })
        ).toBeDisabled();
    });

    test('não seleciona identificadores desconhecidos', async () => {
        await render(
            <ContactAppearancePicker
                iconeId="desconhecido"
                corId="inexistente"
                aoAlterar={jest.fn()}
            />
        );

        for (const opcao of screen.getAllByRole('radio')) {
            expect(opcao.props.accessibilityState.checked).toBe(false);
        }

        expect(screen.queryByTestId(/marcador-cor-contato-/)).toBeNull();
    });

    test.each([
        ['branco', '#222222'],
        ['laranja', '#222222'],
        ['cinza', '#222222'],
        ['coral', '#FFFFFF'],
        ['verde', '#FFFFFF'],
        ['azul', '#FFFFFF'],
        ['roxo', '#FFFFFF']
    ])('usa marcador acessível sobre a cor %s', (corId, corEsperada) => {
        expect(obterCorMarcador(corId)).toBe(corEsperada);
    });

    test('mantém contraste do ícone selecionado no modo escuro', async () => {
        await render(
            <ContactAppearancePicker iconeId="escudo" corId="verde" aoAlterar={jest.fn()} />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByTestId('opcao-icone-contato-escudo')).toHaveStyle({
            backgroundColor: '#9FD6B6',
            borderColor: '#9FD6B6'
        });

        expect(screen.getByTestId('icone-opcao-contato-escudo')).toHaveProp('color', '#152018');
    });
});
