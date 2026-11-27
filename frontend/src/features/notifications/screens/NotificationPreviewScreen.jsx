import { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { exibirPrevia, listarPreviews } from '../notificationPreview';
import { previaPermitida } from '../notificationPreviewCatalog';

import { NotificationPreviewCategory } from './NotificationPreviewCategory';
import { NotificationPreviewFeedback } from './NotificationPreviewFeedback';

const categorias = listarPreviews();

export function NotificationPreviewScreen({ efetivas, buscarPreferencias, onVoltar }) {
    const { cores, typography } = useTheme();
    const [estado, definirEstado] = useState(null);
    const [ocupado, definirOcupado] = useState(false);
    const [efetivasAtualizadas, definirEfetivasAtualizadas] = useState(efetivas);
    const emAndamento = useRef(false);

    const textoSecundario = [typography.bodyDefault, { color: cores.interface.textoSecundario }];
    const categoriasVisiveis = categorias
        .map(({ grupos, ...categoria }) => ({
            ...categoria,
            grupos: grupos
                .map(({ nome, tipos }) => ({
                    nome,
                    tipos: tipos.filter(([codigo]) => previaPermitida(codigo, efetivasAtualizadas))
                }))
                .filter(({ tipos }) => tipos.length > 0)
        }))
        .filter(({ grupos }) => grupos.length > 0);

    async function testar(codigo, rotulo, canal) {
        if (emAndamento.current) return;

        emAndamento.current = true;
        definirOcupado(true);

        try {
            const resultado = await exibirPrevia({
                codigo,
                rotulo,
                canal,
                plataforma: Platform.OS,
                autorizar: async (tipo) => {
                    const preferencias = await buscarPreferencias();
                    definirEfetivasAtualizadas(preferencias.efetivas);
                    return previaPermitida(tipo, preferencias.efetivas);
                },
                sdk: ['android', 'ios'].includes(Platform.OS)
                    ? await import('expo-notifications')
                    : null
            });
            definirEstado({ resultado, rotulo });
        } catch {
            definirEstado({ resultado: 'erro', rotulo });
        } finally {
            emAndamento.current = false;
            definirOcupado(false);
        }
    }

    return (
        <SettingsLayout titulo="Teste de notificações" onVoltar={onVoltar} respeitarEntalhe>
            <View style={estilos.lista}>
                <Text style={textoSecundario}>
                    Toque em um tipo para ver uma prévia nativa neste aparelho. O teste usa dados
                    fictícios e mostra os tipos habilitados em Notificações.
                </Text>
                {estado && (
                    <NotificationPreviewFeedback
                        {...{ estado, textoSecundario, typography, cores }}
                    />
                )}
                {categoriasVisiveis.map(({ titulo, canal, grupos }) => (
                    <NotificationPreviewCategory
                        key={canal}
                        {...{ titulo, canal, grupos, ocupado, testar, typography, cores }}
                    />
                ))}
            </View>
        </SettingsLayout>
    );
}

const estilos = StyleSheet.create({ lista: { gap: 24 } });
