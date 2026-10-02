//Oferece um acesso provisório e simples para testar as HU-021 e HU-022 com a API real.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { EditContraceptiveScreen } from '../screens/EditContraceptiveScreen';
import { estilos } from './ContraceptiveHuTestAccess.styles';

//Recebe um item e retorna uma chave estável para a lista provisória.
function extrairChave(item) {
    return String(item.id);
}

//Recebe o serviço real e permite selecionar, editar e remover um registro.
function ContraceptiveHuTestAccess({
    service,
    onVoltar,
    onSessaoExpirada
}) {
    const [itens, setItens] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    //Informa ao aplicativo quando a API rejeita a sessão atual.
    function tratarSessaoExpirada(falha) {
        if (falha?.status !== 401) return false;

        onSessaoExpirada?.();
        return true;
    }

    //Busca os anticoncepcionais reais sem manter requisições depois que a tela fecha.
    const carregar = useCallback(async (signal) => {
        setCarregando(true);
        setErro(null);

        try {
            if (typeof service?.listar !== 'function') {
                throw new Error('Serviço de anticoncepcionais indisponível.');
            }

            const registros = await service.listar({
                signal
            });

            if (!signal?.aborted) {
                setItens(registros);
            }
        } catch (falha) {
            if (falha?.name === 'AbortError' || signal?.aborted) return;
            if (tratarSessaoExpirada(falha)) return;

            setErro(
                falha?.mensagemUsuario
                || 'Não foi possível carregar os anticoncepcionais.'
            );
        } finally {
            if (!signal?.aborted) {
                setCarregando(false);
            }
        }
    }, [service, onSessaoExpirada]);

    useEffect(() => {
        const controlador = new AbortController();

        carregar(controlador.signal);

        return () => controlador.abort();
    }, [carregar]);

    //Atualiza o registro selecionado e substitui somente esse item na lista provisória.
    async function atualizar(dadosAtualizados) {
        const id = selecionado?.id;

        if (!id || typeof service?.editar !== 'function') {
            throw new Error('Não foi possível identificar o anticoncepcional.');
        }

        try {
            const atualizado = await service.editar(id, dadosAtualizados);

            if (!atualizado || String(atualizado.id) !== String(id)) {
                throw new Error('A resposta da atualização é inválida.');
            }

            setItens((atuais) => atuais.map((item) => (
                item.id === id
                    ? atualizado
                    : item
            )));

            setSelecionado(atualizado);
            return atualizado;
        } catch (falha) {
            tratarSessaoExpirada(falha);
            throw falha;
        }
    }

    //Remove o registro selecionado da API e da lista provisória.
    async function excluir(idRecebido) {
        const id = selecionado?.id;

        if (!id || String(idRecebido) !== String(id) || typeof service?.remover !== 'function') {
            throw new Error('Não foi possível identificar o anticoncepcional.');
        }

        try {
            const removido = await service.remover(id);

            if (!removido || String(removido.id) !== String(id)) {
                throw new Error('A resposta da remoção é inválida.');
            }

            setItens((atuais) => atuais.filter((item) => item.id !== id));
            return removido;
        } catch (falha) {
            tratarSessaoExpirada(falha);
            throw falha;
        }
    }

    //Mostra um botão simples para acessar a edição do item.
    const renderizarItem = useCallback(({
        item
    }) => (
        <Pressable
            onPress={() => setSelecionado(item)}
            accessibilityRole="button"
            accessibilityLabel={`Editar ${item.nome}`}
            accessibilityHint="Abre o teste das histórias 21 e 22"
            style={({ pressed }) => [
                estilos.item,
                pressed && estilos.itemPressionado
            ]}
        >
            <Text style={estilos.nome}>
                {item.nome}
            </Text>

            <Text style={estilos.acao}>
                Editar ou apagar
            </Text>
        </Pressable>
    ), []);

    if (selecionado) {
        return (
            <EditContraceptiveScreen
                anticoncepcional={selecionado}
                aoAtualizar={atualizar}
                aoExcluir={excluir}
                aoVoltar={() => setSelecionado(null)}
            />
        );
    }

    let conteudo;

    if (carregando) {
        conteudo = (
            <View style={estilos.estado}>
                <ActivityIndicator />

                <Text style={estilos.textoEstado}>
                    Carregando anticoncepcionais...
                </Text>
            </View>
        );
    } else if (erro) {
        conteudo = (
            <View style={estilos.estado}>
                <Text
                    accessibilityRole="alert"
                    style={estilos.textoEstado}
                >
                    {erro}
                </Text>

                <ButtonScreen
                    texto="Tentar novamente"
                    variante="preto"
                    aoPressionar={() => carregar()}
                />
            </View>
        );
    } else {
        conteudo = (
            <FlatList
                data={itens}
                keyExtractor={extrairChave}
                renderItem={renderizarItem}
                contentContainerStyle={estilos.lista}
                ListEmptyComponent={(
                    <Text style={estilos.textoEstado}>
                        Nenhum anticoncepcional disponível. Cadastre um pelo fluxo da HU-020 para testar.
                    </Text>
                )}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={5}
            />
        );
    }

    return (
        <View style={estilos.tela}>
            <Header
                titulo="Teste HU-021 e HU-022"
                variante="comVoltar"
                onVoltar={onVoltar}
            />

            {conteudo}
        </View>
    );
}

export { ContraceptiveHuTestAccess };