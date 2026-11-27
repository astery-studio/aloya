import { fireEvent, screen } from '@testing-library/react-native';
import { IndividualPermissionsForm } from '../../../../src/features/support-network/components/IndividualPermissionsForm/IndividualPermissionsForm';
import { renderWithTheme } from '../../../helpers/renderWithTheme';

jest.mock('react-native/Libraries/Modal/Modal', () => {
    const { useEffect } = require('react');
    return {
        default: function Modal({ visible, onDismiss, children }) {
            useEffect(() => {
                if (!visible) onDismiss?.();
            }, [onDismiss, visible]);
            return visible ? children : null;
        }
    };
});

jest.mock('../../../../src/shared/components/feedback/BottomSheet/BottomSheet', () => {
    const { useEffect, useRef } = require('react');
    return {
        BottomSheet({ visivel, onOcultar, children }) {
            const antes = useRef(visivel);
            useEffect(() => {
                if (antes.current && !visivel) onOcultar?.();
                antes.current = visivel;
            }, [onOcultar, visivel]);
            return visivel ? children : null;
        }
    };
});

jest.mock('../../../../src/features/contraceptives/ContraceptiveFlow', () => {
    const { Pressable, Text } = require('react-native');
    return {
        ContraceptiveFlow: ({ onVoltar }) => (
            <Pressable accessibilityRole="button" onPress={onVoltar}>
                <Text>Voltar de Anticoncepcionais</Text>
            </Pressable>
        )
    };
});

const acesso = 'Acesso aos Anticoncepcionais';
const atalho = 'Ir para Anticoncepcionais';

test('mostra apenas os métodos ativos e permite configurar acesso e alertas', async () => {
    const listar = jest.fn().mockResolvedValue([
        { id: '1', nome: 'Minha pílula', tipo: 'pilula' },
        { id: '2', nome: 'Método removido', tipo: 'injetavel', ativo: false }
    ]);
    await renderWithTheme(<IndividualPermissionsForm visivel contraceptiveService={{ listar }} />);
    expect(await screen.findByText('Minha pílula')).toBeOnTheScreen();
    expect(screen.queryByText('Método removido')).toBeNull();
    expect(screen.getByRole('switch', { name: acesso })).toBeOnTheScreen();
    expect(
        screen.getByRole('switch', { name: 'Receber alerta de Anticoncepcional' })
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: atalho })).toBeNull();
});

test('sem métodos, o atalho volta à edição e a seleção em lote ignora anticoncepcionais', async () => {
    const listar = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValue([{ id: '1', nome: 'Nova pílula', tipo: 'pilula' }]);
    const aoAlterar = jest.fn();
    await renderWithTheme(
        <IndividualPermissionsForm
            visivel
            contraceptiveService={{ listar }}
            aoAlterar={aoAlterar}
        />
    );
    expect(await screen.findByText('Nenhum anticoncepcional cadastrado')).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: acesso })).toBeNull();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Permissões Gerais' }));
    expect(aoAlterar).toHaveBeenCalledWith([
        'geral.fase_atual',
        'geral.historico_ciclo',
        'geral.dicas'
    ]);

    await fireEvent.press(screen.getByRole('button', { name: atalho }));
    const voltar = await screen.findByRole('button', { name: 'Voltar de Anticoncepcionais' });
    expect(screen.getByTestId('anticoncepcionais-modal-area-segura')).toContainElement(voltar);
    await fireEvent.press(voltar);
    expect(await screen.findByText('Nova pílula')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: acesso })).toBeOnTheScreen();
});

test('falha na consulta oferece retentativa sem exibir o estado vazio', async () => {
    const listar = jest.fn().mockRejectedValueOnce(new Error('rede')).mockResolvedValue([]);
    await renderWithTheme(<IndividualPermissionsForm visivel contraceptiveService={{ listar }} />);
    expect(
        await screen.findByText('Não foi possível carregar os anticoncepcionais')
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: atalho })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('button', { name: atalho })).toBeOnTheScreen();
});
