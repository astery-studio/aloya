import { fireEvent, screen, waitFor } from '@testing-library/react-native';

const mockCatalogo = {
    macrocategorias: [
        {
            id: 'corpo',
            ativa: true,
            categorias: [{ id: 'dor', tipoValor: 'opcoes', ativaEfetiva: true }]
        }
    ]
};
jest.mock('../../../../src/features/diary/hooks/useDiaryCatalog', () => ({
    useDiaryCatalog: () => ({ catalogo: mockCatalogo, carregando: false })
}));
jest.mock('../../../../src/features/diary/hooks/useDiaryPhase', () => ({
    useDiaryPhase: () => ({ fase: 'folicular', carregando: false })
}));
jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => ({
    BottomSheet: require('./newDiaryEntryIntegrationDoubles').MockBottomSheet
}));
jest.mock(
    '../../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryContent',
    () => ({ NewDiaryEntryContent: require('./newDiaryEntryIntegrationDoubles').MockContent })
);
jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => ({
    __esModule: true,
    default: require('./newDiaryEntryIntegrationDoubles').MockSimpleModal
}));

import { NewDiaryEntryModal } from '../../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryModal';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('troca o erro pelo sucesso ao tentar salvar novamente', async () => {
    const registro = { id: 1, data: '2026-11-11' };
    const service = {
        criarRegistro: jest.fn().mockRejectedValueOnce({}).mockResolvedValue(registro)
    };
    const onCriado = jest.fn();
    const onFechar = jest.fn();
    await render(
        <NewDiaryEntryModal visivel service={service} onCriado={onCriado} onFechar={onFechar} />
    );
    await fireEvent.press(screen.getByText('Preencher'));
    await fireEvent.press(screen.getByText('Salvar'));
    await waitFor(() => expect(screen.getByText('Algo deu errado')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Tentar novamente'));
    await waitFor(() => expect(screen.getByText('Registro salvo com sucesso.')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('OK'));
    expect(onCriado).toHaveBeenCalledWith(registro);
    expect(onFechar).toHaveBeenCalledTimes(1);
});

test('fecha o popup de erro pela ação Voltar', async () => {
    const service = { criarRegistro: jest.fn().mockRejectedValue({}) };
    await render(<NewDiaryEntryModal visivel service={service} />);
    await fireEvent.press(screen.getByText('Preencher'));
    await fireEvent.press(screen.getByText('Salvar'));
    await waitFor(() => expect(screen.getByText('Algo deu errado')).toBeOnTheScreen());
    await fireEvent.press(screen.getByText('Voltar'));
    expect(screen.queryByText('Algo deu errado')).not.toBeOnTheScreen();
});
