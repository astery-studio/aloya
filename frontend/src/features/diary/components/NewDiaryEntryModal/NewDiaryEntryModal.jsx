import { useMemo, useState } from 'react';

import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { LockKeyIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../hooks/useDiaryEntryForm';
import { useDiaryPhase } from '../../hooks/useDiaryPhase';
import { NewDiaryEntryContent } from './NewDiaryEntryContent';
import { criarEstilos } from './NewDiaryEntryModal.styles';

function NewDiaryEntryModal({
    visivel,
    service,
    calendarService,
    onFechar,
    onCriado,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [registroSalvo, setRegistroSalvo] = useState(null);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const formulario = useDiaryEntryForm({
        ativo: visivel,
        catalogo: catalogo.catalogo,
        service,
        onSessaoExpirada,
        onCriado: setRegistroSalvo
    });
    const fase = useDiaryPhase({
        ativo: visivel,
        data: formulario.data,
        service: calendarService,
        onSessaoExpirada
    });

    function concluirSalvamento() {
        onCriado?.(registroSalvo);
        setRegistroSalvo(null);
        onFechar?.();
    }

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={formulario.salvando}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
        >
            <NewDiaryEntryContent
                catalogo={catalogo.catalogo}
                carregando={catalogo.carregando}
                erroCatalogo={catalogo.erro}
                recarregar={catalogo.recarregar}
                formulario={formulario}
                fase={fase.fase}
                carregandoFase={fase.carregando}
            />
            <SimpleModal
                visivel={Boolean(registroSalvo)}
                icone={LockKeyIcon}
                corIcone={tema.cores.icones.configuracoes.laranja.icone}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Registro salvo com sucesso."
                acaoPrincipal={{ texto: 'OK', aoPressionar: concluirSalvamento }}
            />
            <SimpleModal
                erroInterno
                visivel={Boolean(formulario.erroSalvamento)}
                aoFechar={formulario.salvando ? undefined : formulario.limparErroSalvamento}
                icone={WarningCircleIcon}
                corIcone="#5C5C59"
                fundoIcone="#EDEDED"
                titulo="Algo deu errado"
                mensagem={formulario.erroSalvamento}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: formulario.salvar,
                    carregando: formulario.salvando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    aoPressionar: formulario.limparErroSalvamento,
                    desativado: formulario.salvando
                }}
            />
        </BottomSheet>
    );
}

export { NewDiaryEntryModal };
