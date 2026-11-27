const chavesDisponiveis = [
    'redeApoio.convites.recebido',
    'redeApoio.convites.acessoAtualizado',
    'redeApoio.ciclo.registro',
    'redeApoio.ciclo.resumo',
    'redeApoio.dicas.apoio',
    'redeApoio.diario.energia',
    'redeApoio.anticoncepcional.horario',
    'redeApoio.anticoncepcional.aplicacoesTrocas'
];

export function criarPreviaPreferenciasContato() {
    let valores = {
        ...Object.fromEntries(chavesDisponiveis.map((chave) => [chave, false])),
        chavesDisponiveis
    };

    return {
        buscar: async () => valores,
        atualizar: async ({ chave, valor }) => {
            valores = { ...valores, [chave]: valor };
            return valores;
        }
    };
}
