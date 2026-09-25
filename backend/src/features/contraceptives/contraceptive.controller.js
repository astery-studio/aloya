function criarContraceptiveController(service) {
    async function cadastrar(requisicao, resposta, proximo) {
        try {
            const anticoncepcional = await service.cadastrar(requisicao.usuario.id, requisicao.body);
            resposta.status(201).json({
                mensagem: 'Anticoncepcional cadastrado com sucesso.',
                anticoncepcional
            });
        } catch (erro) {
            proximo(erro);
        }
    }

    async function listar(requisicao, resposta, proximo) {
        try {
            const anticoncepcionais = await service.listar(requisicao.usuario.id);
            resposta.json({ anticoncepcionais });
        } catch (erro) {
            proximo(erro);
        }
    }

    return { cadastrar, listar };
}

export { criarContraceptiveController };
