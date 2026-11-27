import { screen } from '@testing-library/react-native';
import { EditDiaryEntrySheet } from '../../../../src/features/diary/components/EditDiaryEntrySheet/EditDiaryEntrySheet';
import { NewDiaryEntrySheet } from '../../../../src/features/diary/components/NewDiaryEntrySheet/NewDiaryEntrySheet';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

test.each([
    ['criação', NewDiaryEntrySheet, {}],
    ['edição', EditDiaryEntrySheet, { registro: { id: 1, data: '2026-11-08', categorias: [] } }]
])('mantém o botão Salvar acima da área de navegação na %s', async (_modo, Tela, props) => {
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue({ versao: 1, macrocategorias: [] })
    };
    await renderWithTheme(<Tela visivel service={service} {...props} />);

    const salvar = await screen.findByRole('button', { name: 'Salvar' });
    const painel = screen.getByTestId('bottom-sheet-painel');
    expect(painel).toHaveProp('edges', {
        top: 'off', bottom: 'maximum', left: 'maximum', right: 'maximum'
    });
    expect(painel).not.toHaveStyle({ paddingBottom: 0 });
    expect(painel).toContainElement(salvar);
});
