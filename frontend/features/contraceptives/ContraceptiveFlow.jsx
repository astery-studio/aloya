import { useState } from 'react';
import { Pill } from 'phosphor-react-native';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import { ContraceptivesScreen } from '../../screens/contraceptives/ContraceptivesScreen';
import { NewContraceptiveScreen } from '../../screens/contraceptives/NewContraceptiveScreen';

function ContraceptiveFlow() {
    const [tela, setTela] = useState('lista');
    const [itens, setItens] = useState([]);
    const [mensagem, setMensagem] = useState(null);

    async function cadastrar(anticoncepcional) {
        setItens((atuais) => [anticoncepcional, ...atuais]);
        setTela('lista');
        setMensagem('Anticoncepcional cadastrado com sucesso.');
    }

    return (
        <>
            {tela === 'cadastro'
                ? <NewContraceptiveScreen onVoltar={() => setTela('lista')} onCadastrar={cadastrar} />
                : <ContraceptivesScreen anticoncepcionais={itens} onCadastrarNovo={() => setTela('cadastro')} />}
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
