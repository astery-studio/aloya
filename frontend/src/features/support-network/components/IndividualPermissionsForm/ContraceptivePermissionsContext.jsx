import { ActivityIndicator, Text, View } from 'react-native';
import { obterTipo } from '../../../contraceptives/constants/contraceptiveOptions';
import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { EmptyState } from '../../../../shared/components/feedback/EmptyState/EmptyState';
import { useTheme } from '../../../../shared/hooks/useTheme';

export function ContraceptivePermissionsContext({ metodos, falhou, recarregar, abrirArea }) {
    const { cores, typography } = useTheme();

    if (falhou)
        return (
            <EmptyState
                usarPaletaNoturnaConteudo
                variante="erro"
                titulo="Não foi possível carregar os anticoncepcionais"
                mensagem="Tente novamente para ver as permissões disponíveis."
                acao={<ButtonScreen texto="Tentar novamente" aoPressionar={recarregar} />}
            />
        );

    if (!metodos) return <ActivityIndicator accessibilityLabel="Carregando anticoncepcionais" />;

    if (metodos.length === 0)
        return (
            <EmptyState
                usarPaletaNoturnaConteudo
                titulo="Nenhum anticoncepcional cadastrado"
                mensagem="Cadastre um anticoncepcional para configurar o acesso e os alertas."
                acao={
                    <ButtonScreen
                        texto="Ir para Anticoncepcionais"
                        aoPressionar={abrirArea}
                        desativado={!abrirArea}
                    />
                }
            />
        );

    return (
        <View style={{ gap: 4 }}>
            <Text
                accessibilityRole="header"
                style={[typography.bodyDefault, { color: cores.interface.textoPrincipal }]}
            >
                Anticoncepcionais cadastrados
            </Text>
            {metodos.map(({ id, nome, tipo }) => (
                <Text
                    key={id}
                    style={[typography.bodyDefault, { color: cores.interface.textoSecundario }]}
                >
                    {nome || obterTipo(tipo)?.label}
                </Text>
            ))}
        </View>
    );
}
