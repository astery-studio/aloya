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

        // Valida e formata a data de nascimento utilizando o utilitário de datas.
        const dataNascimento =
        dateUtils.criarDataValida(body.dataNascimento);

        // Calcula a idade do usuário com base na data de nascimento informada.
        const idade = dateUtils.calcularIdade(
        body.dataNascimento
        );

        // Valida se a data de nascimento é real, não está no futuro e não resulta em idade negativa.
        if (
        !dataNascimento ||
        dataNascimento > hoje ||
        idade === null ||
        idade < 0
        ) {
        erros.push(
            erro(
            'dataNascimento',
            'Informe uma data de nascimento válida.'
            )
        );
        }

        // Normaliza o e-mail removendo espaços e convertendo para minúsculas
        const email = typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : '';

        // Valida o formato e o tamanho máximo permitido para o e-mail.
        if (!regexEmail.test(email) || email.length > 254) {
        erros.push(
            erro('email', 'Informe um e-mail válido.')
        );
        }

        // Valida que a senha foi informada
        if (
        typeof body.senha !== 'string' ||
        body.senha.length === 0
        ) {
        erros.push(
            erro(
            'senha',
            'Informe uma senha.'
            )
        );
        }

        // Valida a data de início da última menstruação informada no cadastro.
        const dataInicioUltimaMenstruacao =
        dateUtils.criarDataValida(
            body.dataInicioUltimaMenstruacao
        );

        // Impede que a data de início da menstruação seja inválida ou situada no futuro.
        if (
        !dataInicioUltimaMenstruacao ||
        dataInicioUltimaMenstruacao > hoje
        ) {
        erros.push(
            erro(
            'dataInicioUltimaMenstruacao',
            'Informe a data de início da sua última menstruação (não pode ser no futuro).'
            )
        );
        }

        // Valida opcionalmente a data de término da última menstruação, caso tenha sido cadastrada.
        const dataFimUltimaMenstruacao =
        body.dataFimUltimaMenstruacao
            ? dateUtils.criarDataValida(
                body.dataFimUltimaMenstruacao
            )
            : null;

        // Garante que a data de término seja coerente (não anterior ao início e nem no futuro).
        if (
        body.dataFimUltimaMenstruacao &&
        (
            !dataFimUltimaMenstruacao ||
            dataFimUltimaMenstruacao < dataInicioUltimaMenstruacao ||
            dataFimUltimaMenstruacao > hoje
        )
        ) {
        erros.push(
            erro(
            'dataFimUltimaMenstruacao',
            'Informe uma data de término válida.'
            )
        );
        }
    }
}