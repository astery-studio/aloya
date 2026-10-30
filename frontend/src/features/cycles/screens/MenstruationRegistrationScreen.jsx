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
                </Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Voltar"
                    disabled={salvando || typeof onVoltar !== 'function'}
                    onPress={onVoltar}
                    style={estilos.voltar}
                >
                    <ArrowLeftIcon size={24} color="#5C5C59" />
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
                <View style={estilos.ajuda}>
                    <InfoIcon size={20} color="#2D5141" />
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
                fundoIcone={feedback === 'erro' ? '#EDEDED' : '#F5EDE3'}
                corIcone={feedback === 'erro' ? '#B43D3D' : '#C85A44'}
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
