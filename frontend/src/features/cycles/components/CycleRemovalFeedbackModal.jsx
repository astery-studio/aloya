import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { DropIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './CycleRemovalFeedbackModal.styles';

function IconeAlerta({ erro = false }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const corContorno = erro
        ? tema.cores.interface.textoSecundario
        : tema.escuro
          ? '#EE9297'
          : '#C85A44';
    const corAlerta = tema.escuro ? '#F39A9D' : '#B43D3D';

    return (
        <View
            testID={erro ? 'icone-alerta-erro' : 'icone-alerta-confirmacao'}
            style={[estilos.areaIcone, erro ? estilos.fundoErro : estilos.fundoConfirmacao]}
        >
            <Svg width={22} height={22} viewBox="0 0 24 24" accessibilityElementsHidden>
                <Circle cx={12} cy={12} r={10} fill="none" stroke={corContorno} strokeWidth={1.5} />
                <Path
                    d="M12 7v6"
                    fill="none"
                    stroke={corAlerta}
                    strokeLinecap="round"
                    strokeWidth={2}
                />
                <Circle cx={12} cy={17} r={1} fill={corAlerta} />
            </Svg>
        </View>
    );
}

function IconeConfirmacao() {
    return <IconeAlerta />;
}

function IconeErro() {
    return <IconeAlerta erro />;
}

function IconeSucesso() {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <View style={[estilos.areaIcone, estilos.fundoConfirmacao]}>
            <DropIcon size={22} color={tema.escuro ? '#EE9297' : '#C85A44'} weight="regular" />
        </View>
    );
}

function CycleRemovalFeedbackModal({
    visivel = true,
    onOcultar,
    tipo,
    periodo,
    carregando = false,
    onConfirmar,
    onCancelar,
    onTentarNovamente,
    onFechar
}) {
    if (tipo === 'confirmacao') {
        return (
            <SimpleModal
                visivel={visivel}
                aoOcultar={onOcultar}
                aoFechar={carregando ? undefined : onCancelar}
                icone={IconeConfirmacao}
                fundoIcone="transparent"
                titulo="Apagar ciclo"
                mensagem={`Tem certeza que deseja excluir todo o período de menstruação de ${periodo} do seu histórico? Esta ação não pode ser desfeita e recalculará suas previsões futuras.`}
                acaoPrincipal={{
                    texto: 'Apagar',
                    variante: 'verde',
                    aoPressionar: onConfirmar,
                    carregando
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: onCancelar,
                    desativado: carregando
                }}
            />
        );
    }

    if (tipo === 'erro') {
        return (
            <SimpleModal
                visivel={visivel}
                aoOcultar={onOcultar}
                aoFechar={carregando ? undefined : onFechar}
                icone={IconeErro}
                fundoIcone="transparent"
                titulo="Algo deu errado"
                mensagem={'Ocorreu um erro ao excluir este registro.\nTente novamente.'}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: onTentarNovamente,
                    carregando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: onFechar,
                    desativado: carregando
                }}
            />
        );
    }

    if (tipo === 'sucesso-excluir' || tipo === 'sucesso-atualizar') {
        return (
            <SimpleModal
                visivel={visivel}
                aoOcultar={onOcultar}
                aoFechar={onFechar}
                icone={IconeSucesso}
                fundoIcone="transparent"
                titulo={
                    tipo === 'sucesso-excluir'
                        ? 'Ciclo excluído com sucesso'
                        : 'Ciclo atualizado com sucesso'
                }
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: onFechar
                }}
            />
        );
    }

    return null;
}

export { CycleRemovalFeedbackModal, IconeAlerta };
