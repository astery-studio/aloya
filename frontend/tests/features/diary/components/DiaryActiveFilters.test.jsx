import { fireEvent, screen } from '@testing-library/react-native';

import {
    criarDescritoresFiltros,
    DiaryActiveFilters
} from '../../../../src/features/diary/components/DiaryActiveFilters/DiaryActiveFilters';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const filtros = {
    dataInicio: '2026-11-01',
    dataFim: '2026-11-12',
    fases: ['folicular'],
    categorias: ['pele']
};

test('exibe todos os critérios e permite remover somente um', async () => {
    const aoRemover = jest.fn();
    const aoLimpar = jest.fn();
    await render(
        <DiaryActiveFilters
            filtros={filtros}
            rotulosCategorias={{ pele: 'Pele' }}
            quantidadeResultados={3}
            aoRemover={aoRemover}
            aoLimpar={aoLimpar}
        />
    );

    expect(screen.getByText('FILTRO APLICADO (3)')).toBeOnTheScreen();
    expect(screen.getByText('Desde 01/11/2026')).toBeOnTheScreen();
    expect(screen.getByText('Até 12/11/2026')).toBeOnTheScreen();
    expect(screen.getByText('Fase Folicular')).toBeOnTheScreen();
    expect(screen.getByText('Pele')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Remover filtro Pele' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(aoRemover).toHaveBeenCalledWith('categoria:pele');
    expect(aoLimpar).toHaveBeenCalledTimes(1);
});

test('não renderiza sem critérios e usa fallback seguro para categoria', async () => {
    expect(criarDescritoresFiltros({ categorias: ['desconhecida'] })).toEqual([
        { id: 'categoria:desconhecida', rotulo: 'desconhecida' }
    ]);
    await render(<DiaryActiveFilters filtros={{}} />);
    expect(screen.queryByTestId('filtros-ativos-diario')).not.toBeOnTheScreen();
});

test('ignora fase desconhecida e usa zero quando a contagem não é inteira', async () => {
    expect(criarDescritoresFiltros({ fases: ['desconhecida'] })).toEqual([]);
    await render(
        <DiaryActiveFilters
            filtros={{ categorias: ['pele'] }}
            rotulosCategorias={{ pele: 'Pele' }}
            quantidadeResultados="3"
        />
    );
    expect(screen.getByText('FILTRO APLICADO (0)')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Remover filtro Pele' }));
});
