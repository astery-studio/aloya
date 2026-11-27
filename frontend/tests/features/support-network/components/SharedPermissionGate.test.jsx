import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { SharedPermissionGate } from '../../../../src/features/support-network/components/SharedPermissionGate/SharedPermissionGate';

function Historico({ permissoes }) {
    return (
        <SharedPermissionGate permissoes={permissoes} permissao="geral.historico_ciclo">
            <Text>Histórico compartilhado</Text>
        </SharedPermissionGate>
    );
}

test('exibe o conteúdo autorizado e o desmonta quando a permissão é revogada', async () => {
    const { rerender } = await render(<Historico permissoes={['geral.historico_ciclo']} />);
    expect(screen.getByText('Histórico compartilhado')).toBeOnTheScreen();

    await rerender(<Historico permissoes={['geral.fase_atual']} />);
    expect(screen.queryByText('Histórico compartilhado')).not.toBeOnTheScreen();
});

test.each([undefined, null, [], 'geral.historico_ciclo'])(
    'omite o conteúdo quando as permissões são %p',
    async (permissoes) => {
        await render(<Historico permissoes={permissoes} />);
        expect(screen.queryByText('Histórico compartilhado')).not.toBeOnTheScreen();
    }
);

test('pode apresentar conteúdo alternativo sem montar o bloco protegido', async () => {
    await render(
        <SharedPermissionGate
            permissoes={[]}
            permissao="geral.historico_ciclo"
            fallback={<Text>Conteúdo alternativo</Text>}
        >
            <Text>Histórico compartilhado</Text>
        </SharedPermissionGate>
    );

    expect(screen.getByText('Conteúdo alternativo')).toBeOnTheScreen();
    expect(screen.queryByText('Histórico compartilhado')).not.toBeOnTheScreen();
});
