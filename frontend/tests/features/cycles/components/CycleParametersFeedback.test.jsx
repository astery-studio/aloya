import { fireEvent, render, screen } from '@testing-library/react-native';

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const { Pressable, Text } = require('react-native');
    return function Modal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria, aoFechar }) {
        if (!visivel) return null;
        return (
            <>
                <Text>{titulo}</Text>
                {mensagem ? <Text>{mensagem}</Text> : null}
                <Pressable accessibilityRole="button" accessibilityLabel={acaoPrincipal.texto} onPress={acaoPrincipal.aoPressionar} />
                {acaoSecundaria ? <Pressable accessibilityRole="button" accessibilityLabel={acaoSecundaria.texto} onPress={acaoSecundaria.aoPressionar} /> : null}
                <Pressable accessibilityRole="button" accessibilityLabel={`Fechar ${titulo}`} onPress={aoFechar} />
            </>
        );
    };
});

import { CycleParametersFeedback } from '../../../../src/features/cycles/components/CycleParametersFeedback';

function props(alteracoes = {}) {
    return {
        sucesso: false, erro: null, saidaSemSalvar: false, salvando: false,
        onFecharSucesso: jest.fn(), onFecharErro: jest.fn(), onTentarNovamente: jest.fn(),
        onContinuarEditando: jest.fn(), onSairSemSalvar: jest.fn(), ...alteracoes
    };
}

test('fecha a confirmação de sucesso', async () => {
    const dados = props({ sucesso: true });
    await render(<CycleParametersFeedback {...dados} />);
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(dados.onFecharSucesso).toHaveBeenCalled();
});

test('permite repetir ou fechar uma falha', async () => {
    const dados = props({ erro: 'Falha ao salvar' });
    await render(<CycleParametersFeedback {...dados} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(dados.onTentarNovamente).toHaveBeenCalled();
    expect(dados.onFecharErro).toHaveBeenCalled();
});

test('confirma saída ou continua editando', async () => {
    const dados = props({ saidaSemSalvar: true });
    await render(<CycleParametersFeedback {...dados} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Sair sem salvar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar a editar' }));
    expect(dados.onSairSemSalvar).toHaveBeenCalled();
    expect(dados.onContinuarEditando).toHaveBeenCalled();
});
