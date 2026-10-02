//Traduz as requisições HTTP de anticoncepcionais para operações seguras do service.
function criarContraceptiveController(service) {
    //Cadastra um anticoncepcional para a usuária autenticada.
    async function cadastrar(requisicao, resposta, proximo) {
        try {
            const anticoncepcional = await service.cadastrar(
                requisicao.usuario.id,
                requisicao.body
            );

            resposta.status(201).json({
                mensagem: 'Anticoncepcional cadastrado com sucesso.',
                anticoncepcional
            });
        } catch (erro) {
            proximo(erro);
        }
    }

    //Lista somente os anticoncepcionais ativos da usuária autenticada.
    async function listar(requisicao, resposta, proximo) {
        try {
            const anticoncepcionais = await service.listar(
                requisicao.usuario.id
            );

            resposta.status(200).json({
                anticoncepcionais
            });
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

    //Remove logicamente o anticoncepcional usando somente a identidade da sessão.
    async function remover(requisicao, resposta, proximo) {
        try {
            await service.remover(
                requisicao.usuario.id,
                requisicao.params.id
            );

            resposta.status(200).json({
                mensagem: 'Anticoncepcional removido com sucesso.'
            });
        } catch (erro) {
            proximo(erro);
        }
    }

    return {
        cadastrar,
        listar,
        editar,
        remover
    };
}

export { criarContraceptiveController };