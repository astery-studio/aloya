import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { ArrowLeftIcon } from 'phosphor-react-native/src/icons/ArrowLeft';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { DropIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal/SimpleModal';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { MenstruationRegistrationCalendar } from '../components/MenstruationRegistrationCalendar';
import { SyncStatusIndicator } from '../components/SyncStatusIndicator';
import { estilos } from './MenstruationRegistrationScreen.styles';

function RegistrationErrorIcon({ size = 22 }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" fill="none" stroke="#5C5C59" strokeWidth="1.5" />
            <Path d="M12 7v5" stroke="#B43D3D" strokeWidth="2" strokeLinecap="round" />
            <Circle cx="12" cy="16" r="1" fill="#B43D3D" />
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
        <SafeAreaView edges={['top', 'bottom']} style={estilos.tela}>
            <View style={estilos.cabecalho}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Cadastrar menstruação
