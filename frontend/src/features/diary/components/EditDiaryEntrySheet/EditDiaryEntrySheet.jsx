import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Text } from 'react-native';

import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import AlertModal from '../../../../shared/components/feedback/Modal/AlertModal/AlertModal';
import { WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../hooks/useDiaryEntryForm';
import { useDiaryPhase } from '../../hooks/useDiaryPhase';
import { DiaryEntryFormContent } from '../DiaryEntryForm/DiaryEntryFormContent';
import { DiaryEntrySaveErrorModal } from '../DiaryEntrySaveErrorModal/DiaryEntrySaveErrorModal';
import { criarEstilos } from '../DiaryEntryForm/DiaryEntrySheet.styles';

// Orquestra exclusivamente os estados e as regras da edição de um registro existente.
function EditDiaryEntrySheet({
    visivel,
    registro,
    carregandoRegistro = false,
    erroRegistro,
    service,
    calendarService,
    onFechar,
    onSalvo,
    aoRecarregarRegistro,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [confirmacaoDescarteVisivel, setConfirmacaoDescarteVisivel] = useState(false);
    const [dadosExternosAnunciados, setDadosExternosAnunciados] = useState(false);
    const posicaoRolagem = useRef(0);
    const tituloRef = useRef(null);
    const registroFocado = useRef(null);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const formulario = useDiaryEntryForm({
        ativo: visivel && Boolean(registro),
        catalogo: catalogo.catalogo,
        service,
        modo: 'editar',
        registroInicial: registro,
        onSalvo: concluirEdicao,
        onSessaoExpirada
    });
    const fase = useDiaryPhase({
        ativo: visivel && Boolean(registro),
        data: formulario.data,
        service: calendarService,
        onSessaoExpirada
    });

    async function concluirEdicao(registroAtualizado) {
        await onSalvo?.(registroAtualizado);
        onFechar?.();
    }

    useEffect(() => {
        if (!visivel) {
            registroFocado.current = null;
            setConfirmacaoDescarteVisivel(false);
            setDadosExternosAnunciados(false);
            return;
        }
        if (!registro || catalogo.carregando || registroFocado.current === registro.id) return;
        registroFocado.current = registro.id;
        const temporizador = setTimeout(() => {
            const identificador = findNodeHandle(tituloRef.current);
            if (identificador) AccessibilityInfo.setAccessibilityFocus(identificador);
        }, 0);
        return () => clearTimeout(temporizador);
    }, [catalogo.carregando, registro, visivel]);

    const solicitarFechamento = useCallback(() => {
        if (formulario.alterado) {
            setConfirmacaoDescarteVisivel(true);
            return false;
        }
        onFechar?.();
        return true;
    }, [formulario.alterado, onFechar]);

    const descartarAlteracoes = useCallback(() => {
        setConfirmacaoDescarteVisivel(false);
        onFechar?.();
    }, [onFechar]);

    const continuarEdicao = useCallback(() => {
        setConfirmacaoDescarteVisivel(false);
    }, []);

    const recarregarAposConflito = useCallback(async () => {
        formulario.limparErroSalvamento();
        const recarregou = await aoRecarregarRegistro?.();
        if (recarregou) setDadosExternosAnunciados(true);
    }, [aoRecarregarRegistro, formulario]);

    const atualizarPosicaoRolagem = useCallback((posicao) => {
        posicaoRolagem.current = Math.max(0, posicao);
    }, []);
    const podeIniciarDeslize = useCallback(() => posicaoRolagem.current <= 8, []);
    const carregando = catalogo.carregando || (carregandoRegistro && !registro);
    const erro = catalogo.erro || erroRegistro;
    const tentarNovamente = erroRegistro ? aoRecarregarRegistro : catalogo.recarregar;

    return (
        <>
            <BottomSheet
                visivel={visivel}
                onFechar={solicitarFechamento}
                bloquearFechamento={formulario.salvando}
                permitirDeslizarParaFechar
                podeIniciarDeslize={podeIniciarDeslize}
                estiloPainel={estilos.painel}
            >
                <Text accessibilityLiveRegion="polite" style={estilos.leitorTela}>
                    {dadosExternosAnunciados
                        ? 'Dados externos carregados. O rascunho anterior foi substituído.'
                        : registro && !carregando
                          ? 'Formulário de edição carregado com os valores existentes.'
                          : ''}
                </Text>
                <DiaryEntryFormContent
                    catalogo={catalogo.catalogo}
                    carregando={carregando}
                    erroCatalogo={erro}
                    recarregar={tentarNovamente}
                    formulario={formulario}
                    fase={fase.fase}
                    carregandoFase={fase.carregando}
                    bloquearSalvarSemAlteracoes={!formulario.alterado}
                    tituloRef={tituloRef}
                    onDeslizarParaFechar={formulario.salvando ? undefined : solicitarFechamento}
                    onPosicaoRolagem={atualizarPosicaoRolagem}
                />
                <DiaryEntrySaveErrorModal
                    erro={formulario.erroSalvamento}
                    salvando={formulario.salvando}
                    conflitoVersao={formulario.conflitoVersao}
                    aoFechar={formulario.limparErroSalvamento}
                    aoTentarNovamente={formulario.salvar}
                    aoRecarregarDados={recarregarAposConflito}
                />
            </BottomSheet>
            <AlertModal
                variante="confirmacao"
                visivel={confirmacaoDescarteVisivel}
                aoFechar={continuarEdicao}
                icone={WarningCircleIcon}
                titulo="Dados não salvos"
                mensagem="Você tem atualizações não salvas. Deseja mesmo sair?"
                acaoPrincipal={{
                    texto: 'Sair sem salvar',
                    variante: 'branco',
                    aoPressionar: descartarAlteracoes
                }}
                acaoSecundaria={{
                    texto: 'Continuar a editar',
                    variante: 'verde',
                    aoPressionar: continuarEdicao
                }}
            />
        </>
    );
}

export { EditDiaryEntrySheet };
