import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CaretDownIcon, CaretUpIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { LegalSupport } from '../LegalSupport/LegalSupport';
import { criarEstilos } from './LegalSection.styles';

function LegalSection({ secao, indice, aberta, onAlternar }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const Indicador = aberta ? CaretUpIcon : CaretDownIcon;

    return (
        <View style={[estilos.secao, aberta && estilos.aberta]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={secao.titulo}
                accessibilityState={{ expanded: aberta }}
                onPress={onAlternar}
                style={({ pressed }) => [estilos.cabecalho, pressed && estilos.pressionado]}
            >
                <Text style={estilos.numero}>{indice + 1}.</Text>
                <Text style={estilos.titulo}>{secao.titulo}</Text>
                <Indicador size={18} color={tema.cores.interface.destaque} accessible={false} />
            </Pressable>
            {aberta ? (
                <View style={estilos.corpo}>
                    {secao.contatoSuporte ? <LegalSupport somenteEndereco /> : null}
                    {secao.blocos.map(({ enfase, texto }) => (
                        <Text key={texto} selectable style={estilos.paragrafo}>
                            {enfase ? <Text style={estilos.enfase}>{enfase} </Text> : null}
                            {texto}
                        </Text>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

export { LegalSection };
