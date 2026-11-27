import { act, fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { setStringAsync } from 'expo-clipboard';

import { LegalSupport } from '../../../../src/features/legal/components/LegalSupport/LegalSupport';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));

afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

test('abre o cliente de e-mail com o endereço de suporte', async () => {
    const abrirUrl = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<LegalSupport />);

    await fireEvent.press(screen.getByRole('link', { name: 'aloya.support@gmail.com' }));

    expect(abrirUrl).toHaveBeenCalledWith('mailto:aloya.support@gmail.com');
});

test('mantém a cópia disponível quando o cliente de e-mail falha', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('Cliente indisponível'));
    await render(<LegalSupport />);

    await fireEvent.press(screen.getByRole('link', { name: 'aloya.support@gmail.com' }));

    expect(screen.getByText(/pode copiar o endereço/i)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Copiar endereço de e-mail' })).toBeOnTheScreen();
});

test('confirma a cópia e remove o retorno temporário', async () => {
    jest.useFakeTimers();
    setStringAsync.mockResolvedValue(true);
    await render(<LegalSupport />);

    await fireEvent.press(screen.getByRole('button', { name: 'Copiar endereço de e-mail' }));
    expect(screen.getByText('Endereço de e-mail copiado.')).toBeOnTheScreen();
    expect(setStringAsync).toHaveBeenCalledWith('aloya.support@gmail.com');

    await act(async () => jest.advanceTimersByTime(1500));
    expect(screen.queryByText('Endereço de e-mail copiado.')).toBeNull();
});
