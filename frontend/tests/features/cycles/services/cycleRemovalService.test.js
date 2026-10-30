import {
    MENSAGEM_SUCESSO,
    criarCycleRemovalService,
    validarCicloId,
    validarData,
    validarResposta
} from '../../../../src/features/cycles/services/cycleRemovalService';

const sucesso = Object.freeze({
    mensagem: MENSAGEM_SUCESSO,
    cicloRemovido: false,
    quantidadeCiclos: 2,
    possuiCiclos: true
});

test('envia exclusão diária autenticada e normaliza os dados', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(sucesso);
    const service = criarCycleRemovalService({ requisicaoAutenticada });
    const signal = new AbortController().signal;
    await expect(service.removerDia({ cicloId: 3, data: '2026-10-12', signal })).resolves.toEqual(
        sucesso
    );
    expect(requisicaoAutenticada).toHaveBeenCalledWith(
        expect.objectContaining({
            metodo: 'DELETE',
            caminho: expect.stringMatching(/3\/days\/2026-10-12$/),
            signal
        })
    );
});

test('envia exclusão completa e mantém ausência de previsão quando não há ciclo', async () => {
    const resposta = { ...sucesso, cicloRemovido: true, quantidadeCiclos: 0, possuiCiclos: false };
    const requisicaoAutenticada = jest.fn().mockResolvedValue(resposta);
    await expect(
        criarCycleRemovalService({ requisicaoAutenticada }).excluirCiclo({ cicloId: '8' })
    ).resolves.toMatchObject({ possuiCiclos: false });
    expect(requisicaoAutenticada).toHaveBeenCalledWith(
        expect.objectContaining({ metodo: 'DELETE', caminho: expect.stringMatching(/8$/) })
    );
});

test('remove dia sem sinal e aceita sinal de cancelamento ao excluir ciclo', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue(sucesso);
    const service = criarCycleRemovalService({ requisicaoAutenticada });
    await service.removerDia({ cicloId: '4', data: '2026-10-04' });
    const signal = new AbortController().signal;
    await service.excluirCiclo({ cicloId: 4, signal });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(
        1,
        expect.not.objectContaining({ signal: expect.anything() })
    );
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, expect.objectContaining({ signal }));
});

test.each([null, undefined, 0, '0', '01', 'abc', Number.MAX_SAFE_INTEGER + 1])(
    'rejeita identificador inválido: %p',
    (valor) => {
        expect(() => validarCicloId(valor)).toThrow(TypeError);
    }
);

test.each(['2026-02-29', '1899-12-31', '2026/01/01', null])(
    'rejeita data inválida: %p',
    (valor) => {
        expect(() => validarData(valor)).toThrow(TypeError);
    }
);

test.each([
    null,
    [],
    { ...sucesso, possuiCiclos: false },
    { ...sucesso, quantidadeCiclos: -1 },
    { ...sucesso, mensagem: 'x' }
])('rejeita envelope inconsistente: %p', (resposta) => {
    expect(() => validarResposta(resposta)).toThrow();
});

test('valida configuração e propaga erros da requisição', async () => {
    expect(() => criarCycleRemovalService()).toThrow();
    const falha = new Error('offline');
    await expect(
        criarCycleRemovalService({
            requisicaoAutenticada: async () => {
                throw falha;
            }
        }).excluirCiclo({ cicloId: 1 })
    ).rejects.toBe(falha);
    const service = criarCycleRemovalService({ requisicaoAutenticada: jest.fn() });
    await expect(service.removerDia()).rejects.toThrow(TypeError);
    await expect(service.excluirCiclo()).rejects.toThrow(TypeError);
});

test('rejeita resposta vazia, arrays e inconsistência entre total e flag', () => {
    expect(() => validarResposta(undefined)).toThrow();
    expect(() => validarResposta([])).toThrow();
    expect(() => validarResposta({ ...sucesso, quantidadeCiclos: 0 })).toThrow();
});
