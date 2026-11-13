import { fireEvent, screen } from '@testing-library/react-native';

import {
    DiaryEntryCard,
    limitarTrechoAnotacao,
    normalizarRegistro,
    organizarChipsEmLinhas
} from '../../../../src/features/diary/components/DiaryEntryCard/DiaryEntryCard';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const registro = {
    id: 8,
    data: '2026-11-04',
    fase: 'menstrual',
    principais: [
        {
            categoriaId: 'banheiro',
            categoria: 'Intestino',
            valor: 'Intestino',
            macrocategoriaId: 'corpo_sintomas_fisicos'
        },
        {
            categoriaId: 'sangramento_escape',
            categoria: 'Sangramento',
            valor: 'Sangramento de Escape',
            macrocategoriaId: 'ciclo_sangramento'
        },
        {
            categoriaId: 'pele',
            categoria: 'Pele',
            valor: 'Pele',
            macrocategoriaId: 'corpo_sintomas_fisicos'
        }
    ],
    maisQuantidade: 2,
    trechoAnotacao: 'Hoje me senti melhor.',
    versao: 3
};

describe('DiaryEntryCard', () => {
    test('equilibra tags longas em duas linhas sem quebras isoladas', () => {
        const itens = [
            { texto: 'Sintomas emocionais' },
            { texto: 'Sintomas pré-menstruais' },
            { texto: 'Fluxo menstrual' },
            { texto: '+ 2' }
        ];
        expect(organizarChipsEmLinhas(itens)).toEqual([
            [itens[0], itens[2]],
            [itens[1], itens[3]]
        ]);

        const curtos = [
            { texto: 'Intestino' },
            { texto: 'Sangramento de Escape' },
            { texto: 'Tempo de Sono' },
            { texto: '+ 2' }
        ];
        expect(organizarChipsEmLinhas(curtos)).toEqual([curtos.slice(0, 2), curtos.slice(2)]);

        const tres = [{ texto: 'Sintomas físicos' }, { texto: 'Pele' }, { texto: 'Peso' }];
        expect(organizarChipsEmLinhas(tres)).toEqual([tres]);

        const umLongo = [{ texto: 'X'.repeat(100) }];
        expect(organizarChipsEmLinhas(umLongo)).toEqual([umLongo]);
        const doisLongos = [{ texto: 'X'.repeat(40) }, { texto: 'Y'.repeat(40) }];
        expect(organizarChipsEmLinhas(doisLongos)).toEqual([[doisLongos[0]], [doisLongos[1]]]);
        const tresLongos = [
            { texto: 'X'.repeat(30) },
            { texto: 'Y'.repeat(30) },
            { texto: 'Z'.repeat(30) }
        ];
        expect(organizarChipsEmLinhas(tresLongos)).toHaveLength(2);
    });

    test('limita a prévia da anotação a 100 caracteres com reticência', () => {
        const trecho = limitarTrechoAnotacao('🌷'.repeat(101));
        expect([...trecho]).toHaveLength(100);
        expect(trecho.endsWith('…')).toBe(true);
        expect(limitarTrechoAnotacao('Anotação curta')).toBe('Anotação curta');
    });

    test('mostra somente o resumo seguro e executa as ações', async () => {
        const aoAbrir = jest.fn();
        const aoEditar = jest.fn();
        const aoExcluir = jest.fn();
        await render(
            <DiaryEntryCard
                registro={registro}
                aoAbrir={aoAbrir}
                aoEditar={aoEditar}
                aoExcluir={aoExcluir}
            />
        );

        expect(screen.getByText('04/11/2026')).toBeOnTheScreen();
        expect(screen.getByTestId('diary-entry-card')).toHaveStyle({
            width: '100%',
            flexDirection: 'column',
            alignItems: 'flex-start',
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 0.70489,
            borderRadius: 16
        });
        expect(screen.getByText('04/11/2026')).toHaveStyle({
            fontSize: 12,
            lineHeight: 24
        });
        expect(screen.getByTestId('diary-entry-icon')).toHaveStyle({
            width: 26,
            height: 26,
            borderWidth: 0.705,
            borderRadius: 10,
            borderColor: '#C85A44',
            backgroundColor: 'rgba(200, 90, 68, 0.10)'
        });
        expect(screen.getByLabelText('Fase Menstrual')).toHaveStyle({
            alignSelf: 'stretch',
            height: 26,
            paddingHorizontal: 14,
            paddingVertical: 0,
            gap: 6,
            borderRadius: 100,
            backgroundColor: 'rgba(200, 90, 68, 0.20)'
        });
        expect(screen.getByText('Fase Menstrual')).toHaveStyle({
            fontSize: 10,
            lineHeight: 19.5
        });
        expect(screen.getByText('Intestino')).toBeOnTheScreen();
        expect(screen.getByText('Intestino')).toHaveStyle({
            fontSize: 8.56,
            lineHeight: 16
        });
        expect(screen.getByText('Sangramento de Escape')).toBeOnTheScreen();
        expect(screen.getByText('+ 2')).toBeOnTheScreen();
        expect(screen.getAllByTestId('diary-entry-chip-row')).toHaveLength(2);
        expect(screen.getByText('Hoje me senti melhor.')).toBeOnTheScreen();

        await fireEvent.press(screen.getByLabelText('Ver detalhes do registro de 04/11/2026'));
        await fireEvent.press(
            screen.getByRole('button', { name: 'Editar registro de 04/11/2026' })
        );
        await fireEvent.press(
            screen.getByRole('button', { name: 'Excluir registro de 04/11/2026' })
        );
        expect(aoAbrir).toHaveBeenCalledWith(registro);
        expect(aoEditar).toHaveBeenCalledWith(registro);
        expect(aoExcluir).toHaveBeenCalledWith(registro);
    });

    test('bloqueia interações durante uma ação e rejeita contrato inválido', async () => {
        const aoAbrir = jest.fn();
        const resultado = await render(
            <DiaryEntryCard registro={registro} aoAbrir={aoAbrir} acaoEmAndamento="excluir" />
        );

        await fireEvent.press(screen.getByLabelText('Ver detalhes do registro de 04/11/2026'));
        expect(aoAbrir).not.toHaveBeenCalled();

        await resultado.rerender(<DiaryEntryCard registro={{ id: 0 }} aoAbrir={aoAbrir} />);
        expect(screen.queryByTestId('diary-entry-card')).not.toBeOnTheScreen();
        expect(normalizarRegistro(null)).toBeNull();
    });

    test('normaliza contratos incompletos sem inventar conteúdo', async () => {
        expect(normalizarRegistro('registro')).toBeNull();
        expect(normalizarRegistro([])).toBeNull();
        expect(normalizarRegistro({ id: 1, data: 'inválida', fase: 'lutea' })).toBeNull();
        expect(normalizarRegistro({ id: 1, data: '2026-11-04', fase: 'inexistente' })).toBeNull();

        const minimo = {
            id: 9,
            data: '2026-11-03',
            fase: 'ovulatoria',
            principais: [
                null,
                'texto',
                { valor: 1 },
                { valor: ' ' },
                { valor: 'Primeiro' },
                { valor: 'Segundo' },
                { valor: 'Terceiro' },
                { valor: 'Ignorado' }
            ],
            maisQuantidade: -1,
            trechoAnotacao: ' '
        };
        expect(normalizarRegistro(minimo)).toMatchObject({
            principais: [{ valor: 'Primeiro' }, { valor: 'Segundo' }, { valor: 'Terceiro' }],
            maisQuantidade: 1,
            trechoAnotacao: null
        });

        await render(<DiaryEntryCard registro={{ ...minimo, principais: undefined }} />);
        expect(screen.getByLabelText('Abrir registro de 03/11/2026')).toBeDisabled();
        expect(screen.getByRole('button', { name: /Editar registro/u })).toBeDisabled();
        expect(screen.queryByRole('button', { name: /Excluir registro/u })).not.toBeOnTheScreen();

        await render(<DiaryEntryCard registro={minimo} aoAbrir={jest.fn()} />);
        expect(screen.getByText('Primeiro')).toBeOnTheScreen();
        expect(screen.getByText('+ 1')).toBeOnTheScreen();
        expect(screen.queryByText('Ignorado')).not.toBeOnTheScreen();
    });

    test('mantém visível um registro antigo sem fase associada', async () => {
        await render(<DiaryEntryCard registro={{ ...registro, fase: null }} />);

        expect(screen.getByTestId('diary-entry-card')).toBeOnTheScreen();
        expect(screen.getByText('Fase não identificada')).toBeOnTheScreen();
    });

    test('compacta o card quando somente dados sigilosos foram registrados', async () => {
        await render(
            <DiaryEntryCard
                registro={{
                    id: 10,
                    data: '2026-11-02',
                    fase: 'lutea',
                    principais: [],
                    maisQuantidade: 0,
                    trechoAnotacao: null
                }}
                aoAbrir={jest.fn()}
            />
        );

        expect(screen.queryByTestId('diary-entry-content')).not.toBeOnTheScreen();
        expect(screen.queryByText('CATEGORIAS MARCADAS')).not.toBeOnTheScreen();
        expect(screen.getByText('Fase Lútea')).toBeOnTheScreen();
    });

    test('mostra somente a anotação quando não há categorias públicas', async () => {
        await render(
            <DiaryEntryCard
                registro={{
                    id: 11,
                    data: '2026-11-01',
                    fase: 'lutea',
                    principais: [],
                    maisQuantidade: 0,
                    trechoAnotacao: 'Somente anotação'
                }}
                aoAbrir={jest.fn()}
            />
        );

        expect(screen.getByText('Somente anotação')).toBeOnTheScreen();
        expect(screen.queryByText('CATEGORIAS MARCADAS')).not.toBeOnTheScreen();
    });
});
