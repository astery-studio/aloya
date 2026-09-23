import { useCallback, useEffect, useRef, useState } from 'react';
import { salvarToken } from '../../../services/auth/tokenStorage';

function useLogin({ realizarLogin }) {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);
    const montado = useRef(true);

    useEffect(() => {
        montado.current = true;
        return () => {
            montado.current = false;
        };
    }, []);

    const enviarLogin = useCallback(async (credenciais) => {
        setCarregando(true);
        setErro(null);
        setSucesso(false);

        try {
            const resultado = await realizarLogin(credenciais);
            await salvarToken(resultado.autenticacao);
            if (montado.current) setSucesso(true);
            return resultado;
        } catch (falha) {
            if (montado.current) {
                setErro(falha.mensagemUsuario || falha.message || 'Não foi possível entrar.');
            }
            return null;
        } finally {
            if (montado.current) setCarregando(false);
        }
    }, [realizarLogin]);

    const limparErro = useCallback(() => {
        setErro(null);
    }, []);

    return { carregando, erro, sucesso, enviarLogin, limparErro };
}

export { useLogin };
