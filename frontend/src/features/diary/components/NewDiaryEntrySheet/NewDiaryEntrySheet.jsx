import { useCallback, useMemo, useRef, useState } from 'react';

import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { LockKeyIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../hooks/useDiaryEntryForm';
import { useDiaryPhase } from '../../hooks/useDiaryPhase';
import { DiaryEntryFormContent } from '../DiaryEntryForm/DiaryEntryFormContent';
import { criarEstilos } from '../DiaryEntryForm/DiaryEntrySheet.styles';

function NewDiaryEntrySheet({
    visivel,
    service,
    calendarService,
    dataInicial,
    onFechar,
    onCriado,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [registroSalvo, setRegistroSalvo] = useState(null);
    const posicaoRolagem = useRef(0);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const formulario = useDiaryEntryForm({
        ativo: visivel,
        catalogo: catalogo.catalogo,
        service,
        dataInicial,
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
        onFechar?.();
        setRegistroSalvo(null);
    }

    const atualizarPosicaoRolagem = useCallback((posicao) => {
        posicaoRolagem.current = Math.max(0, posicao);
    }, []);

    const podeIniciarDeslize = useCallback(() => posicaoRolagem.current <= 8, []);

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={formulario.salvando}
            permitirDeslizarParaFechar
            podeIniciarDeslize={podeIniciarDeslize}
            estiloPainel={estilos.painel}
        >
            <DiaryEntryFormContent
                catalogo={catalogo.catalogo}
                carregando={catalogo.carregando}
                erroCatalogo={catalogo.erro}
                recarregar={catalogo.recarregar}
                formulario={formulario}
                fase={fase.fase}
                carregandoFase={fase.carregando}
                onDeslizarParaFechar={formulario.salvando ? undefined : onFechar}
                onPosicaoRolagem={atualizarPosicaoRolagem}
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
                aoFechar={formulario.limparErroSalvamento}
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

export { NewDiaryEntrySheet };
