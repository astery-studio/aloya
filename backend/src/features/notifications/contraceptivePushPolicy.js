import { lerJanelasDeUso } from '../contraceptives/services/contraceptiveUsage.service.js';

export function lerPoliticaDeAlertas(
    entrada = process.env.PUSH_ANTICONCEPCIONAL_REENVIOS,
    janelas = lerJanelasDeUso()
) {
    const configuracao = entrada ? JSON.parse(entrada) : {};
    if (!configuracao || typeof configuracao !== 'object' || Array.isArray(configuracao)) {
        throw new Error(
            'PUSH_ANTICONCEPCIONAL_REENVIOS precisa ser um objeto por método cadastrado.'
        );
    }

    const fases = ['aviso', 'moderados', 'criticos'];
    const politicas = new Map();
    for (const [id, regras] of Object.entries(configuracao)) {
        const janela = janelas[id];
        if (
            !Number.isSafeInteger(janela) ||
            janela <= 0 ||
            !regras ||
            typeof regras !== 'object' ||
            Array.isArray(regras) ||
            Object.keys(regras).some((fase) => !fases.includes(fase))
        ) {
            throw new Error('Política de reenvios sem janela de uso ou com campos inválidos.');
        }
        const eventos = fases.flatMap((fase) => {
            const minutos = regras[fase] ?? [];
            if (
                !Array.isArray(minutos) ||
                minutos.some(
                    (valor) => !Number.isSafeInteger(valor) || valor <= 0 || valor >= janela
                )
            ) {
                throw new Error('O atraso deve estar dentro da janela de uso configurada.');
            }
            return minutos.map((atraso) => ({ fase, atraso }));
        });
        if (eventos.some(({ atraso }, i) => i > 0 && atraso <= eventos[i - 1].atraso)) {
            throw new Error('A política precisa ter atrasos estritamente crescentes.');
        }
        politicas.set(Number(id), [...eventos, { fase: 'fimJanela', atraso: janela }]);
    }
    return politicas;
}
