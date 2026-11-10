import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen/ButtonScreen', () => {
    const { Pressable, Text } = require('react-native');
    return function MockButtonScreen({ texto, aoPressionar }) {
        return (
            <Pressable accessibilityRole="button" onPress={aoPressionar}>
                <Text>{texto}</Text>
            </Pressable>
        );
    };
});
jest.mock(
    '../../../../src/features/diary/components/DiaryDateNavigator/DiaryDateNavigator',
    () => ({
        DiaryDateNavigator: () => null
    })
);
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList',
    () => ({
        DiaryMacrocategoryList: () => null
    })
);

import { NewDiaryEntryContent } from '../../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryContent';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const formulario = {
    data: '2026-11-09',
    setData: jest.fn(),
    valores: {},
    erros: {},
    alterarValor: jest.fn(),
    salvar: jest.fn(),
    salvando: false
};

test('apresenta o carregamento do catálogo', async () => {
    await render(<NewDiaryEntryContent carregando formulario={formulario} />);
    expect(screen.getByText('Carregando suas categorias...')).toBeOnTheScreen();
});

test('apresenta a falha e permite tentar novamente', async () => {
    const recarregar = jest.fn();
    await render(
        <NewDiaryEntryContent
            carregando={false}
            erroCatalogo="Falha ao carregar."
            recarregar={recarregar}
            formulario={formulario}
        />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar.');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(recarregar).toHaveBeenCalledTimes(1);
});
