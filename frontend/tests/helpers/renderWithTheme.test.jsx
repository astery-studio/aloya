import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';

import { useTheme } from '../../src/shared/hooks/useTheme';
import { renderWithTheme } from './renderWithTheme';

function ThemeProbe() {
    const tema = useTheme();

    return <Text testID="tema-atual">{`${tema.modo}:${tema.cores.interface.fundo}`}</Text>;
}

describe('renderWithTheme', () => {
    test('renderiza usando o tema claro por padrão', async () => {
        await renderWithTheme(<ThemeProbe />);

        expect(screen.getByTestId('tema-atual')).toHaveTextContent('claro:#F7F5F0');
    });

    test('permite selecionar o tema escuro', async () => {
        await renderWithTheme(<ThemeProbe />, {
            preferencia: 'escuro'
        });

        expect(screen.getByTestId('tema-atual')).toHaveTextContent('escuro:#181C1A');
    });

    test('resolve a preferência automática pelo sistema', async () => {
        await renderWithTheme(<ThemeProbe />, {
            preferencia: 'automatico',
            esquemaDoSistema: 'dark'
        });

        expect(screen.getByTestId('tema-atual')).toHaveTextContent('escuro:#181C1A');
    });

    test('preserva o provedor durante uma rerenderização', async () => {
        const resultado = await renderWithTheme(<ThemeProbe />, {
            preferencia: 'escuro'
        });

        await resultado.rerender(<ThemeProbe />);

        expect(screen.getByTestId('tema-atual')).toHaveTextContent('escuro:#181C1A');
    });
});
