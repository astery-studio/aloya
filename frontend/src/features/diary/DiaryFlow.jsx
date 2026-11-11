import { useState } from 'react';

import { NewDiaryEntryModal } from './components/NewDiaryEntryModal/NewDiaryEntryModal';
import { DiaryScreen } from './screens/DiaryScreen';

function inserirRegistroOrdenado(registros, novoRegistro) {
    return [...registros, novoRegistro].sort(
        (primeiro, segundo) => segundo.data.localeCompare(primeiro.data) || segundo.id - primeiro.id
    );
}

function DiaryFlow({ service, calendarService, onSelecionarAba, onSessaoExpirada, onRegistroCriado }) {
    const [modalVisivel, setModalVisivel] = useState(false);
    const [registrosCriados, setRegistrosCriados] = useState([]);

    function registrarCriacao(registro) {
        setRegistrosCriados((atuais) => inserirRegistroOrdenado(atuais, registro));
        onRegistroCriado?.(registro);
    }

    return (
        <>
            <DiaryScreen
                aoCriar={() => setModalVisivel(true)}
                ultimoRegistro={registrosCriados[0]}
                onSelecionarAba={onSelecionarAba}
            />
            <NewDiaryEntryModal
                visivel={modalVisivel}
                service={service}
                calendarService={calendarService}
                onFechar={() => setModalVisivel(false)}
                onCriado={registrarCriacao}
                onSessaoExpirada={onSessaoExpirada}
            />
        </>
    );
}

export { DiaryFlow, inserirRegistroOrdenado };
