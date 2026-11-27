export const agora = new Date('2026-11-26T20:00:00Z');
export const aviso = {
    id: 41,
    usuarioId: 1,
    evento: 'ciclo.diario.lembrete',
    dataHoraProgramada: agora,
    expiraEm: new Date('2026-11-27T00:00:00Z')
};

export function banco(dataNascimento, previaDetalhada) {
    return {
        usuario: {
            findUnique: async () => ({
                dataNascimento: new Date(dataNascimento),
                preferenciaNotificacao: { ajustesPorEvento: { previaDetalhada } }
            })
        }
    };
}
