function comRegistrosPendentes({ service, fila }) {
    return Object.freeze({
        ...service,
        async buscarMes(opcoes) {
            let calendario;
            try {
                calendario = await service.buscarMes(opcoes);
            } catch (erro) {
                if (erro.status || erro.name === 'AbortError') throw erro;
                const pendentes = await fila.listar().catch(() => []);
                if (!pendentes.length) throw erro;
                calendario = {
                    mes: opcoes.mes,
                    possuiCiclos: false,
                    diasMenstruacao: [],
                    previsao: null
                };
            }
            const pendentes = await fila.listar().catch(() => []);
            const datasLocais = [];
            for (const item of pendentes) {
                const inicio = Date.parse(`${item.inicio}T00:00:00Z`);
                const fim = Date.parse(`${item.fim}T00:00:00Z`);
                for (let dia = inicio; dia <= fim; dia += 86400000) {
                    const data = new Date(dia).toISOString().slice(0, 10);
                    if (data.startsWith(opcoes.mes)) datasLocais.push(data);
                }
            }
            return { ...calendario, datasLocais: [...new Set(datasLocais)] };
        }
    });
}
export { comRegistrosPendentes };
