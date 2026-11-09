import { criarMenstruationSyncQueue } from '../../../../src/features/cycles/services/menstruationSyncQueue';
import { obterIdentidadeMenstrual } from '../../../../src/features/cycles/services/menstruationIdentity';
import { selecionarIntervalo } from '../../../../src/features/cycles/utils/menstruationSelection';
import { criarCycleRegistrationService } from '../../../../src/features/cycles/services/cycleRegistrationService';

import { registroJaConfirmado } from '../../../../src/features/cycles/services/pendingCalendarService';

function montar(jaConfirmado) {
    const dados = new Map();
    let identidade = '1';
    let indice = 0;
    const registrar = jest.fn().mockResolvedValue({});
    const salvar = jest.fn(async (chave, valor) => dados.set(chave, valor));
    const opcoes = {
        ler: async (chave) => dados.get(chave),
        salvar,
        registrar,
        jaConfirmado,
        identificar: async () => identidade,
        criarChave: () => `operacao-${++indice}`
    };
    return {
        fila: criarMenstruationSyncQueue(opcoes),
        registrar,
        salvar,
        dados,
        recriar: () => criarMenstruationSyncQueue(opcoes),
        trocar: (id) => {
            identidade = id;
        }
    };
}

test('salva antes de sincronizar e conserva chave e marcação após reiniciar e falhar', async () => {
    const c = montar();
    const item = await c.fila.adicionar('2026-09-01', '2026-09-03');
    expect(c.registrar).not.toHaveBeenCalled();
    c.registrar.mockRejectedValueOnce(new Error('offline'));
    await expect(c.recriar().sincronizar()).rejects.toThrow('offline');
    expect(await c.fila.listar()).toEqual([{ ...item, status: 'falha' }]);
    await c.fila.sincronizar();
    expect(c.registrar.mock.calls[1][0].chave).toBe(item.chave);
    expect(await c.fila.listar()).toEqual([]);
});

test('separa contas, serializa gravações simultâneas e evita duplicação de intervalo', async () => {
    const c = montar();
    await Promise.all([
        c.fila.adicionar('2026-09-01', '2026-09-01'),
        c.fila.adicionar('2026-09-02', '2026-09-02')
    ]);
    expect(await c.fila.listar()).toHaveLength(2);
    await c.fila.adicionar('2026-09-01', '2026-09-01');
    expect(await c.fila.listar()).toHaveLength(2);
    c.trocar('2');
    expect(await c.fila.listar()).toEqual([]);
    await c.fila.sincronizar();
    expect(c.registrar).not.toHaveBeenCalled();
    c.trocar('1');
    expect(await c.fila.listar()).toHaveLength(2);
});

test('não perde operação se persistência falhar depois da confirmação remota', async () => {
    const c = montar();
    await c.fila.adicionar('2026-09-01', '2026-09-01');
    c.salvar.mockRejectedValueOnce(new Error('armazenamento'));
    await expect(c.fila.sincronizar()).rejects.toThrow('armazenamento');
    expect(await c.fila.listar()).toHaveLength(1);
    await c.fila.sincronizar();
    expect(c.registrar.mock.calls[0][0].chave).toBe(c.registrar.mock.calls[1][0].chave);
});

test('interrompe após trocar a sessão e recusa conta ausente', async () => {
    const c = montar();
    await c.fila.adicionar('2026-09-01', '2026-09-01');
    c.registrar.mockImplementationOnce(async () => c.trocar('2'));
    await expect(c.fila.sincronizar()).rejects.toThrow('sessão');
    c.trocar('1');
    expect(await c.fila.listar()).toHaveLength(1);
    c.trocar(null);
    await expect(c.fila.listar()).rejects.toThrow('Entre novamente');
});

test('seleciona dias consecutivos inclusive na virada do mês e em ano bissexto', () => {
    expect(selecionarIntervalo(['2024-03-01'], '2024-02-28', '2026-10-30')).toEqual([
        '2024-02-28',
        '2024-02-29',
        '2024-03-01'
    ]);
    expect(selecionarIntervalo([], '2026-10-30', '2026-10-30')).toEqual(['2026-10-30']);
    expect(selecionarIntervalo(['2026-10-30'], '2026-10-30', '2026-10-30')).toEqual([]);
    for (const data of ['2026-02-30', '2026-10-31', 'erro'])
        expect(selecionarIntervalo([], data, '2026-10-30')).toEqual([]);
    expect(selecionarIntervalo(['2024-01-01'], '2026-01-01', '2026-10-30')).toEqual(['2024-01-01']);
});

test('identifica escopo local pelo subject sem usar essa leitura como autorização', () => {
    const token = 'x.eyJzdWIiOiIxMiIsInBhcGVsIjoidGl0dWxhciJ9.x';
    expect(obterIdentidadeMenstrual({ token })).toBe('12');
    for (const sessao of [null, {}, { token: 'x.!.x' }, { token: 'x.e30.x' }])
        expect(obterIdentidadeMenstrual(sessao)).toBeNull();
});

test('envia data única e intervalo com a mesma chave de idempotência', async () => {
    const requisicaoAutenticada = jest.fn();
    const service = criarCycleRegistrationService({ requisicaoAutenticada });
    await service.registrar({ inicio: '2026-09-01', fim: '2026-09-01', chave: 'operacao-1' });
    expect(requisicaoAutenticada).toHaveBeenLastCalledWith(
        expect.objectContaining({ corpo: { data: '2026-09-01' }, chaveIdempotencia: 'operacao-1' })
    );
    await service.registrar({ inicio: '2026-09-01', fim: '2026-09-03', chave: 'operacao-2' });
    expect(requisicaoAutenticada).toHaveBeenLastCalledWith(
        expect.objectContaining({ corpo: { dataInicio: '2026-09-01', dataFim: '2026-09-03' } })
    );
});

test.each([true, false])(
    'após conflito, remove da fila somente se todos os dias estão confirmados (%s)',
    async (completo) => {
        const service = {
            buscarMes: jest.fn(async ({ mes }) => ({
                diasMenstruacao:
                    mes === '2026-10'
                        ? [{ data: '2026-10-31', registroCicloId: 8 }]
                        : completo
                          ? [{ data: '2026-11-01', registroCicloId: 8 }]
                          : [],
                datasLocais: ['2026-11-01']
            }))
        };
        const c = montar(({ inicio, fim }) => registroJaConfirmado({ service, inicio, fim }));
        await c.fila.adicionar('2026-10-31', '2026-11-01');
        const conflito = Object.assign(new Error('Período em conflito'), {
            status: 409,
            codigo: 'CONFLITO_REGISTRO_MENSTRUAL'
        });
        c.registrar.mockRejectedValueOnce(conflito);
        if (completo) {
            await c.fila.adicionar('2026-11-04', '2026-11-04');
            await c.fila.sincronizar();
            expect(c.registrar).toHaveBeenCalledTimes(2);
            expect(await c.fila.listar()).toEqual([]);
        } else {
            await expect(c.fila.sincronizar()).rejects.toBe(conflito);
            expect(await c.fila.listar()).toEqual([
                expect.objectContaining({
                    inicio: '2026-10-31',
                    fim: '2026-11-01',
                    status: 'falha'
                })
            ]);
        }
        expect(service.buscarMes.mock.calls.map(([pedido]) => pedido.mes)).toEqual([
            '2026-10',
            '2026-11'
        ]);
    }
);
