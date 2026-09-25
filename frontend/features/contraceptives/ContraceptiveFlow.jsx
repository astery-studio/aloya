import { useCallback, useEffect, useState } from 'react';
import { Pill } from 'phosphor-react-native';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import { ContraceptivesScreen } from '../../screens/contraceptives/ContraceptivesScreen';
import { NewContraceptiveScreen } from '../../screens/contraceptives/NewContraceptiveScreen';

const serviceLocal = Object.freeze({
    listar: async () => [],
    cadastrar: async (anticoncepcional) => anticoncepcional
});

function ContraceptiveFlow({ service = serviceLocal, onVoltar, onSessaoExpirada }) {
    const [tela, setTela] = useState('lista');
    const [itens, setItens] = useState([]);
    const [mensagem, setMensagem] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(null);

    const carregar = useCallback(async (signal) => {
        setCarregando(true);
        setErro(null);
        try {
            setItens(await service.listar({ signal }));
        } catch (falha) {
            if (falha?.name === 'AbortError') return;
            if (falha?.status === 401) return onSessaoExpirada?.();
            setErro(falha?.mensagemUsuario || 'Verifique sua conexão e tente novamente.');
        } finally {
            setCarregando(false);
        }
    }, [onSessaoExpirada, service]);

    useEffect(() => {
        const controlador = new AbortController();
        carregar(controlador.signal);
        return () => controlador.abort();
    }, [carregar]);

    async function cadastrar(anticoncepcional) {
        setSalvando(true);
        try {
            const salvo = await service.cadastrar(anticoncepcional);
            setItens((atuais) => [salvo, ...atuais]);
            setTela('lista');
            setMensagem('Anticoncepcional cadastrado com sucesso.');
        } catch (falha) {
            if (falha?.status === 401) onSessaoExpirada?.();
            throw falha;
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            {tela === 'cadastro'
                ? <NewContraceptiveScreen onVoltar={() => setTela('lista')} onCadastrar={cadastrar} salvando={salvando} />
                : <ContraceptivesScreen anticoncepcionais={itens} onCadastrarNovo={() => setTela('cadastro')} onVoltar={onVoltar} carregando={carregando} erro={erro} onTentarNovamente={() => carregar()} />}
            <SimpleModal
                visivel={Boolean(mensagem)}
                aoFechar={() => setMensagem(null)}
                icone={Pill}
                titulo={mensagem}
                acaoPrincipal={{ texto: 'OK', variante: 'verde', aoPressionar: () => setMensagem(null) }}
            />
        </>
    );
}

export { ContraceptiveFlow };
