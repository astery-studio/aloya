import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { DiaryTimeline } from '../../../../src/features/diary/components/DiaryTimeline/DiaryTimeline';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const registros = [
    {
        id: 2,
        data: '2026-11-04',
        fase: 'menstrual',
        principais: [
            {
                categoriaId: 'a',
                categoria: 'A',
                valor: 'Cólica',
                macrocategoriaId: 'corpo_sintomas_fisicos'
            }
        ],
        maisQuantidade: 0,
        trechoAnotacao: null
    },
    {
        id: 1,
        data: '2026-10-28',
        fase: 'lutea',
        principais: [
            {
                categoriaId: 'b',
                categoria: 'B',
                valor: 'Pele',
                macrocategoriaId: 'corpo_sintomas_fisicos'
            }
        ],
        maisQuantidade: 0,
        trechoAnotacao: null
    }
];

describe('DiaryTimeline', () => {
    test('virtualiza registros e solicita a próxima página quando permitido', async () => {
        const aoCarregarMais = jest.fn();
        await render(
            <DiaryTimeline
                registros={registros}
                aoAbrir={jest.fn()}
                temMais
                aoCarregarMais={aoCarregarMais}
            />
        );

        expect(screen.getByTestId('diary-timeline')).toBeOnTheScreen();
        expect(screen.getAllByTestId('diary-entry-card')).toHaveLength(2);
        expect(
            screen.getByTestId('diary-phase-icon-menstrual', { includeHiddenElements: true })
        ).toBeOnTheScreen();
        await fireEvent(screen.getByTestId('diary-timeline'), 'endReached');
        expect(aoCarregarMais).not.toHaveBeenCalled();
        await fireEvent(screen.getByTestId('diary-timeline'), 'scrollBeginDrag');
        await fireEvent(screen.getByTestId('diary-timeline'), 'endReached');
        expect(aoCarregarMais).toHaveBeenCalledTimes(1);
        await fireEvent(screen.getByTestId('diary-timeline'), 'endReached');
        expect(aoCarregarMais).toHaveBeenCalledTimes(1);
    });

    test('mostra loading e erro de paginação sem apagar a lista', async () => {
        const tentar = jest.fn();
        const resultado = await render(
            <DiaryTimeline
                registros={registros}
                carregandoMais
                temMais
                aoCarregarMais={jest.fn()}
            />
        );
        expect(screen.getByTestId('diary-timeline-loading-more')).toHaveStyle({
            minHeight: 40,
            flexDirection: 'row',
            gap: 6,
            paddingVertical: 10
        });
        expect(screen.getByText('Carregando mais registros...')).toHaveStyle({
            fontSize: 11,
            lineHeight: 16
        });
        expect(screen.getAllByTestId('diary-entry-card')).toHaveLength(2);

        await resultado.rerender(
            <DiaryTimeline
                registros={registros}
                erroCarregarMais
                temMais
                aoTentarCarregarMais={tentar}
            />
        );
        await fireEvent.press(
            screen.getByRole('button', { name: 'Tentar carregar mais registros novamente' })
        );
        expect(tentar).toHaveBeenCalledTimes(1);
    });

    test('aceita lista vazia, dados inválidos e componentes auxiliares', async () => {
        const resultado = await render(<DiaryTimeline />);
        expect(screen.getByTestId('diary-timeline')).toBeOnTheScreen();
        await resultado.rerender(<DiaryTimeline registros="inválidos" />);
        expect(screen.getByTestId('diary-timeline')).toBeOnTheScreen();
        expect(screen.queryByTestId('diary-entry-card')).not.toBeOnTheScreen();

        await resultado.rerender(
            <DiaryTimeline
                registros={[
                    null,
                    1,
                    {
                        id: 3,
                        data: '2026-11-05',
                        fase: 'desconhecida',
                        principais: [],
                        maisQuantidade: 0
                    },
                    registros[0]
                ]}
                acaoEmAndamentoId={2}
                erroCarregarMais
                ListHeaderComponent={<Text>Cabeçalho adicional</Text>}
                ListFooterComponent={<Text>Rodapé adicional</Text>}
            />
        );
        expect(screen.getByText('Cabeçalho adicional')).toBeOnTheScreen();
        expect(screen.getByText('Rodapé adicional')).toBeOnTheScreen();
        expect(screen.getByLabelText('Ver detalhes do registro de 04/11/2026')).toBeDisabled();
    });

    test('não pagina sem callback ou durante erro e loading', async () => {
        const carregar = jest.fn();
        const resultado = await render(<DiaryTimeline registros={registros} temMais />);
        await fireEvent(screen.getByTestId('diary-timeline'), 'endReached');
        expect(carregar).not.toHaveBeenCalled();

        await resultado.rerender(
            <DiaryTimeline
                registros={registros}
                temMais
                carregandoMais
                erroCarregarMais
                aoCarregarMais={carregar}
            />
        );
        await fireEvent(screen.getByTestId('diary-timeline'), 'endReached');
        expect(carregar).not.toHaveBeenCalled();
    });
});
