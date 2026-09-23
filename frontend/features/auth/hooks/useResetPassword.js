import { useState } from 'react';

function useResetPassword({ redefinirSenha, token }) {
    const [senha, setSenha] = useState('');
    const [confirmacao, setConfirmacao] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState(false);
    const valido = senha.length > 0 && senha === confirmacao;

    async function enviar() {
        if (!valido) return null;
        setCarregando(true);
        setErro(null);
        try {
            const resultado = await redefinirSenha({ token, senha });
            setSucesso(true);
            return resultado;
        } catch (falha) {
            setErro(falha.mensagemUsuario || falha.message || 'Não foi possível redefinir a senha.');
            return null;
        } finally {
            setCarregando(false);
        }
    }

    const limparErro = () => setErro(null);

    return { senha, setSenha, confirmacao, setConfirmacao, valido,
        carregando, erro, sucesso, enviar, limparErro };
}

export { useResetPassword };
/**
 * Hook que controla os campos e a submissão da redefinição de senha.
 */
