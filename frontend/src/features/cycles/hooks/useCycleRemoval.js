import { useCallback, useRef, useState } from 'react';

const MENSAGEM_SUCESSO = 'Registro de menstruação excluído com sucesso.';
const MENSAGEM_ERRO = 'Não foi possível excluir o registro de menstruação. Tente novamente.';
const MENSAGEM_ATUALIZACAO =
    'O registro foi excluído, mas não foi possível atualizar a tela. Tente atualizar novamente.';

function validarService(service) {
    if (!service || typeof service !== 'object') {
        throw new Error('Não foi possível configurar a remoção de ciclos.');
    }
}

function obterMensagemErro(falha) {
    if (typeof falha?.mensagemUsuario === 'string' && falha.mensagemUsuario.trim()) {
        return falha.mensagemUsuario;
    }

    if (typeof falha?.message === 'string' && falha.message.trim()) {
        return falha.message;
    }

    return MENSAGEM_ERRO;
}

function useCycleRemoval({ service, aoAtualizar, onSessaoExpirada } = {}) {
    validarService(service);

    const [operacao, setOperacao] = useState(null);
    const [erro, setErro] = useState(null);
    const [erroAtualizacao, setErroAtualizacao] = useState(null);
    const [sucesso, setSucesso] = useState(null);
    const operacaoAtual = useRef(null);

    const executar = useCallback(
        async (tipo, argumentos) => {
            if (operacaoAtual.current) {
                return { sucesso: false, motivo: 'OPERACAO_EM_ANDAMENTO' };
            }

            operacaoAtual.current = tipo;
            setOperacao(tipo);
            setErro(null);
            setErroAtualizacao(null);
            setSucesso(null);

            try {
                if (typeof service[tipo] !== 'function') {
                    throw new Error(MENSAGEM_ERRO);
                }
                const resultado = await service[tipo](argumentos);
                let falhaAtualizacao = null;

                try {
                    await aoAtualizar?.({ tipo, resultado });
                } catch {
                    falhaAtualizacao = MENSAGEM_ATUALIZACAO;
                    setErroAtualizacao(falhaAtualizacao);
                }

                const mensagem = resultado?.mensagem || MENSAGEM_SUCESSO;
                setSucesso(mensagem);
                return { sucesso: true, resultado, mensagem, erroAtualizacao: falhaAtualizacao };
            } catch (falha) {
                if (falha?.status === 401) {
                    try {
                        onSessaoExpirada?.();
                    } catch {
                        // A falha visual continua sendo exibida mesmo se a navegação falhar.
                    }
                }

                const mensagem = obterMensagemErro(falha);
                setErro(mensagem);
                return { sucesso: false, erro: falha, mensagem };
            } finally {
                operacaoAtual.current = null;
                setOperacao(null);
            }
        },
        [aoAtualizar, onSessaoExpirada, service]
    );

    const removerDia = useCallback((argumentos) => executar('removerDia', argumentos), [executar]);
    const excluirCiclo = useCallback(
        (argumentos) => executar('excluirCiclo', argumentos),
        [executar]
    );

    const limparFeedback = useCallback(() => {
        setErro(null);
        setErroAtualizacao(null);
        setSucesso(null);
    }, []);

    return {
        operacao,
        erro,
        erroAtualizacao,
        sucesso,
        removendoDia: operacao === 'removerDia',
        excluindoCiclo: operacao === 'excluirCiclo',
        removerDia,
        excluirCiclo,
        limparFeedback
    };
}

export {
    MENSAGEM_ATUALIZACAO,
    MENSAGEM_ERRO,
    MENSAGEM_SUCESSO,
    obterMensagemErro,
    useCycleRemoval,
    validarService
};
