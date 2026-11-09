//Testa as combinações visuais, tamanhos e acessibilidade do avatar de contato.
import { screen } from '@testing-library/react-native';

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
    ContactAvatar,
    normalizarTamanho
} from '../../../../src/features/support-network/components/ContactAvatar/ContactAvatar';

describe('ContactAvatar', () => {
    test.each([
        ['pessoa', 'contact-avatar-icon-pessoa'],
        ['coracao', 'contact-avatar-icon-coracao'],
        ['sol', 'contact-avatar-icon-sol'],
        ['escudo', 'contact-avatar-icon-escudo'],
        ['tulipa', 'contact-avatar-icon-tulipa'],
        ['aperto_maos', 'contact-avatar-icon-aperto_maos'],
        ['lotus', 'contact-avatar-icon-lotus'],
        ['brilho', 'contact-avatar-icon-brilho'],
        ['arco_iris', 'contact-avatar-icon-arco_iris'],
        ['sorriso', 'contact-avatar-icon-sorriso']
    ])('renderiza o ícone %s', async (iconeId, testID) => {
        await render(
            <ContactAvatar
                iconeId={iconeId}
                corId="verde"
                rotuloAcessibilidade={`Avatar ${iconeId}`}
            />
        );

        expect(screen.getByTestId(testID)).toBeOnTheScreen();
    });

    test('aplica a cor escolhida ao ícone e ao fundo suave', async () => {
        await render(
            <ContactAvatar
                iconeId="coracao"
                corId="coral"
                rotuloAcessibilidade="Avatar do contato"
            />
        );

        expect(screen.getByTestId('contact-avatar')).toHaveStyle({
            backgroundColor: 'rgba(200, 90, 68, 0.14)',
            borderColor: 'rgba(200, 90, 68, 0.72)'
        });

        expect(screen.getByTestId('contact-avatar-icon-coracao')).toHaveProp('color', '#C85A44');
    });

    test('renderiza a variante pequena', async () => {
        await render(
            <ContactAvatar
                iconeId="lotus"
                corId="verde"
                tamanho="pequeno"
                rotuloAcessibilidade="Avatar pequeno"
            />
        );

        expect(screen.getByTestId('contact-avatar')).toHaveStyle({
            width: 36,
            height: 36,
            borderRadius: 10
        });

        expect(screen.getByTestId('contact-avatar-icon-lotus')).toHaveProp('size', 18);
    });

    test('usa a variante média por padrão', async () => {
        await render(
            <ContactAvatar iconeId="sol" corId="laranja" rotuloAcessibilidade="Avatar médio" />
        );

        expect(screen.getByTestId('contact-avatar')).toHaveStyle({
            width: 48,
            height: 48,
            borderRadius: 14
        });

        expect(screen.getByTestId('contact-avatar-icon-sol')).toHaveProp('size', 24);
    });

    test('aplica fallback seguro para identificadores inválidos', async () => {
        await render(
            <ContactAvatar
                iconeId="icone-inexistente"
                corId="cor-inexistente"
                tamanho="enorme"
                rotuloAcessibilidade="Avatar padrão"
            />
        );

        expect(screen.getByTestId('contact-avatar-icon-pessoa')).toBeOnTheScreen();

        expect(screen.getByTestId('contact-avatar')).toHaveStyle({
            width: 48,
            height: 48,
            backgroundColor: '#FFFFFF',
            borderColor: '#E6E2D8'
        });

        expect(screen.getByTestId('contact-avatar-icon-pessoa')).toHaveProp('color', '#A8A49C');
    });

    test('expõe a descrição quando recebe rótulo de acessibilidade', async () => {
        await render(
            <ContactAvatar iconeId="sorriso" corId="roxo" rotuloAcessibilidade="Avatar de Maria" />
        );

        expect(
            screen.getByRole('image', {
                name: 'Avatar de Maria'
            })
        ).toBeOnTheScreen();
    });

    test('permanece decorativo quando não recebe rótulo', async () => {
        await render(<ContactAvatar iconeId="escudo" corId="azul" />);

        expect(screen.queryByRole('image')).toBeNull();

        expect(
            screen.getByTestId('contact-avatar', {
                includeHiddenElements: true
            })
        ).toHaveProp('importantForAccessibility', 'no-hide-descendants');
    });

    test('preserva a identidade visual no modo escuro', async () => {
        await render(
            <ContactAvatar iconeId="arco_iris" corId="azul" rotuloAcessibilidade="Avatar azul" />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByTestId('contact-avatar')).toHaveStyle({
            backgroundColor: 'rgba(74, 117, 142, 0.14)',
            borderColor: 'rgba(74, 117, 142, 0.72)'
        });

        expect(screen.getByTestId('contact-avatar-icon-arco_iris')).toHaveProp('color', '#4A758E');
    });

    test.each([
        ['pequeno', 'pequeno'],
        ['medio', 'medio'],
        ['inválido', 'medio'],
        [null, 'medio']
    ])('normaliza o tamanho %p para %p', (recebido, esperado) => {
        expect(normalizarTamanho(recebido)).toBe(esperado);
    });
});
