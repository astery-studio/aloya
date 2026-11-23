const CAMPOS_PERMITIDOS = Object.freeze(['nome', 'dataNascimento', 'senha', 'confirmacaoSenha']);
const REGEX_NOME = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const REGEX_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

function erro(campo, mensagem) {
    return { campo, mensagem };
}

function ehObjetoSimples(valor) {
    if (valor === null || typeof valor !== 'object' || Array.isArray(valor)) return false;
    const prototipo = Object.getPrototypeOf(valor);
    return prototipo === Object.prototype || prototipo === null;
}

function criarDataNascimento(valor, agora) {
    if (typeof valor !== 'string') return null;
    const partes = REGEX_DATA.exec(valor);
    if (!partes) return null;

    const ano = Number(partes[1]);
    const mes = Number(partes[2]);
    const dia = Number(partes[3]);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    const real =
        data.getUTCFullYear() === ano &&
        data.getUTCMonth() === mes - 1 &&
        data.getUTCDate() === dia;

    return real && data <= agora ? data : null;
}

function criarContactRegistrationValidator({ now = () => new Date() } = {}) {
    if (typeof now !== 'function') {
        throw new TypeError('Não foi possível configurar o cadastro de contato.');
    }

    function validar(body) {
        if (!ehObjetoSimples(body)) {
            return {
                valido: false,
                erros: [erro('dados', 'O corpo da requisição deve ser um objeto JSON.')],
                dados: {}
            };
        }

        const erros = [];
        const desconhecidos = Object.keys(body).filter(
            (campo) => !CAMPOS_PERMITIDOS.includes(campo)
        );
        if (desconhecidos.length) {
            erros.push(erro('dados', 'A requisição contém campos não permitidos.'));
        }

        const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
        if (!REGEX_NOME.test(nome) || nome.length > 120) {
            erros.push(erro('nome', 'Informe seu nome completo.'));
        }

        const dataNascimento = criarDataNascimento(body.dataNascimento, now());
        if (!dataNascimento) {
            erros.push(erro('dataNascimento', 'Informe uma data de nascimento válida.'));
        }

        const senha = typeof body.senha === 'string' ? body.senha : '';
        if (senha.length < 8) {
            erros.push(erro('senha', 'A senha deve possuir pelo menos 8 caracteres.'));
        } else if (Buffer.byteLength(senha, 'utf8') > 72) {
            erros.push(erro('senha', 'A senha ultrapassa o tamanho máximo permitido.'));
        }

        if (body.confirmacaoSenha !== senha) {
            erros.push(erro('confirmacaoSenha', 'As senhas não coincidem.'));
        }

        return {
            valido: erros.length === 0,
            erros,
            dados: { nome, dataNascimento, senha }
        };
    }

    return Object.freeze({ validar });
}

export { criarContactRegistrationValidator };
