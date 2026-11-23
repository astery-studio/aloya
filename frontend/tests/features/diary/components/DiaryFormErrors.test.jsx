import { screen } from '@testing-library/react-native';

import { DiaryFormErrors } from '../../../../src/features/diary/components/DiaryEntryForm/DiaryFormErrors';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const estilos = { erro: {} };

test('omite mensagens que não existem', async () => {
    const resultado = await render(<DiaryFormErrors erros={{}} estilos={estilos} />);
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    expect(resultado.toJSON()).not.toBeNull();
});

test('apresenta somente os erros de validação do formulário', async () => {
    await render(
        <DiaryFormErrors
            erros={{ data: 'Data', conteudo: 'Conteúdo', geral: 'Geral' }}
            estilos={estilos}
        />
    );
    expect(screen.getByText('Data')).toBeOnTheScreen();
    expect(screen.getByText('Conteúdo')).toBeOnTheScreen();
    expect(screen.queryByText('Geral')).not.toBeOnTheScreen();
});
