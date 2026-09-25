class AppError extends Error {
    constructor(mensagem, status = 400, codigo = 'REQUISICAO_INVALIDA') {
        super(mensagem);
        this.name = 'AppError';
        this.status = status;
        this.codigo = codigo;
    }
}

export { AppError };
