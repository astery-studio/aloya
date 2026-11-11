import { fireEvent, screen } from '@testing-library/react-native';
jest.mock('../../../../src/features/diary/config/diaryMacroPresentation', () => ({
    obterApresentacaoMacrocategoria: () => ({ icone: () => null, paleta: 'ciclo' })
}));
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategorySection/DiaryMacrocategorySection',
    () => {
        const { Pressable, Text, View } = require('react-native');
        return function MockMacrocategorySection({ titulo, expandido, aoAlternar, children }) {
            return (
                <View>
                    <Pressable accessibilityRole="button" onPress={aoAlternar}>
                        <Text>{`${titulo}:${expandido}`}</Text>
                    </Pressable>
                    {expandido ? children : null}
                </View>
            );
        };
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
    criarEstadoExpandido,
    sincronizarEstadoExpandido
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
    expect(criarEstadoExpandido(macros)).toEqual({ corpo: false, vida: false });
    expect(sincronizarEstadoExpandido({ corpo: true }, ['corpo', 'vida'])).toEqual({
        corpo: true,
        vida: false
    });
});

test('aceita catálogo temporariamente vazio', async () => {
    const resultado = await render(
        <DiaryMacrocategoryList macrocategorias={[]} valores={{}} erros={{}} />
    );

    expect(resultado.toJSON()).not.toBeNull();
});

test('expande a seção sensível e encaminha alterações', async () => {
    const aoAlterar = jest.fn();
    const resultado = await render(
        <DiaryMacrocategoryList
            macrocategorias={macros}
            valores={{}}
            erros={{}}
            aoAlterar={aoAlterar}
        />
    );
    expect(screen.getByText('Corpo:false')).toBeOnTheScreen();
    expect(screen.queryByText('Intimidade')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Vida íntima:false'));
    await fireEvent.press(screen.getByText('Intimidade'));
    expect(aoAlterar).toHaveBeenCalledWith('intimidade', ['opcao']);
    await resultado.rerender(
        <DiaryMacrocategoryList
            macrocategorias={[...macros]}
            valores={{ intimidade: ['opcao'] }}
            erros={{}}
            aoAlterar={aoAlterar}
        />
    );
    expect(screen.getByText('Vida íntima:true')).toBeOnTheScreen();
    expect(screen.getByText('Intimidade')).toBeOnTheScreen();
});
