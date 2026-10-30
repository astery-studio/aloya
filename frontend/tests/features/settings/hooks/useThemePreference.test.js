import { act, renderHook, waitFor } from '@testing-library/react-native';

import {
    MENSAGEM_CONFIGURACAO_TEMA,
    MENSAGEM_ERRO_CARREGAR_TEMA,
    useThemePreference
} from '../../../../src/features/settings/hooks/useThemePreference';
import { MENSAGEM_ERRO_TEMA } from '../../../../src/features/settings/services/themePreferenceService';

function criarService({ preferencia = 'automatico' } = {}) {
    return {
        buscarPreferencia: jest.fn().mockResolvedValue(preferencia),
        atualizarPreferencia: jest
            .fn()
            .mockImplementation(async (novaPreferencia) => novaPreferencia)
    };
}

function criarPromessaControlada() {
    let resolver;
    let rejeitar;

    const promessa = new Promise((resolve, reject) => {
        resolver = resolve;
        rejeitar = reject;
    });

    return {
        promessa,
        resolver,
        rejeitar
    };
}

describe('useThemePreference', () => {
    test('começa no modo automático sem consultar a API quando não está autenticado', async () => {
        const service = criarService();

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: false
            })
        );

        expect(result.current).toMatchObject({
            preferencia: 'automatico',
            carregando: false,
            salvando: false,
            erro: null
        });

        expect(service.buscarPreferencia).not.toHaveBeenCalled();
    });

    test('aceita uma preferência inicial válida', async () => {
        const { result } = await renderHook(() =>
            useThemePreference({
                autenticado: false,
                preferenciaInicial: 'escuro'
            })
        );

        expect(result.current.preferencia).toBe('escuro');
    });

    test('usa automático quando a preferência inicial é inválida', async () => {
        const { result } = await renderHook(() =>
            useThemePreference({
                autenticado: false,
                preferenciaInicial: 'dark'
            })
        );

        expect(result.current.preferencia).toBe('automatico');
    });

    test('carrega a preferência persistida da conta autenticada', async () => {
        const service = criarService({
            preferencia: 'escuro'
        });

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(result.current.preferencia).toBe('escuro');

        expect(service.buscarPreferencia).toHaveBeenCalledTimes(1);

        expect(service.buscarPreferencia).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal)
        });
    });

    test('mostra erro amigável quando a preferência não pode ser carregada', async () => {
        const service = criarService();

        service.buscarPreferencia.mockRejectedValue(new Error('detalhe interno'));

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(result.current.erro).toBe(MENSAGEM_ERRO_CARREGAR_TEMA);
    });

    test('preserva uma mensagem segura informada pelo serviço', async () => {
        const service = criarService();
        const erro = new Error('falha');

        erro.mensagemUsuario = 'Mensagem segura da API.';

        service.buscarPreferencia.mockRejectedValue(erro);

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(result.current.erro).toBe('Mensagem segura da API.');
    });

    test('informa erro de configuração sem serviço válido', async () => {
        const { result } = await renderHook(() =>
            useThemePreference({
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        expect(result.current.erro).toBe(MENSAGEM_CONFIGURACAO_TEMA);
    });

    test('aplica imediatamente a nova preferência e confirma após salvar', async () => {
        const alteracao = criarPromessaControlada();

        const service = criarService({
            preferencia: 'claro'
        });

        service.atualizarPreferencia.mockReturnValue(alteracao.promessa);

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        let operacao;

        await act(() => {
            operacao = result.current.alterarPreferencia('escuro');
        });

        expect(result.current).toMatchObject({
            preferencia: 'escuro',
            salvando: true,
            erro: null
        });

        await act(async () => {
            alteracao.resolver('escuro');
            await operacao;
        });

        expect(result.current).toMatchObject({
            preferencia: 'escuro',
            salvando: false,
            erro: null
        });

        expect(service.atualizarPreferencia).toHaveBeenCalledWith('escuro');
    });

    test('reverte para a preferência anterior quando a atualização falha', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        service.atualizarPreferencia.mockRejectedValue(new Error('detalhe interno'));

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.preferencia).toBe('claro');
        });

        let sucesso;

        await act(async () => {
            sucesso = await result.current.alterarPreferencia('escuro');
        });

        expect(sucesso).toBe(false);

        expect(result.current).toMatchObject({
            preferencia: 'claro',
            salvando: false,
            erro: MENSAGEM_ERRO_TEMA
        });
    });

    test('usa a mensagem segura da falha de atualização', async () => {
        const service = criarService({
            preferencia: 'claro'
        });

        const erro = new Error('detalhe');

        erro.mensagemUsuario = 'Não foi possível salvar o tema.';

        service.atualizarPreferencia.mockRejectedValue(erro);

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        await act(async () => {
            await result.current.alterarPreferencia('escuro');
        });

        expect(result.current.erro).toBe('Não foi possível salvar o tema.');

        expect(result.current.preferencia).toBe('claro');
    });

    test('não envia uma alteração quando a preferência permanece igual', async () => {
        const service = criarService({
            preferencia: 'escuro'
        });

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.preferencia).toBe('escuro');
        });

        let sucesso;

        await act(async () => {
            sucesso = await result.current.alterarPreferencia('escuro');
        });

        expect(sucesso).toBe(true);

        expect(service.atualizarPreferencia).not.toHaveBeenCalled();
    });

    test('impede duas alterações simultâneas', async () => {
        const alteracao = criarPromessaControlada();

        const service = criarService({
            preferencia: 'claro'
        });

        service.atualizarPreferencia.mockReturnValue(alteracao.promessa);

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.carregando).toBe(false);
        });

        let primeiraOperacao;
        let segundaOperacao;

        await act(() => {
            primeiraOperacao = result.current.alterarPreferencia('escuro');

            segundaOperacao = result.current.alterarPreferencia('automatico');
        });

        await expect(segundaOperacao).resolves.toBe(false);

        expect(service.atualizarPreferencia).toHaveBeenCalledTimes(1);

        await act(async () => {
            alteracao.resolver('escuro');
            await primeiraOperacao;
        });
    });

    test('permite limpar a mensagem de erro', async () => {
        const service = criarService();

        service.buscarPreferencia.mockRejectedValue(new Error('falha'));

        const { result } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(result.current.erro).not.toBeNull();
        });

        await act(() => {
            result.current.limparErro();
        });

        expect(result.current.erro).toBeNull();
    });

    test('cancela a busca quando o componente é desmontado', async () => {
        let sinalRecebido;

        const service = criarService();

        service.buscarPreferencia.mockImplementation(({ signal }) => {
            sinalRecebido = signal;

            return new Promise(() => {});
        });

        const { unmount } = await renderHook(() =>
            useThemePreference({
                service,
                autenticado: true
            })
        );

        await waitFor(() => {
            expect(sinalRecebido).toBeDefined();
        });

        await unmount();

        expect(sinalRecebido.aborted).toBe(true);
    });
});
