import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import {
    ThemePreferenceProvider,
    useThemePreferenceContext
} from '../../../../src/features/settings/providers/ThemePreferenceProvider';
import { useThemeContext } from '../../../../src/shared/theme/ThemeProvider';

function criarService({ preferencia = 'automatico' } = {}) {
    return {
        buscarPreferencia: jest.fn().mockResolvedValue(preferencia),

        atualizarPreferencia: jest
            .fn()
            .mockImplementation(async (novaPreferencia) => novaPreferencia)
    };
}

function LeitorDoTema() {
    const { preferencia, carregando, salvando, erro, alterarPreferencia, limparErro } =
        useThemePreferenceContext();

    const { modo, tema } = useThemeContext();

    return (
        <>
            <Text testID="preferencia">{preferencia}</Text>

            <Text testID="modo">{modo}</Text>

            <Text testID="fundo">{tema.cores.interface.fundo}</Text>

            <Text testID="carregando">{String(carregando)}</Text>

            <Text testID="salvando">{String(salvando)}</Text>

            {erro ? <Text testID="erro">{erro}</Text> : null}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ativar tema escuro"
                onPress={() => alterarPreferencia('escuro')}
            />

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar erro"
                onPress={limparErro}
            />
        </>
    );
}

describe('ThemePreferenceProvider', () => {
    test('usa o modo automático do sistema antes da autenticação', async () => {
        const service = criarService();

        await render(
            <ThemePreferenceProvider service={service} autenticado={false} esquemaDoSistema="dark">
                <LeitorDoTema />
            </ThemePreferenceProvider>
        );

        expect(screen.getByTestId('preferencia')).toHaveTextContent('automatico');

        expect(screen.getByTestId('modo')).toHaveTextContent('escuro');

        expect(service.buscarPreferencia).not.toHaveBeenCalled();
    });

    test('carrega a preferência da conta autenticada', async () => {
        const service = criarService({
            preferencia: 'escuro'
        });

        await render(
            <ThemePreferenceProvider service={service} autenticado esquemaDoSistema="light">
                <LeitorDoTema />
            </ThemePreferenceProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('carregando')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('preferencia')).toHaveTextContent('escuro');

        expect(screen.getByTestId('modo')).toHaveTextContent('escuro');

        expect(screen.getByTestId('fundo')).toHaveTextContent('#181C1A');
    });

    test('aplica imediatamente uma preferência alterada', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        await render(
            <ThemePreferenceProvider service={service} autenticado esquemaDoSistema="light">
                <LeitorDoTema />
            </ThemePreferenceProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('preferencia')).toHaveTextContent('claro');
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Ativar tema escuro'
            })
        );

        await waitFor(() => {
            expect(screen.getByTestId('preferencia')).toHaveTextContent('escuro');
        });

        expect(screen.getByTestId('modo')).toHaveTextContent('escuro');

        expect(service.atualizarPreferencia).toHaveBeenCalledWith('escuro');
    });

    test('reverte o tema quando a persistência falha', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        const erro = new Error('detalhe interno');

        erro.mensagemUsuario = 'Não foi possível salvar o tema.';

        service.atualizarPreferencia.mockRejectedValue(erro);

        await render(
            <ThemePreferenceProvider service={service} autenticado esquemaDoSistema="light">
                <LeitorDoTema />
            </ThemePreferenceProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('carregando')).toHaveTextContent('false');
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Ativar tema escuro'
            })
        );

        await waitFor(() => {
            expect(screen.getByTestId('erro')).toHaveTextContent('Não foi possível salvar o tema.');
        });

        expect(screen.getByTestId('preferencia')).toHaveTextContent('claro');

        expect(screen.getByTestId('modo')).toHaveTextContent('claro');
    });

    test('permite limpar o erro exposto pelo contexto', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        service.atualizarPreferencia.mockRejectedValue(new Error('falha'));

        await render(
            <ThemePreferenceProvider service={service} autenticado esquemaDoSistema="light">
                <LeitorDoTema />
            </ThemePreferenceProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('carregando')).toHaveTextContent('false');
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Ativar tema escuro'
            })
        );

        await waitFor(() => {
            expect(screen.getByTestId('erro')).toBeOnTheScreen();
        });

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Limpar erro'
            })
        );

        expect(screen.queryByTestId('erro')).toBeNull();
    });

    test('rejeita o uso do contexto fora do provider', async () => {
        await expect(render(<ComponenteSemProvider />)).rejects.toThrow(
            'A preferência de tema precisa ser usada dentro de ThemePreferenceProvider.'
        );
    });
});

function ComponenteSemProvider() {
    useThemePreferenceContext();

    return null;
}
