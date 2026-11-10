import { fireEvent, screen } from '@testing-library/react-native';

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
    test('agrupa opções preservando a ordem recebida', () => {
        expect(agruparOpcoes()).toEqual([]);
        expect(agruparOpcoes(categoria.opcoes)).toEqual([['coagulos', categoria.opcoes]]);
    });

    test('apresenta grupos e permite múltiplas escolhas', async () => {
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
        await fireEvent.press(screen.getByRole('button', { name: 'Muitos' }));
        expect(aoAlterar).toHaveBeenLastCalledWith([
            'fluxo_menstrual_coagulos_grandes',
            'fluxo_menstrual_coagulos_muitos'
        ]);
    });

    test('desabilita todas as opções e aceita paleta desconhecida', async () => {
        await render(
            <DiaryCategoryField categoria={categoria} valor={null} paleta="x" desabilitado />
        );
        expect(screen.getByRole('button', { name: 'Grandes' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Muitos' })).toBeDisabled();
    });
});
