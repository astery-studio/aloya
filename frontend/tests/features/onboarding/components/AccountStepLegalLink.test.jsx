import { fireEvent, screen } from '@testing-library/react-native';

import AccountStep from '../../../../src/features/onboarding/components/AccountStep/AccountStep';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('consulta os Termos sem marcar o aceite nem descartar os campos', async () => {
    const aoAlterar = jest.fn();
    const aoConsultar = jest.fn();
    const dados = {
        nome: 'Pessoa de teste',
        email: '',
        senha: '',
        confirmacao: '',
        aceitouTermos: false
    };
    await render(
        <AccountStep dados={dados} aoAlterar={aoAlterar} aoConsultarDocumentos={aoConsultar} />
    );

    await fireEvent.press(screen.getByRole('link', { name: 'Termos e Política de Privacidade' }));
    expect(aoConsultar).toHaveBeenCalledWith('terms');
    expect(aoAlterar).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue(dados.nome)).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { checked: false })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('checkbox'));
    expect(aoAlterar).toHaveBeenCalledWith({ aceitouTermos: true });
});
