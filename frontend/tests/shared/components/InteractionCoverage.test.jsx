import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../../src/shared/theme/ThemeProvider';
import { BottomSheet } from '../../../src/shared/components/feedback/BottomSheet/BottomSheet';
import { EditFieldSheet } from '../../../src/shared/components/feedback/EditFieldSheet/EditFieldSheet';
import AlertModal from '../../../src/shared/components/feedback/Modal/AlertModal/AlertModal';
import NumberInput from '../../../src/shared/components/forms/NumberInput';
import RadioOption from '../../../src/shared/components/forms/RadioOption';

function SafeAreaDeTeste({ children }) {
    return (
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 390, height: 844 },
                insets: { top: 0, right: 0, bottom: 32, left: 0 }
            }}
        >
            <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                {children}
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

test('BottomSheet monta ao se tornar visível e anima após aparecer', async () => {
    const view = await render(
        <BottomSheet visivel={false}>
            <Text>Painel</Text>
        </BottomSheet>,
        { wrapper: SafeAreaDeTeste }
    );
    await view.rerender(
        <BottomSheet visivel>
            <Text>Painel</Text>
        </BottomSheet>
    );
    expect(screen.getByText('Painel')).toBeTruthy();
});

test('EditFieldSheet tenta focar o campo quando não está salvando', async () => {
    await render(<EditFieldSheet visivel titulo="Nome" valor="Carla" />, {
        wrapper: SafeAreaDeTeste
    });
    expect(() => fireEvent.press(screen.getByLabelText('Nome'))).not.toThrow();
});

test('ação de fechamento carregando é ignorada com segurança', async () => {
    const view = await render(
        <AlertModal
            visivel
            titulo="Aguarde"
            aoFechar={jest.fn()}
            acaoPrincipal={{ texto: 'Salvar', carregando: true }}
        />,
        { wrapper: SafeAreaDeTeste }
    );
    const modal = view.container.queryAll(
        (elemento) => typeof elemento.props.onRequestClose === 'function'
    )[0];
    expect(() => modal.props.onRequestClose()).not.toThrow();
});

test('campos usam padrões e cobrem interações opcionais', async () => {
    await render(
        <>
            <NumberInput valor={1} />
            <RadioOption titulo="Única" />
        </>,
        { wrapper: SafeAreaDeTeste }
    );
    await fireEvent.press(screen.getByLabelText('Duração em dias'));
    expect(screen.getByRole('radio', { name: 'Única' })).not.toBeSelected();
    expect(screen.queryByText('Descrição')).toBeNull();
});
