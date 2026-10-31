/**
 * Compõe mensagens simples com até duas ações a partir de AppModal e ButtonPopup.
 */
import { useMemo } from 'react';
import { useTheme } from '../../../../hooks/useTheme';
import { criarEstilos } from './SimpleModal.styles';
import { criarAparenciaErroInterno } from '../InternalErrorModal.styles';
import ButtonPopup from '../../../common/Button/ButtonPopup/ButtonPopup';
import AppModal from '../ModalBase/AppModal';

const larguraTotal = { width: '100%' };

export default function SimpleModal({
    visivel,
    aoFechar,
    aoOcultar,
    icone,
    corIcone,
    fundoIcone,
    estiloIcone,
    titulo,
    mensagem,
    acaoPrincipal,
    acaoSecundaria,
    varianteVisual,
    erroInterno = false
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const visualErro = erroInterno ? criarAparenciaErroInterno(tema) : {};
    const sairDaConta = varianteVisual === 'sairDaConta';
    const sairSemSalvar =
        varianteVisual === 'sairSemSalvar' ||
        [acaoPrincipal, acaoSecundaria].some((acao) => acao?.varianteVisual === 'sairSemSalvar');

    return (
        <AppModal
            variante="simples"
            visivel={visivel}
            aoFechar={aoFechar}
            aoOcultar={aoOcultar}
            icone={icone}
            corIcone={visualErro.corIcone ?? (tema.escuro ? '#E3E3E3' : corIcone)}
            fundoIcone={
                visualErro.fundoIcone ?? (tema.escuro ? 'rgba(255, 255, 255, 0.08)' : fundoIcone)
            }
            estiloIcone={[estiloIcone, estilos.icone, visualErro.icone]}
            estilo={[
                estilos.caixa,
                visualErro.modal,
                (sairSemSalvar || sairDaConta) && estilos.caixaSairSemSalvar,
                sairDaConta && estilos.caixaSairDaConta
            ]}
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
                    estilo={[
                        larguraTotal,
                        visualErro.botaoPrincipal,
                        acaoPrincipal.varianteVisual === 'sairSemSalvar' &&
                            estilos.botaoSairSemSalvar
                    ]}
                    estiloTexto={[
                        visualErro.textoPrincipal,
                        acaoPrincipal.varianteVisual === 'sairSemSalvar' &&
                            estilos.textoSairSemSalvar
                    ]}
                />
            )}
            {acaoSecundaria && (
                <ButtonPopup
                    texto={acaoSecundaria.texto}
                    aoPressionar={acaoSecundaria.aoPressionar}
                    variante={acaoSecundaria.variante || 'branco'}
                    desativado={acaoSecundaria.desativado}
                    carregando={acaoSecundaria.carregando}
                    estilo={[
                        larguraTotal,
                        visualErro.botaoSecundario,
                        (acaoSecundaria.varianteVisual === 'sairSemSalvar' || sairDaConta) &&
                            estilos.botaoSairSemSalvar
                    ]}
                    estiloTexto={[
                        visualErro.textoSecundario,
                        (acaoSecundaria.varianteVisual === 'sairSemSalvar' || sairDaConta) &&
                            estilos.textoSairSemSalvar
                    ]}
                />
            )}
        </AppModal>
    );
}
