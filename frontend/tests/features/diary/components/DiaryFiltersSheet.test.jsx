import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

import { DiaryFiltersSheet } from '../../../../src/features/diary/components/DiaryFiltersSheet/DiaryFiltersSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const catalogo = {
    versao: 1,
    macrocategorias: [
        {
            id: 'ciclo_sangramento',
            nome: 'Ciclo e Sangramento',
            ativa: true,
            categorias: [
                { id: 'fluxo_menstrual', nome: 'Fluxo menstrual', ativaEfetiva: true },
                { id: 'secrecao', nome: 'Secreção', ativaEfetiva: false }
            ]
        },
        {
            id: 'emocional',
            nome: 'Emocional',
            ativa: false,
            categorias: [{ id: 'humor', nome: 'Humor', ativaEfetiva: false }]
        }
    ]
};

test('filtra somente categorias ativas e aplica período, fase e categoria', async () => {
    const fecharTeclado = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
    const onAplicar = jest.fn();
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(catalogo) };
    await render(
        <DiaryFiltersSheet visivel filtros={{}} service={service} onAplicar={onAplicar} />
    );
    await waitFor(() => expect(screen.getByText('Filtro por Período')).toBeOnTheScreen());

    fireEvent.changeText(screen.getByLabelText('Data de início do filtro'), '01/01/7777');
    await waitFor(() =>
        expect(screen.getByLabelText('Data de início do filtro')).toHaveProp('value', '01/01/7777')
    );
    fireEvent.press(screen.getByRole('button', { name: 'Aplicar Filtro' }));
    await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('A data inicial não pode ser futura.')
    );
    expect(onAplicar).not.toHaveBeenCalled();
    expect(fecharTeclado).toHaveBeenCalledTimes(1);
    fireEvent.changeText(screen.getByLabelText('Data de início do filtro'), '11/11/1111');
    await waitFor(() =>
        expect(screen.getByLabelText('Data de início do filtro')).toHaveProp('value', '11/11/1111')
    );
    fireEvent.press(screen.getByRole('button', { name: 'Aplicar Filtro' }));
    await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Informe uma data inicial válida.')
    );
    expect(onAplicar).not.toHaveBeenCalled();
    expect(fecharTeclado).toHaveBeenCalledTimes(2);
    fireEvent.changeText(screen.getByLabelText('Data de início do filtro'), '');
    await waitFor(() =>
        expect(screen.getByLabelText('Data de início do filtro')).toHaveProp('value', '')
    );

    expect(screen.queryByText('Emocional')).not.toBeOnTheScreen();
    expect(screen.queryByText('Fluxo menstrual')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' })).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));
    await waitFor(() => expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen());
    expect(screen.getByRole('button', { name: 'Recolher Ciclo e Sangramento' })).toBeOnTheScreen();
    expect(screen.queryByText('Secreção')).not.toBeOnTheScreen();

    fireEvent.changeText(screen.getByLabelText('Data de início do filtro'), '01/11/2026');
    await waitFor(() =>
        expect(screen.getByLabelText('Data de início do filtro')).toHaveProp(
            'value',
            '01/11/2026'
        )
    );
    fireEvent.changeText(screen.getByLabelText('Data final do filtro'), '12/11/2026');
    await waitFor(() =>
        expect(screen.getByLabelText('Data final do filtro')).toHaveProp('value', '12/11/2026')
    );
    fireEvent.press(screen.getByRole('switch', { name: 'Filtrar por Fase Folicular' }));
    await waitFor(() =>
        expect(screen.getByRole('switch', { name: 'Filtrar por Fase Folicular' })).toBeChecked()
    );
    fireEvent.press(screen.getByRole('switch', { name: 'Filtrar por Fluxo menstrual' }));
    await waitFor(() => {
        expect(screen.getByRole('switch', { name: 'Filtrar por Fluxo menstrual' })).toBeChecked();
    });
    fireEvent.press(screen.getByRole('button', { name: 'Aplicar Filtro' }));

    expect(onAplicar).toHaveBeenCalledWith(
        {
            dataInicio: '2026-11-01',
            dataFim: '2026-11-12',
            categorias: ['fluxo_menstrual'],
            fases: ['folicular']
        },
        catalogo
    );
    expect(fecharTeclado).toHaveBeenCalledTimes(3);
    fecharTeclado.mockRestore();
});
