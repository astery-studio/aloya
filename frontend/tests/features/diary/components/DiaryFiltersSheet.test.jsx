import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Keyboard } from 'react-native';

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const { Pressable } = require('react-native');
    return {
        BottomSheet: ({ visivel, children, podeIniciarDeslize }) =>
            visivel ? (
                <Pressable testID="sonda-deslize-filtros" onPress={podeIniciarDeslize}>
                    {children}
                </Pressable>
            ) : null
    };
});

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
}, 30000);

test('permanece desmontado quando não está visível', async () => {
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(catalogo) };
    await render(<DiaryFiltersSheet visivel={false} filtros={{}} service={service} />);
    expect(screen.queryByText('Filtrar Diário')).not.toBeOnTheScreen();
});

test('limpa datas, fases e todas as categorias pelos controles do painel', async () => {
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(catalogo) };
    await render(
        <DiaryFiltersSheet
            visivel
            filtros={{
                dataInicio: '2026-11-01',
                dataFim: '2026-11-12',
                fases: ['lutea'],
                categorias: ['fluxo_menstrual']
            }}
            service={service}
            onAplicar={jest.fn()}
        />
    );
    await waitFor(() => expect(screen.getByText('Filtro por Período')).toBeOnTheScreen());
    const rolagem = screen.getByTestId('rolagem-filtros-diario');
    await fireEvent.scroll(rolagem, { nativeEvent: { contentOffset: { y: -4 } } });
    await fireEvent.press(screen.getByTestId('sonda-deslize-filtros'));

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar data de início do filtro' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar data final do filtro' }));
    await fireEvent.press(screen.getByText('Fase Lútea'));

    await fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));
    await fireEvent.press(
        screen.getByRole('switch', { name: 'Desmarcar todas as categorias de Ciclo e Sangramento' })
    );
    await waitFor(() =>
        expect(
            screen.getByRole('switch', {
                name: 'Marcar todas as categorias de Ciclo e Sangramento'
            })
        ).not.toBeChecked()
    );
    await fireEvent.press(
        screen.getByRole('switch', { name: 'Marcar todas as categorias de Ciclo e Sangramento' })
    );
    await fireEvent.press(screen.getByText('Fluxo menstrual'));
    await fireEvent.press(screen.getByRole('switch', { name: 'Filtrar por Fluxo menstrual' }));
    await fireEvent.press(
        screen.getByRole('switch', { name: 'Desmarcar todas as categorias de Ciclo e Sangramento' })
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Limpar' }));
    expect(screen.getByLabelText('Data de início do filtro')).toHaveProp('value', '');
    expect(screen.getByLabelText('Data final do filtro')).toHaveProp('value', '');
});

test('mostra loading e erro de catálogo com ações de recuperação', async () => {
    let rejeitar;
    const onFechar = jest.fn();
    const service = {
        buscarCatalogo: jest
            .fn()
            .mockImplementationOnce(() => new Promise((_resolve, reject) => (rejeitar = reject)))
            .mockResolvedValueOnce(catalogo)
    };
    await render(
        <DiaryFiltersSheet visivel filtros={{}} service={service} onFechar={onFechar} />
    );
    expect(screen.getByText('Carregando filtros do Diário...')).toBeOnTheScreen();
    await waitFor(() => expect(rejeitar).toBeDefined());
    rejeitar(new Error('rede'));
    await waitFor(() => expect(screen.getByText('Algo deu errado')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(screen.getByText('Filtro por Período')).toBeOnTheScreen());
});
