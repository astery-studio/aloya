// Coordena a consulta e a resposta aos convites recebidos da Rede de Apoio.
import { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import {
    BellIcon,
    FunnelIcon,
    WarningCircleIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { ContactList } from '../../components/ContactList/ContactList';
import { ContactFiltersModal } from '../../components/ContactFiltersModal/ContactFiltersModal';
import { ContactPermissionsSummaryModal } from '../../components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal';
import { SupportNetworkModeSelector } from '../../components/SupportNetworkModeSelector/SupportNetworkModeSelector';
import { useReceivedContacts } from '../../hooks/useReceivedContacts';
import {
    criarFiltrosVazios,
    criarRotuloFiltros,
    filtrarContatos,
    filtrosPossuemSelecao
} from '../MembersScreen';
import { criarEstilos } from './ReceivedContactsScreen.styles';

function obterNomeContato(contato) {
    const candidatos = [contato?.identificacao, contato?.nome, contato?.email];

    const identificacao = candidatos.find(
        (valor) => typeof valor === 'string' && valor.trim().length > 0
    );

    return identificacao?.trim() ?? 'Contato';
}

function ReceivedContactsScreen({
    service,
    onVoltar,
    onSelecionarAba,
    onSessaoExpirada,
    exibirSeletor = false,
    modoRede = 'acompanhados',
    onSelecionarModoRede
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const [contatoResumo, definirContatoResumo] = useState(null);

    const [conviteParaRecusar, definirConviteParaRecusar] = useState(null);

    const [ultimaAcao, definirUltimaAcao] = useState(null);
    const [filtros, definirFiltros] = useState(criarFiltrosVazios);
    const [filtrosAbertos, definirFiltrosAbertos] = useState(false);

    const estado = useReceivedContacts({
        service,
        onSessaoExpirada
    });

    const executarResposta = useCallback(
        async (acao, contato) => {
            if (!contato?.id) {
                return false;
            }

            definirUltimaAcao({
                acao,
                contato
            });

            return estado.responder(contato.id, acao);
        },
        [estado]
    );

    const tratarAcao = useCallback(
        (acao, contato) => {
            if (acao === 'aceitar') {
                void executarResposta('aceitar', contato);

                return;
            }

            if (acao === 'recusar') {
                definirConviteParaRecusar(contato);
            }
        },
        [executarResposta]
    );

    const confirmarRecusa = useCallback(() => {
        const contato = conviteParaRecusar;

        if (!contato) {
            return;
        }

        definirConviteParaRecusar(null);

        void executarResposta('recusar', contato);
    }, [conviteParaRecusar, executarResposta]);

    const cancelarRecusa = useCallback(() => {
        if (estado.acaoEmAndamento) {
            return;
        }

        definirConviteParaRecusar(null);
    }, [estado.acaoEmAndamento]);

    const abrirResumo = useCallback((contato) => {
        definirContatoResumo(contato);
    }, []);

    const fecharResumo = useCallback(() => {
        definirContatoResumo(null);
    }, []);

    const fecharResultado = useCallback(() => {
        estado.limparResultado();
        definirUltimaAcao(null);
    }, [estado]);

    const fecharErro = useCallback(() => {
        estado.limparResultado();
    }, [estado]);

    const tentarNovamente = useCallback(() => {
        if (!ultimaAcao?.contato?.id) {
            estado.limparResultado();
            return;
        }

        estado.limparResultado();

        void executarResposta(ultimaAcao.acao, ultimaAcao.contato);
    }, [estado, executarResposta, ultimaAcao]);

    const nomeConviteRecusado = obterNomeContato(conviteParaRecusar);

    const resumoVisivel = contatoResumo !== null;

    const categorias = useMemo(() => {
        const categoriasPorId = new Map();

        for (const contato of estado.contatos) {
            const categoria = contato?.vinculo?.categoria;

            if (categoria?.id !== null && categoria?.id !== undefined && categoria?.nome) {
                categoriasPorId.set(String(categoria.id), categoria);
            }
        }

        return [...categoriasPorId.values()];
    }, [estado.contatos]);

    const contatosVisiveis = useMemo(
        () => filtrarContatos(estado.contatos, filtros),
        [estado.contatos, filtros]
    );
    const possuiFiltros = filtrosPossuemSelecao(filtros);
    const rotuloFiltros = useMemo(
        () => criarRotuloFiltros(filtros, categorias),
        [categorias, filtros]
    );

    const acaoFiltro = (
        <IconButton
            icone={FunnelIcon}
            aoPressionar={() => definirFiltrosAbertos(true)}
            rotuloAcessibilidade="Filtrar contatos acompanhados"
            variante="redeApoio"
            corIcone={tema.cores.interface.destaque}
        />
    );

    return (
        <>
            <MainLayout
                titulo={exibirSeletor ? 'Rede de Apoio' : 'Contatos'}
                varianteHeader={exibirSeletor ? 'redeApoio' : onVoltar ? 'comVoltar' : 'padrao'}
                acoesHeader={exibirSeletor ? acaoFiltro : null}
                onVoltar={onVoltar}
                abaAtiva="membros"
                onSelecionarAba={onSelecionarAba}
            >
                <View testID="received-contacts-screen" style={estilos.tela}>
                    <View style={estilos.lista}>
                        <ContactList
                            contatos={contatosVisiveis}
                            perspectiva="recebido"
                            carregando={estado.carregando}
                            atualizando={estado.atualizando}
                            erro={estado.erro}
                            filtroAtivo={possuiFiltros}
                            rotuloFiltro={rotuloFiltros}
                            aoAcao={tratarAcao}
                            aoAbrirResumo={abrirResumo}
                            aoTentarNovamente={estado.tentarNovamente}
                            contatoEmAndamentoId={estado.contatoEmAndamentoId}
                            acaoEmAndamento={estado.acaoEmAndamento}
                            desabilitado={Boolean(estado.acaoEmAndamento)}
                            cabecalho={
                                <View style={estilos.apresentacao}>
                                    <Text style={estilos.descricao}>
                                        Pessoas que contam com você como parte da sua rede de
                                        cuidado e apoio.
                                    </Text>

                                    {exibirSeletor ? (
                                        <SupportNetworkModeSelector
                                            selecionado={modoRede}
                                            aoSelecionar={onSelecionarModoRede}
                                        />
                                    ) : null}

                                    {possuiFiltros ? (
                                        <ButtonScreen
                                            texto="Limpar filtros"
                                            variante="bordaLaranja"
                                            aoPressionar={() =>
                                                definirFiltros(criarFiltrosVazios())
                                            }
                                            rotuloAcessibilidade="Limpar filtros de contatos acompanhados"
                                            estilo={estilos.botaoLimpar}
                                            estiloTexto={estilos.textoBotaoLimpar}
                                        />
                                    ) : null}
                                </View>
                            }
                        />
                    </View>
                </View>
            </MainLayout>

            <ContactFiltersModal
                visivel={filtrosAbertos}
                filtros={filtros}
                categorias={categorias}
                aoAplicar={(novosFiltros) => {
                    definirFiltros(novosFiltros);
                    definirFiltrosAbertos(false);
                }}
                aoFechar={() => definirFiltrosAbertos(false)}
            />

            <ContactPermissionsSummaryModal
                visivel={resumoVisivel}
                perspectiva="recebido"
                nomeContato={obterNomeContato(contatoResumo)}
                permissoes={contatoResumo?.vinculo?.permissoes ?? []}
                vinculo={
                    contatoResumo?.vinculo ?? {
                        tipo: 'individual'
                    }
                }
                aoFechar={fecharResumo}
            />

            <SimpleModal
                visivel={conviteParaRecusar !== null}
                aoFechar={cancelarRecusa}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Recusar Convite"
                mensagem={`Você tem certeza que deseja recusar o convite de ${nomeConviteRecusado}? Esta ação não pode ser desfeita.`}
                acaoPrincipal={{
                    texto: 'Recusar',
                    variante: 'verde',
                    aoPressionar: confirmarRecusa,
                    carregando: estado.acaoEmAndamento === 'recusar'
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: cancelarRecusa,
                    desativado: Boolean(estado.acaoEmAndamento)
                }}
            />

            <SimpleModal
                visivel={estado.resultadoAcao !== null}
                aoFechar={fecharResultado}
                icone={BellIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo={estado.resultadoAcao?.mensagem ?? ''}
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: fecharResultado
                }}
            />

            <SimpleModal
                erroInterno
                visivel={estado.erroAcao !== null}
                aoFechar={fecharErro}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={estado.erroAcao}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: tentarNovamente,
                    carregando: Boolean(estado.acaoEmAndamento)
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: fecharErro,
                    desativado: Boolean(estado.acaoEmAndamento)
                }}
            />
        </>
    );
}

export { ReceivedContactsScreen, obterNomeContato };
