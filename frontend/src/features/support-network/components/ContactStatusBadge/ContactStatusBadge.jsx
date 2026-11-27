//Apresenta o estado textual e visual de um vínculo da Rede de Apoio.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos, criarVariantes } from './ContactStatusBadge.styles';

const ESTADOS_CONTATO = Object.freeze({
    pendente: Object.freeze({
        rotulo: 'Pendente',
        variante: 'pendente'
    }),
    ativo: Object.freeze({
        rotulo: 'Ativo',
        variante: 'ativo'
    }),
    inativo: Object.freeze({
        rotulo: 'Inativo',
        variante: 'inativo'
    }),
    recusado: Object.freeze({
        rotulo: 'Recusado',
        variante: 'recusado'
    })
});

function ContactStatusBadge({ estado, compacto = false }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const variantes = useMemo(() => criarVariantes(tema), [tema]);

    const configuracao = ESTADOS_CONTATO[estado];

    if (!configuracao) {
        throw new Error(`Estado de ContactStatusBadge inválido: ${estado}`);
    }

    const variante = variantes[configuracao.variante];

    return (
        <View
            testID="contact-status-badge"
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Status do contato: ${configuracao.rotulo}`}
            style={[estilos.container, variante.container, compacto && estilos.containerCompacto]}
        >
            <View
                testID="contact-status-badge-indicator"
                importantForAccessibility="no-hide-descendants"
                style={[
                    estilos.indicador,
                    variante.indicador,
                    compacto && estilos.indicadorCompacto
                ]}
            />

            <Text
                numberOfLines={1}
                style={[estilos.texto, variante.texto, compacto && estilos.textoCompacto]}
            >
                {configuracao.rotulo}
            </Text>
        </View>
    );
}

export { ContactStatusBadge, ESTADOS_CONTATO };
