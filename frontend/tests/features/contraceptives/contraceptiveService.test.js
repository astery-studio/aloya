import {
    criarContraceptiveService,
    criarCorpoCadastro,
    normalizarAnticoncepcional
} from '../../../features/contraceptives/services/contraceptiveService';

const registroApi = {
    id: 7,
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    horarios: ['08:00'],
    frequenciaId: 'pilula_continuo',
    dataPrimeiroUso: '2026-09-25',
    dataValidade: null,
    periodosPausa: [],
    proximoUsoPrevisto: '2026-09-25T08:00:00.000Z'
};

test('converte a resposta da API para o formato exibido pela tela', () => {
    const resultado = normalizarAnticoncepcional(registroApi);

    expect(resultado.id).toBe('7');
    expect(resultado.programacao).toEqual(expect.objectContaining({
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo'
    }));
});

test('envia somente os campos aceitos pelo backend', () => {
    const corpo = criarCorpoCadastro({
        id: 'local',
        nome: 'Mercilon',
        tipo: 'pilula',
        intensidadeAlerta: 'critico',
        dataValidade: null,
        programacao: {
            horarios: ['08:00'],
            frequenciaId: 'pilula_continuo',
            dataPrimeiroUso: '2026-09-25'
        }
    });

    expect(corpo).toEqual({
        nome: 'Mercilon',
        tipo: 'pilula',
        intensidadeAlerta: 'critico',
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25',
        dataValidade: null
    });
});

test('lista e cadastra usando a requisição autenticada', async () => {
    const requisicaoAutenticada = jest.fn()
        .mockResolvedValueOnce({ anticoncepcionais: [registroApi] })
        .mockResolvedValueOnce({ anticoncepcional: registroApi });
    const service = criarContraceptiveService({ requisicaoAutenticada });

    await expect(service.listar()).resolves.toHaveLength(1);
    await expect(service.cadastrar({
        nome: 'Mercilon', tipo: 'pilula', intensidadeAlerta: 'critico',
        programacao: { horarios: ['08:00'], frequenciaId: 'pilula_continuo' }
    })).resolves.toMatchObject({ id: '7' });

    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, {
        caminho: '/api/anticoncepcionais'
    });
    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, expect.objectContaining({
        metodo: 'POST',
        caminho: '/api/anticoncepcionais'
    }));
});
