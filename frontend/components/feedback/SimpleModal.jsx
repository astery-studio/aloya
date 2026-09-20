import ButtonPopup from '../common/ButtonPopup/ButtonPopup';
import AppModal from './AppModal';

export default function SimpleModal({
    visivel, aoFechar, icone, corIcone, fundoIcone,
    titulo, mensagem, acaoPrincipal, acaoSecundaria
}) {
    return (
        <AppModal
            variante="simples"
            visivel={visivel}
            aoFechar={aoFechar}
            icone={icone}
            corIcone={corIcone}
            fundoIcone={fundoIcone}
            titulo={titulo}
            mensagem={mensagem}
        >
            {acaoPrincipal && (
                <ButtonPopup
                    texto={acaoPrincipal.texto}
                    aoPressionar={acaoPrincipal.aoPressionar}
                    variante={acaoPrincipal.variante || 'verde'}
                    desativado={acaoPrincipal.desativado}
                    carregando={acaoPrincipal.carregando}
                    estilo={{ width: '100%' }}
                />
            )}
            {acaoSecundaria && (
                <ButtonPopup
                    texto={acaoSecundaria.texto}
                    aoPressionar={acaoSecundaria.aoPressionar}
                    variante={acaoSecundaria.variante || 'branco'}
                    desativado={acaoSecundaria.desativado}
                    carregando={acaoSecundaria.carregando}
                    estilo={{ width: '100%' }}
                />
            )}
        </AppModal>
    );
}
