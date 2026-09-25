import { criarProgramacao } from './ContraceptiveSchedule';

function criarAnticoncepcional(dados, frequencia) {
    return Object.freeze({
        id: dados.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nome: dados.nome.trim(),
        tipo: dados.tipo,
        intensidadeAlerta: dados.intensidadeAlerta || 'critico',
        dataValidade: dados.tipo === 'diu_hormonal' ? dados.dataValidade : null,
        programacao: dados.tipo === 'diu_hormonal' ? null : criarProgramacao({
            horarios: dados.horarios,
            frequencia,
            dataPrimeiroUso: dados.dataPrimeiroUso
        })
    });
}

export { criarAnticoncepcional };
