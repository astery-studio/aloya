import AlertModal from '../../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal/SimpleModal';
import { LockKeyIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { obterCoresDiario } from '../../config/diaryColors';

function DiaryDeleteDialogs({ exclusao, tema }) {
    const coresDiario = obterCoresDiario(tema);
    return (
        <>
            <AlertModal
                variante="confirmacao"
                visivel={exclusao.confirmacaoVisivel}
                aoFechar={exclusao.cancelar}
                icone={WarningCircleIcon}
                titulo="Excluir Registro"
                mensagem="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
                acaoPrincipal={{
                    texto: 'Excluir',
                    variante: 'verde',
                    aoPressionar: exclusao.confirmar,
                    carregando: exclusao.excluindo
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: exclusao.cancelar,
                    desativado: exclusao.excluindo
                }}
            />
            <AlertModal
                visivel={exclusao.erro}
                aoFechar={exclusao.fecharErro}
                titulo="Algo deu errado"
                mensagem={exclusao.mensagemErro}
                erroInterno
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: exclusao.tentarNovamente,
                    carregando: exclusao.excluindo
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: exclusao.fecharErro,
                    desativado: exclusao.excluindo
                }}
            />
            <SimpleModal
                visivel={exclusao.sucesso}
                aoFechar={exclusao.concluirSucesso}
                icone={LockKeyIcon}
                corIcone={coresDiario.primaria}
                fundoIcone={tema.escuro ? coresDiario.interface.separador : '#F5EDE3'}
                titulo="Registro excluído com sucesso."
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: exclusao.concluirSucesso
                }}
            />
        </>
    );
}

export { DiaryDeleteDialogs };
