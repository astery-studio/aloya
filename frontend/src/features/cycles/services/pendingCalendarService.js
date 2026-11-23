function* diasDoIntervalo({ inicio, fim }) {
    const primeiroDia = Date.parse(inicio + 'T00:00:00Z');
    const ultimoDia = Date.parse(fim + 'T00:00:00Z');
    for (let dia = primeiroDia; dia <= ultimoDia; dia += 86400000) {
        yield new Date(dia).toISOString().slice(0, 10);
    }
}

async function registroJaConfirmado({ service, inicio, fim, validarCredencial }) {
    const dias = [...diasDoIntervalo({ inicio, fim })];
    if (!dias.length) return false;

    const meses = new Set(dias.map((data) => data.slice(0, 7)));
    const calendarios = await Promise.all(
        [...meses].map((mes) => service.buscarMes({ mes, validarCredencial }))
    );
    const confirmadas = new Set(
        calendarios.flatMap((mes) => mes.diasMenstruacao.map((dia) => dia.data))
    );
    return dias.every((data) => confirmadas.has(data));
}

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
                for (const data of diasDoIntervalo(item)) {
                    if (data.startsWith(opcoes.mes)) datasLocais.push(data);
                }
            }
            return { ...calendario, datasLocais: [...new Set(datasLocais)] };
        }
    });
}
export { comRegistrosPendentes, registroJaConfirmado };
