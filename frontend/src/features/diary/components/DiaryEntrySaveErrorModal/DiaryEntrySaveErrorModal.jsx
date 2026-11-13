import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';

function DiaryEntrySaveErrorModal({
    erro,
    salvando,
    conflitoVersao = false,
    aoFechar,
    aoTentarNovamente,
    aoRecarregarDados
}) {
    return (
        <SimpleModal
            erroInterno
            visivel={Boolean(erro)}
            aoFechar={aoFechar}
            icone={WarningCircleIcon}
            corIcone="#5C5C59"
            fundoIcone="#EDEDED"
            titulo={conflitoVersao ? 'Registro atualizado' : 'Algo deu errado'}
            mensagem={erro}
            acaoPrincipal={{
                texto: conflitoVersao ? 'Recarregar dados' : 'Tentar novamente',
                variante: 'preto',
                aoPressionar: conflitoVersao ? aoRecarregarDados : aoTentarNovamente,
                carregando: salvando
            }}
            acaoSecundaria={{ texto: 'Voltar', aoPressionar: aoFechar, desativado: salvando }}
        />
    );
}

export { DiaryEntrySaveErrorModal };
