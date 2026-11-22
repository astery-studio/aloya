//Apresenta a origem das permissões concedidas ao contato.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { UserIcon, UsersIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { criarEstilos, criarVariantes } from './ContactPermissionBadge.styles';

function obterNomeCategoria(vinculo) {
    const nomeDireto =
        typeof vinculo?.nomeCategoria === 'string' ? vinculo.nomeCategoria.trim() : '';

    if (nomeDireto) {
        return nomeDireto;
    }

    return typeof vinculo?.categoria?.nome === 'string' ? vinculo.categoria.nome.trim() : '';
}

function normalizarVinculo(vinculo) {
    if (vinculo === null || typeof vinculo !== 'object' || Array.isArray(vinculo)) {
        throw new TypeError('O vínculo do contato é inválido.');
    }

    if (vinculo.tipo === 'individual') {
        return Object.freeze({
            tipo: 'individual',
            rotulo: 'Permissões Individuais'
        });
    }

    if (vinculo.tipo === 'categoria') {
        const nomeCategoria = obterNomeCategoria(vinculo);

        if (!nomeCategoria) {
            throw new TypeError('O nome da categoria do contato é obrigatório.');
        }

        return Object.freeze({
            tipo: 'categoria',
            rotulo: nomeCategoria
        });
    }

    throw new TypeError('O tipo de vínculo do contato é inválido.');
}

function ContactPermissionBadge({ vinculo }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(), []);

    const variantes = useMemo(() => criarVariantes(tema), [tema]);

    const vinculoNormalizado = useMemo(() => normalizarVinculo(vinculo), [vinculo]);

    const categoria = vinculoNormalizado.tipo === 'categoria';

    const Icone = categoria ? UsersIcon : UserIcon;

    const variante = variantes[vinculoNormalizado.tipo];

    return (
        <View
            testID="contact-permission-badge"
            accessible
            accessibilityRole="text"
            accessibilityLabel={
                categoria
                    ? `Categoria de permissão: ${vinculoNormalizado.rotulo}`
                    : 'Vínculo com permissões individuais'
            }
            style={[estilos.container, variante.container]}
        >
            <Icone
                testID={`contact-permission-badge-icon-${vinculoNormalizado.tipo}`}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                size={13}
                color={variante.conteudo.color}
                weight="regular"
            />

            <Text numberOfLines={1} ellipsizeMode="tail" style={[estilos.texto, variante.conteudo]}>
                {vinculoNormalizado.rotulo}
            </Text>
        </View>
    );
}

export { ContactPermissionBadge, normalizarVinculo, obterNomeCategoria };
