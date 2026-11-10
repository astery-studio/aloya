import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../src/features/diary/screens/DiaryScreen', () => {
    const { Pressable, Text } = require('react-native');
    return {
        DiaryScreen: ({ aoCriar, ultimoRegistro }) => (
            <Pressable accessibilityRole="button" onPress={aoCriar}>
                <Text>{ultimoRegistro?.data ?? 'Abrir Diário'}</Text>
            </Pressable>
        )
    };
});
jest.mock('../../../src/features/diary/components/NewDiaryEntryModal/NewDiaryEntryModal', () => {
    const { Pressable, Text } = require('react-native');
    return {
        NewDiaryEntryModal: ({ visivel, onFechar, onCriado }) =>
            visivel ? (
                <>
                    <Pressable accessibilityRole="button" onPress={onFechar}>
                        <Text>Fechar modal</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => onCriado({ id: 1, data: '2026-11-09' })}
                    >
                        <Text>Salvar modal</Text>
                    </Pressable>
                </>
            ) : null
    };
});

import { DiaryFlow, inserirRegistroOrdenado } from '../../../src/features/diary/DiaryFlow';
import { renderWithTheme as render } from '../../helpers/renderWithTheme';

test('ordena novos registros por data e id decrescentes', () => {
    const registros = [
        { id: 1, data: '2026-11-08' },
        { id: 2, data: '2026-11-09' }
    ];
    expect(inserirRegistroOrdenado(registros, { id: 3, data: '2026-11-09' })).toEqual([
        { id: 3, data: '2026-11-09' },
        { id: 2, data: '2026-11-09' },
        { id: 1, data: '2026-11-08' }
    ]);
    expect(registros).toHaveLength(2);
});

test('abre, fecha e recebe o registro criado', async () => {
    const onRegistroCriado = jest.fn();
    await render(<DiaryFlow service={{}} onRegistroCriado={onRegistroCriado} />);
    await fireEvent.press(screen.getByText('Abrir Diário'));
    await fireEvent.press(screen.getByText('Fechar modal'));
    expect(screen.queryByText('Salvar modal')).not.toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Abrir Diário'));
    await fireEvent.press(screen.getByText('Salvar modal'));
    expect(onRegistroCriado).toHaveBeenCalledWith({ id: 1, data: '2026-11-09' });
    expect(screen.getByText('2026-11-09')).toBeOnTheScreen();
});
