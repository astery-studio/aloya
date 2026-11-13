import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen/ButtonScreen', () => {
    const { Pressable, Text } = require('react-native');
    return function MockButtonScreen({ texto, aoPressionar, desativado }) {
        return (
            <Pressable accessibilityRole="button" disabled={desativado} onPress={aoPressionar}>
                <Text>{texto}</Text>
                <Text>{`desativado:${desativado}`}</Text>
            </Pressable>
        );
    };
});
jest.mock('../../../../src/features/diary/components/DiaryDateNavigator/DiaryDateNavigator', () => {
    const { Pressable, Text, View } = require('react-native');
    return {
        DiaryDateNavigator: ({ aoAnterior, aoProximo, aoAbrirSeletor }) => (
            <View>
                <Pressable onPress={aoAnterior}>
                    <Text>Anterior</Text>
                </Pressable>
                <Pressable onPress={aoProximo}>
                    <Text>Próximo</Text>
                </Pressable>
                <Pressable onPress={aoAbrirSeletor}>
                    <Text>Abrir seletor</Text>
                </Pressable>
            </View>
        )
    };
});
jest.mock('../../../../src/shared/components/feedback/DatePickerSheet/DatePickerSheet', () => {
    const { Pressable, Text } = require('react-native');
    return {
        DatePickerSheet: ({ visivel, onSelecionar, onFechar }) =>
            visivel ? (
                <>
                    <Pressable onPress={() => onSelecionar('2026-11-06')}>
                        <Text>Escolher data</Text>
                    </Pressable>
                    <Pressable onPress={onFechar}>
                        <Text>Fechar seletor</Text>
                    </Pressable>
                </>
            ) : null
    };
});
jest.mock(
    '../../../../src/features/diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList',
    () => {
        const { Pressable, Text } = require('react-native');
        return {
            DiaryMacrocategoryList: ({ macrocategorias, aoAlterar, desabilitado }) => (
                <Pressable onPress={() => aoAlterar('dor', ['leve'])}>
                    <Text>{`Macros:${macrocategorias.length};desabilitado:${desabilitado}`}</Text>
                </Pressable>
            )
        };
    }
);

import { DiaryEntryFormContent } from '../../../../src/features/diary/components/DiaryEntryForm/DiaryEntryFormContent';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import { catalogoFormulario as catalogo } from './diaryContentFixtures';

