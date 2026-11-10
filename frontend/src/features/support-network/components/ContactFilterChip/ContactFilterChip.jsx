//Apresenta uma opção compacta e multisselecionável dos filtros de contatos.
import { useMemo } from 'react';
import { Pressable, Text } from 'react-native';

import { CheckCircleIcon, CircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos, criarVariantes } from './ContactFilterChip.styles';

const GRUPOS_FILTRO = Object.freeze(['estado', 'permissao']);

function validarGrupo(grupo) {
    if (!GRUPOS_FILTRO.includes(grupo)) {
        throw new Error(`Grupo de ContactFilterChip inválido: ${grupo}`);
    }

    return grupo;
}

function normalizarRotulo(rotulo) {
    if (typeof rotulo !== 'string' || rotulo.trim().length === 0) {
        throw new Error('O rótulo de ContactFilterChip é obrigatório.');
    }

    return rotulo.trim();
}

function ContactFilterChip({
    rotulo,
    grupo,
    selecionado = false,
    aoPressionar,
    desabilitado = false
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const variantes = useMemo(() => criarVariantes(tema), [tema]);

    const grupoSeguro = validarGrupo(grupo);
    const rotuloSeguro = normalizarRotulo(rotulo);

    const bloqueado = desabilitado || typeof aoPressionar !== 'function';

    const variante = variantes[grupoSeguro];
    const IconeEstado = selecionado ? CheckCircleIcon : CircleIcon;

    function alternarSelecao() {
        if (!bloqueado) {
            aoPressionar();
        }
    }

    return (
        <Pressable
            testID={`contact-filter-chip-${grupoSeguro}-${rotuloSeguro}`}
            accessibilityRole="checkbox"
            accessibilityLabel={`${rotuloSeguro}, filtro de ${
                grupoSeguro === 'estado' ? 'tipo de contato' : 'tipo de permissão'
            }`}
            accessibilityState={{
                checked: Boolean(selecionado),
                disabled: bloqueado
            }}
            disabled={bloqueado}
            hitSlop={4}
            onPress={alternarSelecao}
            style={({ pressed }) => [
                estilos.container,
                variante.container,
                pressed && !bloqueado && estilos.pressionado,
                bloqueado && estilos.desabilitado
            ]}
        >
            <IconeEstado
                testID={`contact-filter-indicator-${grupoSeguro}-${rotuloSeguro}`}
                size={22}
                color={variante.corIndicador}
                weight={selecionado ? 'fill' : 'regular'}
            />

            <Text numberOfLines={1} style={[estilos.texto, variante.texto]}>
                {rotuloSeguro}
            </Text>
        </Pressable>
    );
}

export { ContactFilterChip, GRUPOS_FILTRO, normalizarRotulo, validarGrupo };
