import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { BottomSheet } from '../../../../shared/components/feedback/BottomSheet/BottomSheet';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../hooks/useDiaryEntryForm';
import { NewDiaryEntryContent } from './NewDiaryEntryContent';
import { criarEstilos } from './NewDiaryEntryModal.styles';

function NewDiaryEntryModal({ visivel, service, onFechar, onCriado, onSessaoExpirada }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const catalogo = useDiaryCatalog({ ativo: visivel, service, onSessaoExpirada });
    const formulario = useDiaryEntryForm({
        ativo: visivel,
        catalogo: catalogo.catalogo,
        service,
        onSessaoExpirada,
        onCriado: (registro) => {
            onCriado?.(registro);
            onFechar?.();
        }
    });

    return (
        <BottomSheet
            visivel={visivel}
            onFechar={onFechar}
            bloquearFechamento={formulario.salvando}
            permitirDeslizarParaFechar
            estiloPainel={estilos.painel}
        >
            <View accessibilityRole="header" style={estilos.cabecalho}>
                <View style={estilos.indicador} />
                <Text style={estilos.titulo}>Novo registro</Text>
                <Text style={estilos.subtitulo}>Registre como você está se sentindo hoje.</Text>
            </View>
            <NewDiaryEntryContent
                catalogo={catalogo.catalogo}
                carregando={catalogo.carregando}
                erroCatalogo={catalogo.erro}
                recarregar={catalogo.recarregar}
                formulario={formulario}
            />
        </BottomSheet>
    );
}

export { NewDiaryEntryModal };
