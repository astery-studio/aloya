//Apresenta identificação, vínculo, status e ações de um contato.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ArrowsClockwiseIcon,
    CheckCircleIcon,
    ClockIcon,
    EnvelopeIcon,
    HandshakeIcon,
    HourglassLowIcon,
    InfoIcon,
    PencilSimpleIcon,
    TrashIcon,
    XCircleIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import { ContactStatusBadge } from '../ContactStatusBadge/ContactStatusBadge';
import { criarEstilos } from './ContactCard.styles';

const PERSPECTIVAS = Object.freeze(['enviado', 'recebido']);

const ESTADOS_SUPORTADOS = new Set(['pendente', 'ativo', 'inativo', 'recusado']);

const TAMANHO_ICONE_INFORMACAO = 13;

const CORES_INFORMACOES = Object.freeze({
    email: '#B07D2A',
    vinculo: '#C85A44',
    data: '#2C4C3B',
    aguardando: '#4A758E'
});

function normalizarPerspectiva(perspectiva) {
    return PERSPECTIVAS.includes(perspectiva) ? perspectiva : 'enviado';
}

function normalizarEstado(estado) {
    return ESTADOS_SUPORTADOS.has(estado) ? estado : 'inativo';
}

function obterIdentificacao(contato) {
    const candidatos = [contato?.identificacao, contato?.nome, contato?.email];

    const identificacao = candidatos.find(
        (valor) => typeof valor === 'string' && valor.trim().length > 0
    );

    return identificacao?.trim() ?? 'Contato';
}

function obterVinculoSeguro(vinculo) {
    if (vinculo?.tipo === 'categoria' && (vinculo.nomeCategoria || vinculo.categoria?.nome)) {
        return vinculo;
    }

    return Object.freeze({
        tipo: 'individual'
    });
}

function formatarDataConvite(valor) {
    const data = valor instanceof Date ? valor : new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return 'Data não informada';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(data);
}

function obterRotuloVinculo(vinculo) {
    if (vinculo?.tipo === 'categoria') {
        const nome = vinculo.nomeCategoria ?? vinculo.categoria?.nome;

        if (typeof nome === 'string' && nome.trim().length > 0) {
            return nome.trim();
        }
    }

    return 'Permissões Individuais';
}

function LinhaInformacao({ icone: Icone, corIcone, identificador, rotulo, valor, estilos }) {
    return (
        <View style={estilos.linhaInformacao}>
            <Icone
                testID={`contact-info-icon-${identificador}`}
                color={corIcone}
                size={TAMANHO_ICONE_INFORMACAO}
                weight="regular"
            />

            <Text numberOfLines={1} ellipsizeMode="tail" style={estilos.textoInformacao}>
                <Text style={estilos.rotuloInformacao}>{rotulo}: </Text>
                <Text style={estilos.valorInformacao}>{valor}</Text>
            </Text>
        </View>
    );
}

