import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { DropIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal/SimpleModal';
import { useTheme } from '../../../shared/hooks/useTheme';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { MenstruationRegistrationCalendar } from '../components/MenstruationRegistrationCalendar';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
import { criarEstilos } from './MenstruationRegistrationScreen.styles';

function RegistrationErrorIcon({ size = 22, color = '#B43D3D' }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.5" />
            <Path d="M12 7v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="16" r="1" fill={color} />
        </Svg>
    );
}

function MenstruationRegistrationScreen({
    meses = [],
    datasSelecionadas = [],
    salvando = false,
    erro,
    sucesso = false,
    statusSincronizacao,
    mensagemSincronizacao,
    onAlternarData,
    onIniciarFaixa,
    onSalvar,
    onVoltar,
    onTentarNovamente,
    onFecharFeedback,
    onCarregarAnteriores,
    hoje = obterHojeLocal()
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const [conflitoLocal, setConflitoLocal] = useState(false);
    const conflito =
        conflitoLocal ||
        ['CONFLITO_REGISTRO_MENSTRUAL', 'SOBREPOSICAO_CICLO'].includes(erro?.codigo);
    const feedback = conflito ? 'conflito' : erro ? 'erro' : sucesso ? 'sucesso' : null;
    const fecharFeedback = () => {
        setConflitoLocal(false);
        onFecharFeedback?.();
    };
    const selecionadas = Array.isArray(datasSelecionadas) ? datasSelecionadas : [];
    const mesesValidos = Array.isArray(meses) ? meses : [];
    const podeSalvar =
        selecionadas.length > 0 &&
        selecionadas.every((data) => /^\d{4}-\d{2}-\d{2}$/.test(data) && data <= hoje);
    return (
        <SafeAreaView
            testID="tela-cadastro-menstruacao"
            edges={['top', 'bottom']}
            style={estilos.tela}
        >
            <View style={estilos.cabecalho}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Cadastrar menstruação
                </Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    disabled={salvando || typeof onVoltar !== 'function'}
                    onPress={onVoltar}
                    style={estilos.voltar}
                >
                    <ArrowLeftIcon size={24} color={estilos.corIconeCabecalho} />
                </Pressable>
            </View>
            <View style={estilos.legenda}>
                <View style={estilos.itemLegenda}>
                    <View style={estilos.simboloAnterior} />
                    <Text style={estilos.textoLegenda}>Ciclo anterior</Text>
                </View>
                <View style={estilos.itemLegenda}>
                    <View style={estilos.simboloSelecionado} />
                    <Text style={estilos.textoLegenda}>Selecionando agora</Text>
                </View>
            </View>
            <View style={estilos.diasSemana}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                    <Text key={dia} style={estilos.nomeSemana}>
                        {dia}
                    </Text>
                ))}
            </View>
            <MenstruationRegistrationCalendar
                meses={mesesValidos}
                datasSelecionadas={selecionadas}
                hoje={hoje}
                bloqueado={salvando}
                onAlternarData={onAlternarData}
                onIniciarFaixa={onIniciarFaixa}
                onConflito={() => setConflitoLocal(true)}
                onCarregarAnteriores={onCarregarAnteriores}
            />
            {mesesValidos.length === 0 && <Text style={estilos.vazio}>Nenhum mês disponível.</Text>}
            {selecionadas.length === 1 && (
                <View testID="orientacao-cadastro-menstruacao" style={estilos.ajuda}>
                    <InfoIcon size={20} color={tema.cores.interface.destaque} />
                    <Text style={estilos.textoAjuda}>
                        Agora toque no último dia para completar o período menstrual.
                    </Text>
                </View>
            )}
            <SyncStatusIndicator
                status={statusSincronizacao}
                mensagem={mensagemSincronizacao}
                onTentarNovamente={onTentarNovamente}
            />
            <View style={estilos.rodape}>
                <ButtonScreen
                    texto="Salvar"
                    aoPressionar={
                        typeof onSalvar === 'function'
                            ? () => onSalvar([...selecionadas])
                            : undefined
                    }
                    desativado={!podeSalvar || salvando}
                    carregando={salvando}
                    estilo={estilos.salvar}
                />
            </View>
            <SimpleModal
                visivel={Boolean(feedback)}
                aoFechar={fecharFeedback}
                icone={
                    feedback === 'sucesso'
                        ? DropIcon
                        : feedback === 'erro'
                          ? RegistrationErrorIcon
                          : WarningCircleIcon
                }
                estiloIcone={estilos.iconeFeedback}
                fundoIcone={
                    feedback === 'erro' ? estilos.fundoIconeErro : estilos.fundoIconeFeedback
                }
                corIcone={feedback === 'erro' ? estilos.corIconeErro : estilos.corIconeFeedback}
                titulo={
                    feedback === 'conflito'
                        ? 'Ciclo existente'
                        : feedback === 'erro'
                          ? 'Algo deu errado'
                          : 'Menstruação cadastrada'
                }
                mensagem={
                    feedback === 'conflito'
                        ? 'Este dia já pertence a outro ciclo registrado. Para corrigi-lo, edite o ciclo existente em vez de criar um novo registro.'
                        : feedback === 'erro'
                          ? 'Não foi possível sincronizar alguns registros. Verifique sua conexão.'
                          : undefined
                }
                acaoPrincipal={{
                    texto: feedback === 'erro' ? 'Tentar novamente' : 'OK',
                    variante: feedback === 'erro' ? 'preto' : 'verde',
                    aoPressionar: feedback === 'erro' ? onTentarNovamente : fecharFeedback
                }}
                acaoSecundaria={
                    feedback === 'erro'
                        ? { texto: 'Voltar', variante: 'branco', aoPressionar: fecharFeedback }
                        : undefined
                }
            />
        </SafeAreaView>
    );
}
export { MenstruationRegistrationScreen };
