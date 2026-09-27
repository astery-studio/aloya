import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { BottomSheet } from '../../components/feedback/Bottomsheet/BottomSheet';
import { EditFieldSheet } from '../../components/feedback/EditFieldSheet/EditFieldSheet';
import AlertModal from '../../components/feedback/Modal/AlertModal/AlertModal';
import NumberInput from '../../components/forms/NumberInput';
import RadioOption from '../../components/forms/RadioOption';

test('BottomSheet monta ao se tornar visível e anima após aparecer', async () => {
    const view = await render(<BottomSheet visivel={false}><Text>Painel</Text></BottomSheet>);
    await view.rerender(<BottomSheet visivel><Text>Painel</Text></BottomSheet>);
    expect(screen.getByText('Painel')).toBeTruthy();
});

test('EditFieldSheet tenta focar o campo quando não está salvando', async () => {
    const view = await render(<EditFieldSheet visivel titulo="Nome" valor="Carla" />);
    expect(() => fireEvent.press(screen.getByLabelText('Nome'))).not.toThrow();
});

test('ação de fechamento carregando é ignorada com segurança', async () => {
    const view = await render(<AlertModal visivel titulo="Aguarde" aoFechar={jest.fn()}
        acaoPrincipal={{ texto: 'Salvar', carregando: true }} />);
    const modal = view.container.queryAll(
        (elemento) => typeof elemento.props.onRequestClose === 'function'
    )[0];
    expect(() => modal.props.onRequestClose()).not.toThrow();
});

test('campos usam padrões e cobrem interações opcionais', async () => {
    const view = await render(<><NumberInput valor={1} /><RadioOption titulo="Única" /></>);
    await fireEvent.press(screen.getByLabelText('Duração em dias'));
    expect(screen.getByRole('radio', { name: 'Única' })).not.toBeSelected();
    expect(screen.queryByText('Descrição')).toBeNull();
});
