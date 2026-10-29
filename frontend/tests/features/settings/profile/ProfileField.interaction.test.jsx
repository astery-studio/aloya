jest.mock('../../../../src/shared/components/icons/AppIcons', () => ({
    NotePencilIcon: jest.fn(() => null)
}));

import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProfileField } from '../../../../src/features/settings/profile/ProfileField';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';

async function renderizarCampo(propriedades = {}) {
    return render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <ProfileField label="Nome" valor="Julia" onPress={jest.fn()} {...propriedades} />
        </ThemeProvider>
    );
}

describe('ProfileField - interação visual', () => {
    test('aplica estilo pressionado durante o toque', async () => {
        await renderizarCampo();

        const campo = screen.getByRole('button', {
            name: 'Editar Nome'
        });

        expect(campo).not.toHaveStyle({
            opacity: 0.72
        });

        await fireEvent(campo, 'pressIn');

        expect(campo).toHaveStyle({
            opacity: 0.72
        });

        await fireEvent(campo, 'pressOut');

        expect(campo).not.toHaveStyle({
            opacity: 0.72
        });
    });

    test('não aplica pressionado quando desabilitado', async () => {
        await renderizarCampo({
            desabilitado: true
        });

        const campo = screen.getByRole('button', {
            name: 'Editar Nome'
        });

        expect(campo).toBeDisabled();

        expect(campo).toHaveStyle({
            opacity: 0.5
        });

        await fireEvent(campo, 'pressIn');

        expect(campo).toHaveStyle({
            opacity: 0.5
        });

        expect(campo).not.toHaveStyle({
            opacity: 0.72
        });
    });
});
