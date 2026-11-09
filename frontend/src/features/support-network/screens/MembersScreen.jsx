//Mostra a área de membros da Rede de Apoio e seus principais pontos de entrada.
import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { criarEstilos } from './MembersScreen.styles';

function MembersScreen({ onAbrirCategorias, onAdicionarContato, onSelecionarAba }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    return (
        <MainLayout titulo="Membros" abaAtiva="membros" onSelecionarAba={onSelecionarAba}>
            <ScrollView
                testID="rolagem-members-screen"
                contentContainerStyle={estilos.conteudo}
                showsVerticalScrollIndicator={false}
            >
                <View style={estilos.apresentacao}>
                    <Text style={estilos.titulo}>Rede de Apoio</Text>

                    <Text style={estilos.descricao}>
                        Convide pessoas de confiança e escolha quais informações cada contato poderá
                        visualizar.
                    </Text>
                </View>

                <View style={estilos.acoes}>
                    <ButtonScreen
                        texto="Adicionar novo contato"
                        aoPressionar={onAdicionarContato}
                        variante="laranja"
                        rotuloAcessibilidade="Adicionar novo contato à Rede de Apoio"
                    />

                    <ButtonScreen
                        texto="Categorias de Permissão"
                        aoPressionar={onAbrirCategorias}
                        variante="verde"
                        rotuloAcessibilidade="Abrir categorias de permissão"
                    />
                </View>
            </ScrollView>
        </MainLayout>
    );
}

export { MembersScreen };
