import { comRegistrosPendentes } from '../../../../src/features/cycles/services/pendingCalendarService';
import { normalizarMes } from '../../../../src/features/calendar/utils/cycleCalendar.utils';

test('mescla dias locais entre meses sem inventar um identificador de ciclo remoto', async () => {
    const base = {
        mes: '2026-09',
        diasMenstruacao: [{ data: '2026-09-20', registroCicloId: 5 }],
        previsao: null
    };
    const service = { buscarMes: jest.fn().mockResolvedValue(base) };
    const fila = { listar: async () => [{ inicio: '2026-09-29', fim: '2026-10-02' }] };
    const resultado = await comRegistrosPendentes({ service, fila }).buscarMes({ mes: '2026-09' });
    expect(resultado.diasMenstruacao).toEqual(base.diasMenstruacao);
    expect(resultado.datasLocais).toEqual(['2026-09-29', '2026-09-30']);
    const dias = normalizarMes(resultado, '2026-10-30').semanas.flat().filter(Boolean);
    expect(dias.find((dia) => dia.data === '2026-09-29')).toMatchObject({
        tipo: 'menstruacao',
        local: true,
        registroCicloId: null,
        previsto: false
    });
    expect(dias.find((dia) => dia.data === '2026-09-28').tipo).toBeNull();
    expect(dias.find((dia) => dia.data === '2026-09-20').registroCicloId).toBe(5);
});

test('offline mantém a marcação visível sem esconder erro de autenticação ou cancelamento', async () => {
    const erroRede = new Error('offline');
    const service = { buscarMes: jest.fn().mockRejectedValue(erroRede) };
    const fila = {
        listar: jest.fn().mockResolvedValue([{ inicio: '2026-09-01', fim: '2026-09-01' }])
    };
    const calendario = comRegistrosPendentes({ service, fila });
    expect((await calendario.buscarMes({ mes: '2026-09' })).datasLocais).toEqual(['2026-09-01']);
    fila.listar.mockResolvedValue([]);
    await expect(calendario.buscarMes({ mes: '2026-09' })).rejects.toBe(erroRede);
    for (const erro of [
        Object.assign(new Error(), { status: 401 }),
        Object.assign(new Error(), { name: 'AbortError' })
    ]) {
        service.buscarMes.mockRejectedValue(erro);
        await expect(calendario.buscarMes({ mes: '2026-09' })).rejects.toBe(erro);
    }
});

test('falha de leitura local não impede a consulta dos dados remotos', async () => {
    const service = {
        buscarMes: async () => ({ mes: '2026-09', diasMenstruacao: [], previsao: null })
    };
    const fila = {
        listar: async () => {
            throw new Error('armazenamento');
        }
    };
    expect(
        (await comRegistrosPendentes({ service, fila }).buscarMes({ mes: '2026-09' })).datasLocais
    ).toEqual([]);
});
