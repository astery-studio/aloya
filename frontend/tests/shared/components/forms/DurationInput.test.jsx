import { fireEvent, screen } from '@testing-library/react-native';

import DurationInput, {
    decomporDuracao
} from '../../../../src/shared/components/forms/DurationInput/DurationInput';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('DurationInput', () => {
    test('decompõe somente durações positivas válidas', () => {
        expect(decomporDuracao(760)).toEqual({ horas: '12', minutos: '40' });
        expect(decomporDuracao(0)).toEqual({ horas: '', minutos: '' });
        expect(decomporDuracao(1.5)).toEqual({ horas: '', minutos: '' });
    });

    test('edita horas e preserva minutos', async () => {
        const aoAlterar = jest.fn();
        await render(<DurationInput valorMinutos={100} aoAlterar={aoAlterar} />);
        await fireEvent.changeText(screen.getByLabelText('Horas de sono'), '2h');
        expect(aoAlterar).toHaveBeenCalledWith(160);
    });

    test('limita minutos e permite apagar a duração', async () => {
        const aoAlterar = jest.fn();
        const resultado = await render(
            <DurationInput valorMinutos={60} aoAlterar={aoAlterar} />
        );
        await fireEvent.changeText(screen.getByLabelText('Minutos de sono'), '99');
        expect(aoAlterar).toHaveBeenLastCalledWith(119);
        await resultado.rerender(<DurationInput valorMinutos={null} aoAlterar={aoAlterar} />);
        await fireEvent.changeText(screen.getByLabelText('Horas de sono'), '');
        expect(aoAlterar).toHaveBeenLastCalledWith(null);
    });

    test('expõe erro e bloqueia os campos', async () => {
        await render(
            <DurationInput
                valorMinutos={null}
                desabilitado
                erro="Duração inválida"
            />
        );
        expect(screen.getByRole('alert')).toHaveTextContent('Duração inválida');
        expect(screen.getByLabelText('Horas de sono')).toHaveProp('editable', false);
        expect(screen.getByLabelText('Minutos de sono')).toHaveProp('editable', false);
    });

    test('aceita ausência de callback e de erro', async () => {
        await render(<DurationInput valorMinutos={null} />);
        await fireEvent.changeText(screen.getByLabelText('Minutos de sono'), '5');
        expect(screen.queryByRole('alert')).toBeNull();
    });
});
