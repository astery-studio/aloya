import ButtonPopup from '../../common/Button/ButtonPopup';
import AppModal from './AppModal';

const larguraTotal = { width: '100%' };

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
                    estilo={larguraTotal}
                />
            )}
            {acaoSecundaria && (
                <ButtonPopup
                    texto={acaoSecundaria.texto}
                    aoPressionar={acaoSecundaria.aoPressionar}
                    variante={acaoSecundaria.variante || 'branco'}
                    desativado={acaoSecundaria.desativado}
                    carregando={acaoSecundaria.carregando}
                    estilo={larguraTotal}
                />
            )}
        </AppModal>
    );
}
/**
 * Compõe mensagens simples com até duas ações a partir de AppModal e ButtonPopup.
 */