test('renderiza o formulário, navega nas datas e salva', async () => {
    const formulario = {
        data: '2026-11-08',
        setData: jest.fn(),
        valores: {},
        erros: { data: 'Data inválida', conteudo: 'Preencha' },
        alterarValor: jest.fn(),
        salvar: jest.fn(),
        salvando: false
    };
    await render(
        <DiaryEntryFormContent catalogo={catalogo} carregando={false} formulario={formulario} />
    );

    expect(screen.getByText('Macros:1;desabilitado:false')).toBeOnTheScreen();
    expect(screen.getByTestId('rolagem-registro-diario')).toHaveProp(
        'keyboardShouldPersistTaps',
        'never'
    );
    expect(screen.getByTestId('rolagem-registro-diario')).toHaveProp(
        'keyboardDismissMode',
        'on-drag'
    );
    expect(screen.getByText('Registro no Diário')).toBeOnTheScreen();
    expect(screen.getByText('0 / 1 marcados')).toBeOnTheScreen();
    expect(
        screen.getByText('Selecione pelo menos uma opção para salvar no diário.')
    ).toBeOnTheScreen();
    expect(screen.getByText('Data inválida')).toBeOnTheScreen();
    expect(screen.getByText('Preencha')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Anterior'));
    await fireEvent.press(screen.getByText('Próximo'));
    const voltar = formulario.setData.mock.calls[0][0];
    const avancar = formulario.setData.mock.calls[1][0];
    expect(voltar('2026-11-08')).toBe('2026-11-07');
    expect(avancar('2026-11-08')).toBe('2026-11-09');
    expect(voltar('inválida')).toBe('inválida');
    expect(avancar('inválida')).toBe('inválida');
    await fireEvent.press(screen.getByText('Abrir seletor'));
    await fireEvent.press(screen.getByText('Escolher data'));
    expect(formulario.setData).toHaveBeenNthCalledWith(3, '2026-11-06');
    await fireEvent.press(screen.getByText('Fechar seletor'));
    expect(screen.queryByText('Escolher data')).toBeNull();
    await fireEvent.press(screen.getByText('Macros:1;desabilitado:false'));
    expect(formulario.alterarValor).toHaveBeenCalledWith('dor', ['leve']);
    await fireEvent.press(screen.getByRole('button', { name: /Salvar/u }));
    expect(screen.getByText('desativado:true')).toBeOnTheScreen();
    expect(formulario.salvar).not.toHaveBeenCalled();
});

test('habilita o salvamento e atualiza o contador quando há conteúdo válido', async () => {
    const formulario = {
        data: '2026-11-08',
        setData: jest.fn(),
        valores: { dor: '1' },
        erros: {},
        alterarValor: jest.fn(),
        salvar: jest.fn(),
        salvando: false
    };

    await render(
        <DiaryEntryFormContent
            catalogo={catalogo}
            carregando={false}
            fase="menstruacao"
            formulario={formulario}
        />
    );

    expect(screen.getByText('1 / 1 marcados')).toBeOnTheScreen();
    expect(screen.getByText('desativado:false')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Salvar/u }));
    expect(formulario.salvar).toHaveBeenCalledTimes(1);
});

test('mantém Salvar desativado na edição sem mudanças', async () => {
    const formulario = {
        data: '2026-11-08',
        setData: jest.fn(),
        valores: { dor: '1' },
        erros: {},
        alterarValor: jest.fn(),
        salvar: jest.fn(),
        salvando: false,
        alterado: false
    };

    await render(
        <DiaryEntryFormContent
            bloquearSalvarSemAlteracoes
            catalogo={catalogo}
            carregando={false}
            formulario={formulario}
        />
    );

    expect(screen.getByText('desativado:true')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Salvar/u }));
    expect(formulario.salvar).not.toHaveBeenCalled();
});

test('fecha pelo gesto complementar somente quando a rolagem está no topo', async () => {
    const onDeslizarParaFechar = jest.fn();
    const formulario = {
        data: '2026-11-08',
        setData: jest.fn(),
        valores: { dor: '1' },
        erros: {},
        alterarValor: jest.fn(),
        salvar: jest.fn(),
        salvando: false
    };
    await render(
        <DiaryEntryFormContent
            catalogo={catalogo}
            carregando={false}
            formulario={formulario}
            onDeslizarParaFechar={onDeslizarParaFechar}
        />
    );
    const rolagem = screen.getByTestId('rolagem-registro-diario');

    await fireEvent(rolagem, 'touchStart', { nativeEvent: { pageY: 100 } });
    await fireEvent(rolagem, 'touchMove', { nativeEvent: { pageY: 150 } });
    await fireEvent(rolagem, 'touchEnd', { nativeEvent: { pageY: 150 } });
    expect(onDeslizarParaFechar).toHaveBeenCalledTimes(1);

    await fireEvent.scroll(rolagem, { nativeEvent: { contentOffset: { y: 20 } } });
    await fireEvent(rolagem, 'touchStart', { nativeEvent: { pageY: 100 } });
    await fireEvent(rolagem, 'touchMove', { nativeEvent: { pageY: 180 } });
    await fireEvent(rolagem, 'touchEnd', { nativeEvent: { pageY: 180 } });
    expect(onDeslizarParaFechar).toHaveBeenCalledTimes(1);

    await fireEvent(rolagem, 'touchCancel', { nativeEvent: {} });
});
