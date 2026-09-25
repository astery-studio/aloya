import { calcularPeriodosPausa } from './contraceptive.schedule.js';
import { apresentarAnticoncepcional } from './contraceptive.presenter.js';
import { validarCadastroAnticoncepcional } from './contraceptive.validator.js';

function criarContraceptiveService(prisma, relogio = () => new Date()) {
    async function cadastrar(usuarioId, entrada) {
        const dados = validarCadastroAnticoncepcional(entrada, relogio());
        const periodosPausa = dados.regraFrequencia
            ? calcularPeriodosPausa(dados.dataPrimeiroUso, dados.regraFrequencia)
            : [];
        const registro = await prisma.anticoncepcional.create({
            data: {
                usuarioId,
                nome: dados.nome,
                tipo: dados.tipo,
                horariosProgramados: dados.horarios,
                frequencia: dados.frequencia,
                dataPrimeiroUso: dados.dataPrimeiroUso,
                periodosPausa,
                dataValidade: dados.dataValidade,
                nivelIntensidadeAlerta: dados.intensidade
            }
        });
        return apresentarAnticoncepcional(registro, relogio());
    }

    async function listar(usuarioId) {
        const registros = await prisma.anticoncepcional.findMany({
            where: { usuarioId },
            orderBy: { criadoEm: 'desc' }
        });
        return registros.map((registro) => apresentarAnticoncepcional(registro, relogio()));
    }

    return { cadastrar, listar };
}

export { criarContraceptiveService };
