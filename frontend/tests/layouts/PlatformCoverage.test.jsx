import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import AuthLayout from '../../layouts/AuthLayout';
import { BottomSheetLayout } from '../../layouts/BottomSheet/BottomSheetLayout';

test('AuthLayout usa ajuste de teclado do iOS', async () => {
    const sistemaOriginal = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    try {
        await render(<AuthLayout titulo="Entrar" />);
        expect(screen.getByText('Entrar')).toBeTruthy();
    } finally {
        Object.defineProperty(Platform, 'OS', {
            configurable: true, value: sistemaOriginal
        });
    }
});

test('BottomSheetLayout fecha com valores padrão e aceita ausência de callback', async () => {
    await render(<BottomSheetLayout titulo="Opções"><Text>Conteúdo</Text></BottomSheetLayout>);
    expect(() => fireEvent.press(
        screen.getByRole('button', { name: 'Fechar painel' })
    )).not.toThrow();
});
