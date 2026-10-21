//Orquestra a edição e a remoção segura de um anticoncepcional já cadastrado.
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { PillIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { Header } from '../../../shared/components/navigation/Header/Header';
import { tema } from '../../../shared/theme';
import { ContraceptiveForm } from '../forms/ContraceptiveForm';
import { estilos } from './contraceptiveScreens.styles';

//Recebe o registro atual e as ações externas e controla todos os estados da tela.
function EditContraceptiveScreen({
    anticoncepcional,
    aoAtualizar,
    aoExcluir,
    aoVoltar
}) {
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [confirmacaoExclusaoVisivel, setConfirmacaoExclusaoVisivel] = useState(false);
    const [erroExclusaoVisivel, setErroExclusaoVisivel] = useState(false);
    const [sucesso, setSucesso] = useState(null);
    const operacaoEmAndamento = useRef(null);
    const telaMontada = useRef(true);
    const ocupado = salvando || excluindo;
    const registroValido = anticoncepcional && typeof anticoncepcional === 'object' && anticoncepcional.id;

    //Registra quando a tela deixa de existir para evitar atualizações de estado atrasadas.
    useEffect(() => {
        telaMontada.current = true;

        return () => {
            telaMontada.current = false;
        };
    }, []);

    //Envia a atualização uma única vez e permite que o formulário trate a falha.
    async function atualizar(dadosAtualizados) {
        if (operacaoEmAndamento.current || typeof aoAtualizar !== 'function') return false;

        operacaoEmAndamento.current = 'atualizacao';
        setSalvando(true);

        try {
            await aoAtualizar(dadosAtualizados);

            if (!telaMontada.current) return false;

            setSucesso('atualizacao');
            return true;
        } catch (erro) {
            throw erro;
        } finally {
            operacaoEmAndamento.current = null;

            if (telaMontada.current) {
                setSalvando(false);
            }
        }
    }

    //Abre a confirmação sem executar a remoção imediatamente.
    function solicitarExclusao() {
        if (operacaoEmAndamento.current || ocupado || typeof aoExcluir !== 'function') return;

        setErroExclusaoVisivel(false);
        setConfirmacaoExclusaoVisivel(true);
    }

    //Remove somente depois da confirmação explícita da pessoa usuária.
    async function confirmarExclusao() {
        if (operacaoEmAndamento.current || typeof aoExcluir !== 'function' || !registroValido) return false;

        operacaoEmAndamento.current = 'exclusao';
        setExcluindo(true);
        setErroExclusaoVisivel(false);

        try {
            await aoExcluir(anticoncepcional.id);

            if (!telaMontada.current) return false;

            setConfirmacaoExclusaoVisivel(false);
            setSucesso('exclusao');
            return true;
        } catch {
            if (telaMontada.current) {
                setConfirmacaoExclusaoVisivel(false);
                setErroExclusaoVisivel(true);
            }

            return false;
        } finally {
            operacaoEmAndamento.current = null;

            if (telaMontada.current) {
                setExcluindo(false);
            }
        }
    }

    //Fecha o sucesso e retorna para a listagem, que já terá sido atualizada pelo fluxo.
    function concluirSucesso() {
        if (operacaoEmAndamento.current) return;

        setSucesso(null);
        aoVoltar?.();
    }

    if (!registroValido) {
        return (
            <View style={estilos.tela}>
                <Header
                    titulo="Editar o Anticoncepcional"
                    variante="comVoltar"
                    onVoltar={aoVoltar}
                />

                <View style={estilos.vazio}>
                    <Text
                        accessibilityRole="header"
                        style={estilos.tituloVazio}
                    >
                        Anticoncepcional indisponível
                    </Text>

                    <Text
                        accessibilityRole="alert"
                        style={estilos.textoVazio}
                    >
                        Não foi possível carregar os dados para edição.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={estilos.tela}>
            <Header
                titulo="Editar o Anticoncepcional"
                variante="comVoltar"
                onVoltar={ocupado ? undefined : aoVoltar}
            />

            <ScrollView
                contentContainerStyle={estilos.conteudoFormulario}
                keyboardShouldPersistTaps="handled"
            >
                <ContraceptiveForm
                    anticoncepcional={anticoncepcional}
                    onSubmit={typeof aoAtualizar === 'function' ? atualizar : undefined}
                    salvando={salvando}
                />

                <Pressable
                    onPress={solicitarExclusao}
                    disabled={ocupado || typeof aoExcluir !== 'function'}
                    accessibilityRole="button"
                    accessibilityLabel="Apagar medicação"
                    accessibilityHint="Abre a confirmação antes de remover o anticoncepcional"
                    accessibilityState={{
                        disabled: ocupado || typeof aoExcluir !== 'function',
                        busy: excluindo
                    }}
                    style={({ pressed }) => [
                        estilos.acaoExcluir,
                        pressed && estilos.acaoPressionada,
                        (ocupado || typeof aoExcluir !== 'function') && estilos.acaoDesabilitada
                    ]}
                >
                    <Text style={estilos.textoExcluir}>
                        Apagar medicação
                    </Text>
                </Pressable>
            </ScrollView>

            <SimpleModal
                visivel={confirmacaoExclusaoVisivel}
                aoFechar={excluindo ? undefined : () => setConfirmacaoExclusaoVisivel(false)}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Apagar anticoncepcional"
                mensagem="Tem certeza que deseja remover este anticoncepcional? Os alertas programados para ele serão cancelados."
                acaoPrincipal={{
                    texto: 'Remover',
                    variante: 'verde',
                    aoPressionar: confirmarExclusao,
                    carregando: excluindo,
                    desativado: excluindo
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: () => setConfirmacaoExclusaoVisivel(false),
                    desativado: excluindo
                }}
            />

            <SimpleModal
                visivel={erroExclusaoVisivel}
                aoFechar={excluindo ? undefined : () => setErroExclusaoVisivel(false)}
                icone={WarningCircleIcon}
                corIcone={tema.cores.neutras.textoSecundarioClaro}
                fundoIcone="#EDEDED"
                titulo="Algo deu errado"
                mensagem="Ocorreu um erro ao deletar. Verifique sua conexão e tente novamente."
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: confirmarExclusao,
                    carregando: excluindo,
                    desativado: excluindo
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: () => setErroExclusaoVisivel(false),
                    desativado: excluindo
                }}
            />

            <SimpleModal
                visivel={Boolean(sucesso)}
                aoFechar={concluirSucesso}
                icone={PillIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo={sucesso === 'exclusao'
                    ? 'Anticoncepcional removido com sucesso'
                    : 'Anticoncepcional atualizado com sucesso'}
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: concluirSucesso
                }}
            />
        </View>
    );
}

export { EditContraceptiveScreen };