import { fireEvent, screen } from '@testing-library/react-native';
import WelcomeScreen from '../../src/features/auth/screens/WelcomeScreen';
import OnboardingComplete from '../../src/features/onboarding/components/OnboardingComplete/OnboardingComplete';
import { renderWithTheme } from '../helpers/renderWithTheme';

test.each([
    ['claro', require('../../assets/aloya-logo-completa.png')],
    ['escuro', require('../../assets/aloya-logo-completa-escura.png')]
])('mostra a logo nas boas-vindas e na conclusão no tema %s', async (preferencia, logo) => {
    const boasVindas = await renderWithTheme(<WelcomeScreen />, { preferencia });
    expect(screen.getByLabelText('Aloya')).toHaveProp('source', logo);
    await boasVindas.unmount();

    await renderWithTheme(<OnboardingComplete />, { preferencia });
    const imagem = screen.getByLabelText('Aloya');
    expect(imagem).toHaveProp('source', logo);
    expect(imagem).toHaveProp('resizeMode', 'contain');
    expect(imagem).toHaveStyle({ width: '100%', height: '100%' });
});

test('mostra a conclusão sem rolagem e permite iniciar o app', async () => {
    const aoIniciar = jest.fn();
    await renderWithTheme(<OnboardingComplete aoIniciar={aoIniciar} />);

    expect(screen.queryByTestId('form-layout-scroll')).toBeNull();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Iniciar' }));
    expect(aoIniciar).toHaveBeenCalledTimes(1);
});
