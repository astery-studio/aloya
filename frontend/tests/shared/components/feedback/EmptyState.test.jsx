import { screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { EmptyState } from '../../../../src/shared/components/feedback/EmptyState/EmptyState';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test.each(['vazio', 'erro'])(
    'aplica a paleta de conteúdo à variante %s no tema escuro',
    async (variante) => {
        await renderWithTheme(
            <EmptyState
                usarPaletaNoturnaConteudo
                variante={variante}
                titulo="Título do estado"
                mensagem="Mensagem do estado"
            />,
            { preferencia: 'escuro' }
        );

        expect(screen.getByRole('header', { name: 'Título do estado' })).toHaveStyle({
            color: '#E3E3E3'
        });
        expect(screen.getByText('Mensagem do estado')).toHaveStyle({ color: '#999999' });
    }
);

test.each(['vazio', 'erro', 'apresentacao'])('apresenta a variante %s', async (variante) => {
    await renderWithTheme(
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
