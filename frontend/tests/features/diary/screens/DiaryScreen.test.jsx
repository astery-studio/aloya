import { fireEvent, screen } from '@testing-library/react-native';

import { DiaryScreen } from '../../../../src/features/diary/screens/DiaryScreen';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

describe('tela inicial do Diário', () => {
    test('oferece a criação de um registro', async () => {
        const aoCriar = jest.fn();
        await render(<DiaryScreen aoCriar={aoCriar} onSelecionarAba={jest.fn()} />);

        expect(screen.getByRole('header', { name: 'Como você está hoje?' })).toBeOnTheScreen();
        expect(screen.queryByRole('status')).not.toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Criar registro' }));
        expect(aoCriar).toHaveBeenCalledTimes(1);
    });

    test('confirma o último registro criado', async () => {
        await render(
            <DiaryScreen
                aoCriar={jest.fn()}
                ultimoRegistro={{ id: 1, data: '2026-11-09' }}
                onSelecionarAba={jest.fn()}
            />
        );

        expect(screen.getByRole('status')).toHaveTextContent(
            'Registro de 09/11/2026 salvo com sucesso.'
        );
    });
});
