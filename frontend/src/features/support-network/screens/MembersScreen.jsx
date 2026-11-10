//Apresenta e gerencia a lista de contatos da Rede de Apoio.
import { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import {
    BellIcon,
    FunnelIcon,
    UserCircleGearIcon,
    WarningCircleIcon
} from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { ContactFiltersModal } from '../components/ContactFiltersModal/ContactFiltersModal';
import { ContactList } from '../components/ContactList/ContactList';
import { ContactPermissionsSummaryModal } from '../components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal';
import { useSupportCategories } from '../hooks/useSupportCategories';
import { useSupportContacts } from '../hooks/useSupportContacts';
import { criarEstilos } from './MembersScreen.styles';

function criarFiltrosVazios() {
    return {
        estados: [],
        categoriaIds: [],
        permissaoIndividual: false
    };
}

function filtrosPossuemSelecao(filtros) {
    return Boolean(
        filtros?.estados?.length || filtros?.categoriaIds?.length || filtros?.permissaoIndividual
    );
}

function idsIguais(primeiroId, segundoId) {
    return (
        primeiroId !== null &&
        primeiroId !== undefined &&
        segundoId !== null &&
        segundoId !== undefined &&
        String(primeiroId) === String(segundoId)
    );
}

function contatoAtendeFiltroEstado(contato, estados) {
    if (!Array.isArray(estados) || estados.length === 0) {
        return true;
    }

    return estados.includes(contato.status);
}

function contatoAtendeFiltroPermissao(contato, filtros) {
    const categoriaIds = Array.isArray(filtros?.categoriaIds) ? filtros.categoriaIds : [];

    const filtraIndividual = filtros?.permissaoIndividual === true;

    const possuiFiltroPermissao = categoriaIds.length > 0 || filtraIndividual;

    if (!possuiFiltroPermissao) {
        return true;
    }

    const vinculo = contato?.vinculo;

    if (filtraIndividual && vinculo?.tipo === 'individual') {
        return true;
    }

    if (vinculo?.tipo !== 'categoria') {
        return false;
    }

    return categoriaIds.some((categoriaId) => idsIguais(categoriaId, vinculo?.categoria?.id));
}

function filtrarContatos(contatos, filtros) {
    if (!Array.isArray(contatos)) {
        return [];
    }

    return contatos.filter(
        (contato) =>
            contatoAtendeFiltroEstado(contato, filtros?.estados) &&
            contatoAtendeFiltroPermissao(contato, filtros)
    );
}

function obterNomeContato(contato) {
    const candidatos = [contato?.identificacao, contato?.nome, contato?.email];

    const nome = candidatos.find((valor) => typeof valor === 'string' && valor.trim().length > 0);

    return nome?.trim() ?? 'Contato';
}

function MembersScreen({
    service,
    categoriasService,
    onAbrirCategorias,
    onAdicionarContato,
    onSelecionarAba,
    onSessaoExpirada
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const estado = useSupportContacts({
        service,
        onSessaoExpirada
    });

    const estadoCategorias = useSupportCategories({
        service: categoriasService,
        onSessaoExpirada
    });

    const [filtros, setFiltros] = useState(criarFiltrosVazios);

    const [filtrosAbertos, setFiltrosAbertos] = useState(false);

    const [contatoResumo, setContatoResumo] = useState(null);

    const [contatoUltimoReenvio, setContatoUltimoReenvio] = useState(null);

    const possuiFiltros = filtrosPossuemSelecao(filtros);

    const contatosVisiveis = useMemo(
        () => filtrarContatos(estado.contatos, filtros),
        [estado.contatos, filtros]
    );

    function abrirFiltros() {
        setFiltrosAbertos(true);
    }

    function fecharFiltros() {
        setFiltrosAbertos(false);
    }

    function aplicarFiltros(novosFiltros) {
        setFiltros({
            estados: Array.isArray(novosFiltros?.estados) ? novosFiltros.estados : [],
            categoriaIds: Array.isArray(novosFiltros?.categoriaIds)
                ? novosFiltros.categoriaIds
                : [],
            permissaoIndividual: novosFiltros?.permissaoIndividual === true
        });

        fecharFiltros();
    }

    function limparFiltros() {
        setFiltros(criarFiltrosVazios());
    }

    function abrirResumo(contato) {
        setContatoResumo(contato);
    }

    function fecharResumo() {
        setContatoResumo(null);
    }

    function reenviarConvite(contato) {
        setContatoUltimoReenvio(contato);

        return estado.reenviarConvite(contato.id);
    }

    function tratarAcao(acao, contato) {
        if (acao === 'reenviar') {
            reenviarConvite(contato);
            return;
        }

        if (acao === 'alterar_vinculo') {
            Alert.alert(
                'Alterar vínculo',
                `O vínculo de ${obterNomeContato(contato)} será alterado pelo fluxo da HU-030.`
            );

            return;
        }

        if (acao === 'remover') {
            Alert.alert(
                contato?.status === 'pendente' ? 'Cancelar convite' : 'Remover contato',
                contato?.status === 'pendente'
                    ? `O convite de ${obterNomeContato(
                          contato
                      )} será cancelado pelo fluxo da HU-031.`
                    : `${obterNomeContato(contato)} será removido pelo fluxo da HU-031.`
            );
        }
    }

    function fecharResultado() {
        setContatoUltimoReenvio(null);
        estado.limparResultadoAcao();
    }

    function repetirReenvio() {
        if (!contatoUltimoReenvio) {
            fecharResultado();
            return;
        }

        reenviarConvite(contatoUltimoReenvio);
    }

    const acoesCabecalho = (
        <>
            <IconButton
                icone={FunnelIcon}
                aoPressionar={abrirFiltros}
                rotuloAcessibilidade="Filtrar contatos"
                variante="redeApoio"
                corIcone={tema.cores.interface.destaque}
            />

            <IconButton
                icone={UserCircleGearIcon}
                aoPressionar={onAbrirCategorias}
                rotuloAcessibilidade="Abrir categorias de permissão"
                variante="redeApoio"
                corIcone={tema.cores.marca.primaria}
            />
        </>
    );

    return (
        <>
            <MainLayout
                titulo="Rede de Apoio"
                varianteHeader="redeApoio"
                acoesHeader={acoesCabecalho}
                abaAtiva="membros"
                onSelecionarAba={onSelecionarAba}
            >
                <View testID="members-screen" style={estilos.container}>
                    <View style={estilos.areaLista}>
                        <ContactList
                            contatos={contatosVisiveis}
                            perspectiva="enviado"
                            carregando={estado.carregando}
                            atualizando={estado.atualizando}
                            erro={estado.erro}
                            filtroAtivo={possuiFiltros}
                            aoAcao={tratarAcao}
                            aoAbrirResumo={abrirResumo}
                            aoTentarNovamente={estado.atualizarLista}
                            contatoEmAndamentoId={estado.contatoEmAndamentoId}
                            acaoEmAndamento={estado.acaoEmAndamento}
                            desabilitado={Boolean(estado.acaoEmAndamento)}
                            cabecalho={
                                <View style={estilos.apresentacao}>
                                    <Text style={estilos.descricao}>
                                        Pessoas que fazem parte da sua rede de cuidado e apoio.
                                    </Text>

                                    {possuiFiltros ? (
                                        <ButtonScreen
                                            texto="Limpar filtros"
                                            variante="bordaLaranja"
                                            aoPressionar={limparFiltros}
                                            rotuloAcessibilidade="Limpar filtros de contatos"
                                            estilo={estilos.botaoLimpar}
                                            estiloTexto={estilos.textoBotaoLimpar}
                                        />
                                    ) : null}
                                </View>
                            }
                        />
                    </View>

                    <View style={estilos.acaoPrincipal}>
                        <ButtonScreen
                            texto="Adicionar novo contato"
                            variante="laranja"
                            aoPressionar={onAdicionarContato}
                            rotuloAcessibilidade="Adicionar novo contato à Rede de Apoio"
                            estilo={estilos.botaoAdicionar}
                            estiloTexto={estilos.textoBotaoAdicionar}
                        />
                    </View>
                </View>
            </MainLayout>

            <ContactFiltersModal
                visivel={filtrosAbertos}
                filtros={filtros}
                categorias={estadoCategorias.categorias}
                aoAplicar={aplicarFiltros}
                aoFechar={fecharFiltros}
            />

            <ContactPermissionsSummaryModal
                visivel={contatoResumo !== null}
                perspectiva="enviado"
                nomeContato={obterNomeContato(contatoResumo)}
                permissoes={contatoResumo?.vinculo?.permissoes ?? []}
                vinculo={
                    contatoResumo?.vinculo ?? {
                        tipo: 'individual',
                        categoria: null
                    }
                }
                aoFechar={fecharResumo}
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
                aoFechar={fecharResultado}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={estado.erroAcao}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: repetirReenvio,
                    carregando: Boolean(estado.acaoEmAndamento)
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: fecharResultado,
                    desativado: Boolean(estado.acaoEmAndamento)
                }}
            />
        </>
    );
}

export {
    MembersScreen,
    contatoAtendeFiltroEstado,
    contatoAtendeFiltroPermissao,
    criarFiltrosVazios,
    filtrarContatos,
    filtrosPossuemSelecao,
    idsIguais,
    obterNomeContato
};
