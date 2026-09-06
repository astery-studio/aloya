function criarAuthValidator({ dateUtils }) {
    // Expressão regular para validar nomes contendo letras (incluindo acentuadas), espaços, hífens ou apóstrofos
    const regexNome = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

    // Expressão regular padrão para validação básica da estrutura de um email.
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Função auxiliar para estruturar objetos de erro de validação
    function erro(campo, mensagem) {
        return { campo, mensagem };
    }
}