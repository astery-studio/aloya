//Mostra erros, alertas e avisos que precisam chamar a atenção da pessoa usuária
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';
import ButtonPopup from '../../common/Button/ButtonPopup';
import AppModal from './AppModal';

export default function AlertModal({visivel, aoFechar, icone = WarningCircleIcon, titulo, mensagem, destaque, acaoPrincipal, acaoSecundaria}) {
    const acaoPadrao = !acaoPrincipal && typeof aoFechar === 'function' ? { texto: 'Entendi', aoPressionar: aoFechar } : null;
    const principal = acaoPrincipal || acaoPadrao;
    const possuiAcao = Boolean(principal || acaoSecundaria);

    if (visivel && !possuiAcao) {
        throw new Error('AlertModal precisa de pelo menos uma ação ou de uma função aoFechar.');
    }

    return (
        <AppModal variante="alerta" visivel={visivel} aoFechar={aoFechar} icone={icone} titulo={titulo} mensagem={mensagem} destaque={destaque}>
            {principal ? (
                <ButtonPopup
                    texto={principal.texto}
                    aoPressionar={principal.aoPressionar}
                    variante={principal.variante || 'vermelho'}
                    desativado={principal.desativado}
                    carregando={principal.carregando}
                    rotuloAcessibilidade={principal.rotuloAcessibilidade}
                    estilo={{ width: '100%' }}
                />
            ) : null}

            {acaoSecundaria ? (
                <ButtonPopup
                    texto={acaoSecundaria.texto}
                    aoPressionar={acaoSecundaria.aoPressionar}
                    variante={acaoSecundaria.variante || 'branco'}
                    desativado={acaoSecundaria.desativado}
                    carregando={acaoSecundaria.carregando}
                    rotuloAcessibilidade={acaoSecundaria.rotuloAcessibilidade}
                    estilo={{ width: '100%' }}
                />
            ) : null}
        </AppModal>
    );
}