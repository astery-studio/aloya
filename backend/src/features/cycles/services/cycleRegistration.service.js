import { validarRegistroMenstrual } from '../validators/cycleRegistration.validator.js';

function criarCycleRegistrationService({ repository, agora = () => new Date() }) {
    if (typeof repository?.registrar !== 'function' || typeof agora !== 'function')
        throw new TypeError('Serviço de registro menstrual inválido.');
    async function registrar(argumentos = {}) {
        const instante = agora();
        const dados = validarRegistroMenstrual({ ...argumentos, agora: instante });
        return repository.registrar({ ...dados, agora: instante });
    }
    return { registrar };
}

export { criarCycleRegistrationService };
