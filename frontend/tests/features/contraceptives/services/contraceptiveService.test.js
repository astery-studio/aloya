//Testa o contrato seguro de listagem, cadastro e edição de anticoncepcionais.
import {
    criarCaminhoAnticoncepcional,
    criarContraceptiveService,
    criarCorpoCadastro,
    normalizarAnticoncepcional
} from '../../../../src/features/contraceptives/services/contraceptiveService';

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

const anticoncepcionalFormulario = {
    id: '7',
    nome: 'Mercilon',
    tipo: 'pilula',
    intensidadeAlerta: 'critico',
    dataValidade: null,
    programacao: {
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25'
    }
};

test('converte a resposta da API para o formato exibido pela tela', () => {
    const resultado = normalizarAnticoncepcional(registroApi);

    expect(resultado.id).toBe('7');
    expect(resultado.programacao).toEqual(expect.objectContaining({
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo'
    }));
    expect(Object.isFrozen(resultado)).toBe(true);
    expect(Object.isFrozen(resultado.programacao)).toBe(true);
    expect(Object.isFrozen(resultado.programacao.horarios)).toBe(true);
});

test('envia somente os campos aceitos pelo backend', () => {
    const corpo = criarCorpoCadastro(anticoncepcionalFormulario);

    expect(corpo).toEqual({
        nome: 'Mercilon',
        tipo: 'pilula',
        intensidadeAlerta: 'critico',
        horarios: ['08:00'],
        frequenciaId: 'pilula_continuo',
        dataPrimeiroUso: '2026-09-25',
        dataValidade: null
    });

    expect(corpo).not.toHaveProperty('id');
    expect(corpo).not.toHaveProperty('usuarioId');
    expect(corpo).not.toHaveProperty('ativo');
    expect(corpo).not.toHaveProperty('removidoEm');
});

test('cria somente caminhos com identificadores inteiros positivos e seguros', () => {
    expect(criarCaminhoAnticoncepcional('7')).toBe('/api/anticoncepcionais/7');
    expect(criarCaminhoAnticoncepcional(8)).toBe('/api/anticoncepcionais/8');
});

test.each([
    undefined,
    null,
    '',
    '0',
    '-1',
    '1abc',
    '../7',
    '7?usuarioId=2',
    '9007199254740992'
])('rejeita o identificador inválido %p antes da requisição', (id) => {
    expect(() => criarCaminhoAnticoncepcional(id)).toThrow('O identificador do anticoncepcional é inválido.');
});

test('lista e cadastra usando a requisição autenticada', async () => {
    const requisicaoAutenticada = jest.fn()
        .mockResolvedValueOnce({ anticoncepcionais: [registroApi] })
        .mockResolvedValueOnce({ anticoncepcional: registroApi });
    const service = criarContraceptiveService({ requisicaoAutenticada });

    await expect(service.listar()).resolves.toHaveLength(1);
    await expect(service.cadastrar(anticoncepcionalFormulario)).resolves.toMatchObject({ id: '7' });

    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(1, {
        caminho: '/api/anticoncepcionais'
    });

    expect(requisicaoAutenticada).toHaveBeenNthCalledWith(2, {
        metodo: 'POST',
        caminho: '/api/anticoncepcionais',
        corpo: {
            nome: 'Mercilon',
            tipo: 'pilula',
            intensidadeAlerta: 'critico',
            horarios: ['08:00'],
            frequenciaId: 'pilula_continuo',
            dataPrimeiroUso: '2026-09-25',
            dataValidade: null
        }
    });
});

test('edita pelo identificador sem enviar campos protegidos', async () => {
    const registroAtualizado = {
        ...registroApi,
        nome: 'Mercilon atualizado',
        intensidadeAlerta: 'moderado'
    };

    const requisicaoAutenticada = jest.fn().mockResolvedValue({
        anticoncepcional: registroAtualizado
    });

    const service = criarContraceptiveService({
        requisicaoAutenticada
    });

    const resultado = await service.editar('7', {
        ...anticoncepcionalFormulario,
        nome: 'Mercilon atualizado',
        intensidadeAlerta: 'moderado',
        usuarioId: 99,
        ativo: false
    });

    expect(resultado).toMatchObject({
        id: '7',
        nome: 'Mercilon atualizado',
        intensidadeAlerta: 'moderado'
    });

    expect(requisicaoAutenticada).toHaveBeenCalledWith({
        metodo: 'PUT',
        caminho: '/api/anticoncepcionais/7',
        corpo: {
            nome: 'Mercilon atualizado',
            tipo: 'pilula',
            intensidadeAlerta: 'moderado',
            horarios: ['08:00'],
            frequenciaId: 'pilula_continuo',
            dataPrimeiroUso: '2026-09-25',
            dataValidade: null
        }
    });
});

test('não acessa a API quando o identificador da edição é inválido', async () => {
    const requisicaoAutenticada = jest.fn();
    const service = criarContraceptiveService({ requisicaoAutenticada });

    await expect(service.editar('../7', anticoncepcionalFormulario)).rejects.toThrow('O identificador do anticoncepcional é inválido.');
    expect(requisicaoAutenticada).not.toHaveBeenCalled();
});