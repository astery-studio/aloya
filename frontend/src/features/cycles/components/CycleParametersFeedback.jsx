import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { LockKeyIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { tema } from '../../../shared/theme';

function CycleParametersFeedback({
    sucesso,
    erro,
    saidaSemSalvar,
    salvando,
    onFecharSucesso,
    onFecharErro,
    onTentarNovamente,
    onContinuarEditando,
    onSairSemSalvar
}) {
    return (
        <>
            <SimpleModal
                visivel={sucesso}
                aoFechar={onFecharSucesso}
                icone={LockKeyIcon}
                titulo="Parâmetros atualizados com sucesso."
                acaoPrincipal={{ texto: 'OK', aoPressionar: onFecharSucesso }}
            />
            <SimpleModal
                visivel={Boolean(erro)}
                aoFechar={onFecharErro}
                icone={WarningCircleIcon}
                corIcone={tema.cores.feedback.erro}
                fundoIcone={tema.cores.neutras.bordaClara}
                titulo="Algo deu errado"
                mensagem={erro}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: onTentarNovamente,
                    carregando: salvando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: onFecharErro,
                    desativado: salvando
                }}
            />
            <SimpleModal
                visivel={saidaSemSalvar}
                aoFechar={onContinuarEditando}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Parâmetros não salvos"
                mensagem="Você tem alterações não salvas. Deseja mesmo sair?"
                acaoPrincipal={{
                    texto: 'Sair sem salvar',
                    variante: 'branco',
                    aoPressionar: onSairSemSalvar
                }}
                acaoSecundaria={{
                    texto: 'Continuar a editar',
                    variante: 'verde',
                    aoPressionar: onContinuarEditando
                }}
            />
        </>
    );
}

export { CycleParametersFeedback };