function ContactCard({
    contato,
    perspectiva = 'enviado',
    aoAcao,
    aoAbrirResumo,
    acaoEmAndamento = null,
    desabilitado = false
}) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const perspectivaSegura = normalizarPerspectiva(perspectiva);

    const estado = normalizarEstado(contato?.status);

    const identificacao = obterIdentificacao(contato);

    const vinculo = obterVinculoSeguro(contato?.vinculo);

    const rotuloVinculo = obterRotuloVinculo(vinculo);

    const email = typeof contato?.email === 'string' ? contato.email.trim() : '';

    const dataConvite = formatarDataConvite(contato?.dataConvite ?? contato?.dataEnvio);

    const rotuloEspera =
        typeof contato?.aguardando?.rotulo === 'string' ? contato.aguardando.rotulo.trim() : '';

    const processando = typeof acaoEmAndamento === 'string' && acaoEmAndamento.length > 0;

    const bloqueado = desabilitado || processando;

    const conviteRecebidoPendente = perspectivaSegura === 'recebido' && estado === 'pendente';

    const conviteEnviadoPendente = perspectivaSegura === 'enviado' && estado === 'pendente';

    const contatoEnviadoAtivo = perspectivaSegura === 'enviado' && estado === 'ativo';

    function executarAcao(acao) {
        if (bloqueado || typeof aoAcao !== 'function') {
            return;
        }

        aoAcao(acao, contato);
    }

    function abrirResumo() {
        if (bloqueado || typeof aoAbrirResumo !== 'function') {
            return;
        }

        aoAbrirResumo(contato);
    }

    return (
        <View
            testID="contact-card"
            accessible={false}
            style={[estilos.cartao, bloqueado && estilos.cartaoDesabilitado]}
        >
            <View style={estilos.cabecalho}>
                <View style={estilos.identidade}>
                    <ContactAvatar
                        iconeId={contato?.iconeId ?? 'pessoa'}
                        corId={contato?.corId ?? 'branco'}
                        tamanho="pequeno"
                        rotuloAcessibilidade={`Identificação visual de ${identificacao}`}
                    />

                    <Text numberOfLines={1} ellipsizeMode="tail" style={estilos.nome}>
                        {identificacao}
                    </Text>
                </View>

                {perspectivaSegura === 'enviado' ? (
                    <View style={estilos.acoesCompactas}>
                        {contatoEnviadoAtivo ? (
                            <IconButton
                                icone={PencilSimpleIcon}
                                aoPressionar={() => executarAcao('alterar_vinculo')}
                                rotuloAcessibilidade={`Alterar vínculo de ${identificacao}`}
                                desativado={bloqueado}
                            />
                        ) : null}

                        {conviteEnviadoPendente ? (
                            <IconButton
                                icone={ArrowsClockwiseIcon}
                                aoPressionar={() => executarAcao('reenviar')}
                                rotuloAcessibilidade={`Reenviar convite para ${identificacao}`}
                                desativado={bloqueado}
                            />
                        ) : null}

                        <IconButton
                            icone={TrashIcon}
                            aoPressionar={() => executarAcao('remover')}
                            rotuloAcessibilidade={`Remover ${identificacao}`}
                            variante="perigo"
                            desativado={bloqueado}
                        />
                    </View>
                ) : null}
            </View>

            <View style={estilos.informacoes}>
                <View style={estilos.containerTituloSecao}>
                    <Text style={estilos.tituloSecao}>INFORMAÇÕES DO CONTATO</Text>
                </View>

                <View style={estilos.caixaInformacoes}>
                    {email ? (
                        <LinhaInformacao
                            icone={EnvelopeIcon}
                            corIcone={CORES_INFORMACOES.email}
                            identificador="email"
                            rotulo="E-mail"
                            valor={email}
                            estilos={estilos}
                        />
                    ) : null}

                    <LinhaInformacao
                        icone={HandshakeIcon}
                        corIcone={CORES_INFORMACOES.vinculo}
                        identificador="vinculo"
                        rotulo="Vínculo solicitado"
                        valor={rotuloVinculo}
                        estilos={estilos}
                    />

                    <LinhaInformacao
                        icone={ClockIcon}
                        corIcone={CORES_INFORMACOES.data}
                        identificador="data"
                        rotulo="Data de envio"
                        valor={dataConvite}
                        estilos={estilos}
                    />

                    {rotuloEspera ? (
                        <LinhaInformacao
                            icone={HourglassLowIcon}
                            corIcone={CORES_INFORMACOES.aguardando}
                            identificador="aguardando"
                            rotulo="Aguardando"
                            valor={rotuloEspera.replace(/^Aguardando\s*/u, '')}
                            estilos={estilos}
                        />
                    ) : null}
                </View>
            </View>

            {estado === 'pendente' ? (
                <View style={estilos.containerTituloPendente}>
                    <Text style={estilos.tituloPendente}>CONVITE PENDENTE</Text>
                </View>
            ) : (
                <View style={estilos.estado}>
                    <ContactStatusBadge estado={estado} compacto />
                </View>
            )}

            {conviteRecebidoPendente ? (
                <View style={estilos.acoesRecebidas}>
                    <View style={estilos.linhaAcoesRecebidas}>
                        <View style={estilos.acaoRecebida}>
                            <ButtonScreen
                                texto="Aceitar"
                                variante="verde"
                                icone={CheckCircleIcon}
                                tamanhoIcone={16}
                                corConteudo="#FFFFFF"
                                aoPressionar={() => executarAcao('aceitar')}
                                rotuloAcessibilidade={`Aceitar convite de ${identificacao}`}
                                carregando={acaoEmAndamento === 'aceitar'}
                                desativado={bloqueado}
                                estilo={estilos.botaoRecebido}
                                estiloTexto={estilos.textoBotao}
                            />
                        </View>

                        <View style={estilos.acaoRecebida}>
                            <ButtonScreen
                                texto="Recusar"
                                variante="verde"
                                icone={XCircleIcon}
                                tamanhoIcone={16}
                                corConteudo="#FFFFFF"
                                aoPressionar={() => executarAcao('recusar')}
                                rotuloAcessibilidade={`Recusar convite de ${identificacao}`}
                                carregando={acaoEmAndamento === 'recusar'}
                                desativado={bloqueado}
                                estilo={estilos.botaoRecebido}
                                estiloTexto={estilos.textoBotao}
                            />
                        </View>
                    </View>
                </View>
            ) : null}

            <ButtonScreen
                texto="Resumo de Permissões"
                variante="laranja"
                icone={InfoIcon}
                tamanhoIcone={13}
                corConteudo="#FFFFFF"
                aoPressionar={abrirResumo}
                rotuloAcessibilidade={`Abrir resumo de permissões de ${identificacao}`}
                desativado={bloqueado || typeof aoAbrirResumo !== 'function'}
                estilo={estilos.botaoResumo}
                estiloTexto={estilos.textoBotao}
            />
        </View>
    );
}

export {
    CORES_INFORMACOES,
    ContactCard,
    TAMANHO_ICONE_INFORMACAO,
    formatarDataConvite,
    normalizarEstado,
    normalizarPerspectiva,
    obterIdentificacao,
    obterRotuloVinculo,
    obterVinculoSeguro
};
