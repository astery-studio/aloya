import { criarMenstruationSyncQueue } from '../../../../src/features/cycles/services/menstruationSyncQueue';
import { obterIdentidadeMenstrual } from '../../../../src/features/cycles/services/menstruationIdentity';
import { selecionarIntervalo } from '../../../../src/features/cycles/utils/menstruationSelection';
import { criarCycleRegistrationService } from '../../../../src/features/cycles/services/cycleRegistrationService';

function montar() {
    const dados = new Map();
    let identidade = '1';
    let indice = 0;
    const registrar = jest.fn().mockResolvedValue({});
    const salvar = jest.fn(async (chave, valor) => dados.set(chave, valor));
    const opcoes = {
        ler: async (chave) => dados.get(chave),
        salvar,
        registrar,
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
