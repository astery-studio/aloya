import { useState } from 'react';

function useForgotPassword({ solicitarRecuperacao, reenviarRecuperacao }) {
    const [email, setEmail] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [resultado, setResultado] = useState(null);

    async function executar(acao) {
        setCarregando(true);
        setErro(null);

        try {
            const resposta = await acao({ email: email.trim().toLowerCase() });
            setResultado(resposta);
            return resposta;
        } catch (falha) {
            setErro(falha.mensagemUsuario || falha.message ||
                'Não foi possível enviar o e-mail.');
            return null;
        } finally {
            setCarregando(false);
        }
    }

    const enviar = () => executar(solicitarRecuperacao);
    const reenviar = () => executar(reenviarRecuperacao || solicitarRecuperacao);
    const limparErro = () => setErro(null);

    return { email, setEmail, carregando, erro, resultado, enviar, reenviar, limparErro };
}

export { useForgotPassword };
