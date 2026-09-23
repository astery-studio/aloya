import { useCallback, useEffect, useRef, useState } from 'react';

function useForgotPassword({ solicitarRecuperacao, reenviarRecuperacao }) {
    const [email, setEmail] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [resultado, setResultado] = useState(null);
    const montado = useRef(true);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
        };
    }, []);

    const executar = useCallback(async (acao) => {
        setCarregando(true);
        setErro(null);

        try {
            const resposta = await acao({ email: email.trim().toLowerCase() });
            if (montado.current) setResultado(resposta);
            return resposta;
        } catch (falha) {
            if (montado.current) {
                setErro(falha.mensagemUsuario || falha.message ||
                    'Não foi possível enviar o e-mail.');
            }
            return null;
        } finally {
            if (montado.current) setCarregando(false);
        }
    }, [email]);

    const enviar = useCallback(
        () => executar(solicitarRecuperacao), [executar, solicitarRecuperacao]
    );
    const reenviar = useCallback(
        () => executar(reenviarRecuperacao || solicitarRecuperacao),
        [executar, reenviarRecuperacao, solicitarRecuperacao]
    );
    const limparErro = useCallback(() => setErro(null), []);

    return { email, setEmail, carregando, erro, resultado, enviar, reenviar, limparErro };
}

export { useForgotPassword };
