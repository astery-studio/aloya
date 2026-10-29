import { cycleParametersReducer, estadoInicial } from '../../../../src/features/cycles/hooks/cycleParametersState';

const parametros = {
    duracaoCicloInformada: 28,
    duracaoMenstruacaoInformada: 5,
    duracaoLuteaInformada: 14
};

test.each([
    ['CARREGAR', { ...estadoInicial, carregando: true, erroCarregamento: false }],
    ['FALHA_CARREGAMENTO', { ...estadoInicial, carregando: false, erroCarregamento: true }],
    ['SALVAR', { ...estadoInicial, salvando: true, erroSalvar: null }],
    ['FALHA_SALVAMENTO', { ...estadoInicial, salvando: false, erroSalvar: 'falha' }],
    ['FECHAR_SUCESSO', { ...estadoInicial, sucesso: false }],
    ['FECHAR_ERRO', { ...estadoInicial, erroSalvar: null }]
])('reduz a ação %s', (tipo, esperado) => {
    expect(cycleParametersReducer(estadoInicial, { tipo, mensagem: 'falha' })).toEqual(esperado);
});

test('carrega, altera e salva parâmetros', () => {
    const carregado = cycleParametersReducer(estadoInicial, { tipo: 'CARREGADO', parametros });
    const alterado = cycleParametersReducer(carregado, { tipo: 'ALTERAR', campo: 'duracaoCicloInformada', valor: 30 });
    const salvo = cycleParametersReducer(alterado, { tipo: 'SALVO', parametros });
    expect(carregado.valores).toBe(parametros);
    expect(alterado.valores.duracaoCicloInformada).toBe(30);
    expect(salvo).toMatchObject({ valores: parametros, valoresIniciais: parametros, salvando: false, sucesso: true });
});

test('ignora ações desconhecidas', () => {
    expect(cycleParametersReducer(estadoInicial, { tipo: 'OUTRA' })).toBe(estadoInicial);
});
