//Traduz as requisições HTTP de anticoncepcionais para operações seguras do service.
function criarContraceptiveController(service) {
    //Cadastra um anticoncepcional para a usuária autenticada.
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

    //Lista somente os anticoncepcionais da usuária autenticada.
    async function listar(requisicao, resposta, proximo) {
        try {
            const anticoncepcionais = await service.listar(requisicao.usuario.id);
            resposta.json({anticoncepcionais});
        } catch (erro) {
            proximo(erro);
        }
    }

    //Edita o anticoncepcional identificado na URL usando somente a identidade da sessão.
    async function editar(requisicao, resposta, proximo) {
        try {
            const anticoncepcional = await service.editar(
                requisicao.usuario.id,
                requisicao.params.id,
                requisicao.body
            );

            resposta.status(200).json({
                mensagem: 'Anticoncepcional atualizado com sucesso.',
                anticoncepcional
            });
        } catch (erro) {
            proximo(erro);
        }
    }

    return {
        cadastrar,
        listar,
        editar
    };
}

export { criarContraceptiveController };