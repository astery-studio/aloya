import { useState } from 'react';
import { salvarToken } from '../../../services/auth/tokenStorage';

function useLogin({ realizarLogin }) {
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);

    async function enviarLogin(credenciais) {
        setCarregando(true);
        setErro(null);
        setSucesso(false);

        try {
            const resultado = await realizarLogin(credenciais);
            await salvarToken(resultado.autenticacao);
            setSucesso(true);
            return resultado;
        } catch (falha) {
            setErro(falha.mensagemUsuario || falha.message || 'Não foi possível entrar.');
            return null;
        } finally {
            setCarregando(false);
        }
    }

    return { carregando, erro, sucesso, enviarLogin };
}

export { useLogin };
