import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EmptyState } from '../../../../src/shared/components/feedback/EmptyState/EmptyState';

test.each(['vazio', 'erro', 'apresentacao'])('apresenta a variante %s', async (variante) => {
    await render(
        <EmptyState
            variante={variante}
            titulo="Título do estado"
            mensagem="Mensagem do estado"
            acao={<Text>Ação do estado</Text>}
        />
    );

    expect(screen.getByRole('header', { name: 'Título do estado' })).toBeOnTheScreen();
    expect(screen.getByText('Mensagem do estado')).toBeOnTheScreen();
    expect(screen.getByText('Ação do estado')).toBeOnTheScreen();
});
