import {
    criarContraceptiveService,
    criarCorpoUso,
    normalizarAnticoncepcional
} from '../../../../src/features/contraceptives/services/contraceptiveService';

const confirmadoEm = new Date(2026, 8, 4, 9, 32).toISOString();
const registroApi = {
    id: 7, nome: 'Evra', tipo: 'adesivo', intensidadeAlerta: 'leve', horarios: ['09:30'],
    frequenciaId: 'adesivo_3_1', dataPrimeiroUso: '2026-09-01', dataValidade: null,
    ativo: false, removidoEm: '2026-09-06T12:00:00Z',
    usosHoje: [],
    historico: [{ id: 8, data: '2026-09-04', horarioProgramado: '09:30', confirmadoEm, estado: 'confirmado' }]
};

test('a HU-019 opta pelos removidos sem alterar o caminho padrão de listagem', async () => {
    const signal = new AbortController().signal;
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ anticoncepcionais: [registroApi] });
    const service = criarContraceptiveService({ requisicaoAutenticada });
    await service.listar();
    const resultado = await service.listar({ signal, incluirRemovidos: true });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, { caminho: '/api/anticoncepcionais' });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, { caminho: '/api/anticoncepcionais?incluirRemovidos=true', signal });
    expect(resultado[0]).toMatchObject({ id: '7', ativo: false, removido: true, historico: [{ id: '8', horarioConfirmacao: '09:32' }] });
});

test('envia o fuso explícito codificado, sem adicionar fuso automático aos consumidores legados', async () => {
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ anticoncepcionais: [] });
    const service = criarContraceptiveService({ requisicaoAutenticada });
    await service.listar({ fusoHorario: 'America/Sao_Paulo', incluirRemovidos: true });
    await service.listar({ fusoHorario: 'America/Sao_Paulo' });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, { caminho: '/api/anticoncepcionais?incluirRemovidos=true&fusoHorario=America%2FSao_Paulo' });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, { caminho: '/api/anticoncepcionais?fusoHorario=America%2FSao_Paulo' });
});

test('o normalizador legado e respostas de cadastro/edição não ganham campos do acompanhamento', async () => {
    const legado = normalizarAnticoncepcional(registroApi);
    expect(legado).not.toHaveProperty('historico');
    expect(legado).not.toHaveProperty('usosHoje');
    expect(legado).not.toHaveProperty('removido');
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ anticoncepcional: registroApi });
    const service = criarContraceptiveService({ requisicaoAutenticada });
    expect(await service.cadastrar(legado)).toEqual(legado);
    expect(await service.editar('7', legado)).toEqual(legado);
});

test.each([true, false])('atualiza somente a data e horário escolhidos: confirmar=%s', async (confirmar) => {
    const uso = { id: 8, data: '2026-09-04', horario: '09:30', status: confirmar ? 'confirmado' : 'pendente', confirmadoEm: confirmar ? confirmadoEm : null, confirmacaoForaPrazo: false };
    const requisicaoAutenticada = jest.fn().mockResolvedValue({ uso });
    const service = criarContraceptiveService({ requisicaoAutenticada });
    const resultado = await service.alternarUso({ anticoncepcionalId: '7', data: '2026-09-04', horario: '09:30', confirmar, usuarioId: 99, confirmadoEm: 'não-confiável' });
    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        metodo: 'PUT', caminho: '/api/anticoncepcionais/7/usos', corpo: { data: '2026-09-04', horario: '09:30', confirmar }
    });
    expect(resultado.uso).toMatchObject({ id: '8', status: uso.status, horarioConfirmacao: confirmar ? '09:32' : null });
    expect(Object.isFrozen(resultado)).toBe(true);
    expect(Object.isFrozen(resultado.uso)).toBe(true);
});

test('o uso recebe fuso explícito somente quando fornecido pelo consumidor HU-023', () => {
    expect(criarCorpoUso({ data: '2026-09-04', horario: '09:30', confirmar: true, fusoHorario: 'America/Sao_Paulo' })).toEqual({
        data: '2026-09-04', horario: '09:30', confirmar: true, fusoHorario: 'America/Sao_Paulo'
    });
});

test.each([
    { anticoncepcionalId: '../7', data: '2026-09-04', horario: '09:30', confirmar: true },
    { anticoncepcionalId: '7', data: '04/09/2026', horario: '09:30', confirmar: true },
    { anticoncepcionalId: '7', data: '2026-02-30', horario: '09:30', confirmar: true },
    { anticoncepcionalId: '7', data: '2026-09-04', horario: '25:90', confirmar: true },
    { anticoncepcionalId: '7', data: '2026-09-04', horario: '9:30', confirmar: true },
    { anticoncepcionalId: '7', data: '2026-09-04', horario: '09:30', confirmar: 'true' },
    { anticoncepcionalId: '7', data: '2026-09-04', horario: '09:30', confirmar: true, fusoHorario: null }
])('rejeita o uso inválido sem enviar uma marcação falsa: %p', async (dados) => {
    const requisicaoAutenticada = jest.fn();
    const service = criarContraceptiveService({ requisicaoAutenticada });
    await expect(service.alternarUso(dados)).rejects.toThrow();
    expect(requisicaoAutenticada).not.toHaveBeenCalled();
});

test('propaga falhas de rede e não transforma ausência de retorno em confirmação local', async () => {
    const falha = new Error('Falha de rede');
    const requisicaoAutenticada = jest.fn().mockRejectedValueOnce(falha).mockResolvedValueOnce({});
    const service = criarContraceptiveService({ requisicaoAutenticada });
    const dados = { anticoncepcionalId: 7, data: '2026-09-04', horario: '09:30', confirmar: true };
    await expect(service.alternarUso(dados)).rejects.toBe(falha);
    await expect(service.alternarUso(dados)).rejects.toThrow('Não foi possível atualizar o uso do anticoncepcional.');
});
