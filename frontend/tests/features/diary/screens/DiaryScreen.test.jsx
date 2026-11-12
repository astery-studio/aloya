import { fireEvent, screen } from '@testing-library/react-native';

import {
    calcularMargemHorizontalTimeline,
    DiaryScreen
} from '../../../../src/features/diary/screens/DiaryScreen';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const registro = {
    id: 1,
    data: '2026-11-09',
    fase: 'folicular',
    principais: [
        {
            categoriaId: 'pele',
            categoria: 'Pele',
            valor: 'Pele',
            macrocategoriaId: 'corpo_sintomas_fisicos'
        }
    ],
    maisQuantidade: 0,
    trechoAnotacao: null,
    versao: 1
};

describe('histórico do Diário', () => {
    test('preserva a largura do card do protótipo em celulares estreitos', () => {
        expect(calcularMargemHorizontalTimeline(360)).toBe(5);
        expect(calcularMargemHorizontalTimeline(390)).toBe(20);
        expect(calcularMargemHorizontalTimeline(412)).toBe(20);
        expect(calcularMargemHorizontalTimeline()).toBe(20);
    });

    test('mostra estado vazio e abre a criação', async () => {
        const aoCriar = jest.fn();
        await render(<DiaryScreen aoCriar={aoCriar} onSelecionarAba={jest.fn()} />);

        expect(screen.getByRole('header', { name: 'Diário' })).toBeOnTheScreen();
        expect(screen.getByRole('header', { name: 'Nenhum registro visível' })).toBeOnTheScreen();
        expect(
            screen.getByText(/as categorias usadas neles podem estar desativadas/)
        ).toBeOnTheScreen();
        expect(screen.getByText(/Ative-as em "Gerenciar categorias"/)).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Adicionar novo registro' }));
        expect(aoCriar).toHaveBeenCalledTimes(1);
    });

    test('apresenta loading e erro inicial com retentativa', async () => {
        const tentar = jest.fn();
        const resultado = await render(<DiaryScreen carregando />);
        expect(screen.getByTestId('diary-loading')).toBeOnTheScreen();

        await resultado.rerender(<DiaryScreen erro="erro seguro" aoTentarNovamente={tentar} />);
        expect(screen.getByRole('header', { name: 'Ocorreu um erro' })).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Tentar Novamente' }));
        expect(tentar).toHaveBeenCalledTimes(1);
    });

    test('mostra resumo, timeline, atualização e ações do cabeçalho', async () => {
        const criar = jest.fn();
        const abrir = jest.fn();
        const excluir = jest.fn();
        const filtrar = jest.fn();
        const gerenciar = jest.fn();
        await render(
            <DiaryScreen
                resumo={{
                    fase: 'folicular',
                    tituloFase: 'Fase Folicular',
                    descricao: 'Energia e disposição podem aumentar.',
                    diasRegistrados: 1
                }}
                registros={[registro]}
                atualizando
                aoCriar={criar}
                aoAbrirRegistro={abrir}
                aoExcluirRegistro={excluir}
                aoAbrirFiltros={filtrar}
                aoGerenciarCategorias={gerenciar}
            />
        );

        expect(screen.getByText('RESUMO DO DIÁRIO')).toBeOnTheScreen();
        expect(screen.getByTestId('diary-main-container')).toHaveStyle({
            flex: 1,
            minHeight: 0,
            alignSelf: 'stretch'
        });
        expect(screen.getByText('LINHA DO TEMPO')).toBeOnTheScreen();
        expect(screen.getByText('Atualizando Diário...')).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Filtrar histórico do Diário' }));
        await fireEvent.press(
            screen.getByRole('button', { name: 'Gerenciar categorias do Diário' })
        );
        await fireEvent.press(
            screen.getAllByRole('button', { name: 'Adicionar novo registro' })[0]
        );
        await fireEvent.press(screen.getByLabelText('Ver detalhes do registro de 09/11/2026'));
        await fireEvent.press(
            screen.getByRole('button', { name: 'Excluir registro de 09/11/2026' })
        );
        expect(filtrar).toHaveBeenCalledTimes(1);
        expect(gerenciar).toHaveBeenCalledTimes(1);
        expect(criar).toHaveBeenCalledTimes(1);
        expect(abrir).toHaveBeenCalledWith(registro);
        expect(excluir).toHaveBeenCalledWith(registro);
    });

    test('tolera lista inválida e compõe ações e resumo opcionais de forma independente', async () => {
        const filtrar = jest.fn();
        const gerenciar = jest.fn();
        const resultado = await render(
            <DiaryScreen registros="inválido" aoAbrirFiltros={filtrar} />
        );
        expect(screen.getByRole('header', { name: 'Nenhum registro visível' })).toBeOnTheScreen();
        expect(
            screen.queryByRole('button', { name: 'Gerenciar categorias do Diário' })
        ).not.toBeOnTheScreen();

        await resultado.rerender(
            <DiaryScreen registros={[registro]} aoGerenciarCategorias={gerenciar} />
        );
        expect(screen.getByText('LINHA DO TEMPO')).toBeOnTheScreen();
        expect(screen.queryByText('RESUMO DO DIÁRIO')).not.toBeOnTheScreen();
        expect(
            screen.queryByRole('button', { name: 'Filtrar histórico do Diário' })
        ).not.toBeOnTheScreen();
    });
});
