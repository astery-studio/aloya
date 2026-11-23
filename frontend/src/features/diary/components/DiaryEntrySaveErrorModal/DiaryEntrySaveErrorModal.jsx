import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { obterCoresDiario } from '../../config/diaryColors';

function DiaryEntrySaveErrorModal({
    erro,
    salvando,
    conflitoVersao = false,
    aoFechar,
    aoTentarNovamente,
    aoRecarregarDados
}) {
    const tema = useTheme();
    const cores = obterCoresDiario(tema).interface;
    return (
        <SimpleModal
            erroInterno
            visivel={Boolean(erro)}
            aoFechar={aoFechar}
            icone={WarningCircleIcon}
            corIcone={cores.textoSecundario}
            fundoIcone={cores.separador}
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
