function criarAuthValidator({ dateUtils }) {
    // Expressão regular para validar nomes contendo letras (incluindo acentuadas), espaços, hífens ou apóstrofos
    const regexNome = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

    // Expressão regular padrão para validação básica da estrutura de um email.
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Função auxiliar para estruturar objetos de erro de validação
    function erro(campo, mensagem) {
        return { campo, mensagem };
    }

    // Função auxiliar para validar e converter parâmetros numéricos opcionais, garantindo que sejam inteiros estritamente positivos.
    function inteiroPositivo(valor, campo, erros) {
        if (valor === undefined || valor === null || valor === '') {
        return null;
        }

        if (!Number.isInteger(valor) || valor <= 0) {
        erros.push(
            erro(campo, 'Informe um número inteiro positivo.')
        );

        return null;
        }

        return valor;
    }

    // Função principal responsável por validar todos os campos enviados no corpo da requisição de cadastro 
    function validarCadastro(body) {
        const erros = [];
        const hoje = new Date();

        // Limpa e normaliza o nome enviado, removendo espaços excedentes.
        const nome = typeof body.nome === 'string'
        ? body.nome.trim().replace(/\s+/g, ' ')
        : '';

        // Valida as restrições de comprimento e caracteres permitidos para o nome.
        if (nome.length < 3) {
        erros.push(
            erro('nome', 'O nome deve ter pelo menos 3 caracteres.')
        );
        } else if (nome.length > 120 || !regexNome.test(nome)) {
        erros.push(
            erro(
            'nome',
            'O nome deve conter apenas letras, espaços, apóstrofos ou hífens.'
            )
        );
        }
    }
}