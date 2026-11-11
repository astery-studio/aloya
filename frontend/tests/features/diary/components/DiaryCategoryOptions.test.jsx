import { fireEvent, screen } from '@testing-library/react-native';

const mockDiaryOptionIcon = jest.fn(() => null);
jest.mock('../../../../src/features/diary/config/diaryOptionPresentation', () => ({
    obterApresentacaoOpcao: (categoriaId, opcao) => ({
        iconeId: `${categoriaId}-${opcao.id}`,
        iconeProps: opcao.id.endsWith('muitos') ? { color: '#123456', weight: 'fill' } : {}
    })
}));
jest.mock('../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon', () => ({
    DiaryOptionIcon: (props) => mockDiaryOptionIcon(props)
}));

import { DiaryCategoryField } from '../../../../src/features/diary/components/DiaryCategoryField/DiaryCategoryField';
import { agruparOpcoes } from '../../../../src/features/diary/utils/diaryOptionGroups';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const categoria = {
    id: 'fluxo_menstrual',
    nome: 'Fluxo menstrual',
    tipoValor: 'opcoes',
    opcoes: [
        {
            id: 'fluxo_menstrual_coagulos_grandes',
            grupo: 'coagulos',
            nome: 'Grandes'
        },
        {
            id: 'fluxo_menstrual_coagulos_muitos',
            grupo: 'coagulos',
            nome: 'Muitos'
        }
    ]
};

describe('opções de DiaryCategoryField', () => {
    beforeEach(() => mockDiaryOptionIcon.mockClear());

    test('agrupa opções preservando a ordem recebida', () => {
        expect(agruparOpcoes()).toEqual([]);
        expect(agruparOpcoes(categoria.opcoes)).toEqual([['coagulos', categoria.opcoes]]);
    });

    test('apresenta grupos e substitui escolhas exclusivas', async () => {
        const aoAlterar = jest.fn();
        const resultado = await render(
            <DiaryCategoryField
                categoria={categoria}
                valor={[]}
                aoAlterar={aoAlterar}
                paleta="ciclo"
            />
        );
        expect(screen.getByRole('header', { name: 'Fluxo menstrual' })).toBeOnTheScreen();
        expect(screen.getByText('COÁGULOS')).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Grandes' }));
        expect(aoAlterar).toHaveBeenLastCalledWith(['fluxo_menstrual_coagulos_grandes']);

        await resultado.rerender(
            <DiaryCategoryField
                categoria={categoria}
                valor={['fluxo_menstrual_coagulos_grandes']}
                aoAlterar={aoAlterar}
            />
        );
        expect(mockDiaryOptionIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                iconeId: 'fluxo_menstrual-fluxo_menstrual_coagulos_grandes',
                color: '#FFFFFF',
                selecionado: true
            })
        );
        expect(mockDiaryOptionIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                iconeId: 'fluxo_menstrual-fluxo_menstrual_coagulos_muitos',
                color: '#123456',
                weight: 'fill'
            })
        );
        await fireEvent.press(screen.getByRole('button', { name: 'Muitos' }));
        expect(aoAlterar).toHaveBeenLastCalledWith(['fluxo_menstrual_coagulos_muitos']);
        await resultado.rerender(
            <DiaryCategoryField
                categoria={categoria}
                valor={['fluxo_menstrual_coagulos_grandes', 'fluxo_menstrual_coagulos_muitos']}
                aoAlterar={aoAlterar}
            />
        );
        expect(mockDiaryOptionIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                iconeId: 'fluxo_menstrual-fluxo_menstrual_coagulos_muitos',
                color: '#FFFFFF',
                selecionado: true,
                weight: 'fill'
            })
        );
    });

    test('desabilita todas as opções e aceita paleta desconhecida', async () => {
        await render(
            <DiaryCategoryField categoria={categoria} valor={null} paleta="x" desabilitado />
        );
        expect(screen.getByRole('button', { name: 'Grandes' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Muitos' })).toBeDisabled();
    });

    test('aceita grupo sem título e sem callback de alteração', async () => {
        const semTitulo = {
            id: 'categoria_nova',
            nome: 'Categoria nova',
            tipoValor: 'opcoes',
            opcoes: [{ id: 'opcao_nova', grupo: 'grupo_novo', nome: 'Opção nova' }]
        };
        await render(<DiaryCategoryField categoria={semTitulo} valor={[]} />);
        await fireEvent.press(screen.getByRole('button', { name: 'Opção nova' }));
        expect(screen.getByRole('header', { name: 'Categoria nova' })).toBeOnTheScreen();
    });
});
