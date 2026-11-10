import { fireEvent, screen } from '@testing-library/react-native';
jest.mock('../../../../src/features/diary/config/diaryMacroPresentation', () => ({
    obterApresentacaoMacrocategoria: () => ({ icone: () => null, paleta: 'ciclo' })
}));
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategorySection/DiaryMacrocategorySection',
    () => {
        const { Pressable, Text, View } = require('react-native');
        return ({ titulo, expandido, aoAlternar, children }) => (
            <View>
                <Pressable accessibilityRole="button" onPress={aoAlternar}>
                    <Text>{`${titulo}:${expandido}`}</Text>
                </Pressable>
                {expandido ? children : null}
            </View>
        );
    }
);
jest.mock('../../../../src/features/diary/components/DiaryCategoryField/DiaryCategoryField', () => {
    const { Pressable, Text } = require('react-native');
    return {
        DiaryCategoryField: ({ categoria, aoAlterar }) => (
            <Pressable accessibilityRole="button" onPress={() => aoAlterar(['opcao'])}>
                <Text>{categoria.nome}</Text>
            </Pressable>
        )
    };
});

import {
    DiaryMacrocategoryList,
    criarEstadoExpandido
} from '../../../../src/features/diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const macros = [
    {
        id: 'corpo',
        nome: 'Corpo',
        recolhidaPorPadrao: false,
        categorias: [{ id: 'dor', nome: 'Dor' }]
    },
    {
        id: 'vida',
        nome: 'Vida íntima',
        recolhidaPorPadrao: true,
        categorias: [{ id: 'intimidade', nome: 'Intimidade' }]
    }
];

test('define a discrição inicial de cada macrocategoria', () => {
    expect(criarEstadoExpandido(macros)).toEqual({ corpo: true, vida: false });
});

test('expande a seção sensível e encaminha alterações', async () => {
    const aoAlterar = jest.fn();
    await render(
        <DiaryMacrocategoryList
            macrocategorias={macros}
            valores={{}}
            erros={{}}
            aoAlterar={aoAlterar}
        />
    );
    expect(screen.getByText('Corpo:true')).toBeOnTheScreen();
    expect(screen.queryByText('Intimidade')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Vida íntima:false'));
    await fireEvent.press(screen.getByText('Intimidade'));
    expect(aoAlterar).toHaveBeenCalledWith('intimidade', ['opcao']);
});
