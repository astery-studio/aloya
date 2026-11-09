//Apresenta identificação, vínculo, status e ações de um contato.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { IconButton } from '../../../../shared/components/common/IconButton/IconButton';
import {
    ArrowsClockwiseIcon,
    PencilSimpleIcon,
    TrashIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { ContactAvatar } from '../ContactAvatar/ContactAvatar';
import { ContactPermissionBadge } from '../ContactPermissionBadge/ContactPermissionBadge';
import { ContactStatusBadge } from '../ContactStatusBadge/ContactStatusBadge';
import { criarEstilos } from './ContactCard.styles';

const PERSPECTIVAS = Object.freeze(['enviado', 'recebido']);

const ESTADOS_SUPORTADOS = new Set(['pendente', 'ativo', 'inativo', 'recusado']);

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
                <ContactAvatar
                    iconeId={contato?.iconeId ?? 'pessoa'}
                    corId={contato?.corId ?? 'branco'}
                    tamanho="pequeno"
                    rotuloAcessibilidade={`Identificação visual de ${identificacao}`}
                />

                <Text numberOfLines={1} ellipsizeMode="tail" style={estilos.nome}>
                    {identificacao}
                </Text>

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

            <View style={estilos.divisor} />

            <View style={estilos.informacoes}>
                <Text style={estilos.tituloSecao}>INFORMAÇÕES DO CONTATO</Text>

                {email ? (
                    <View style={estilos.linhaInformacao}>
                        <Text
                            importantForAccessibility="no-hide-descendants"
                            style={estilos.iconeInformacao}
                        >
                            ✉
                        </Text>

                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={estilos.textoInformacao}
                        >
                            <Text style={estilos.rotuloInformacao}>E-mail: </Text>

                            {email}
                        </Text>
                    </View>
                ) : null}

                <View style={estilos.linhaInformacao}>
                    <Text
                        importantForAccessibility="no-hide-descendants"
                        style={estilos.iconeInformacao}
                    >
                        ◇
                    </Text>

                    <Text style={estilos.rotuloInformacao}>Vínculo solicitado:</Text>
                </View>

                <View style={estilos.recuoInformacao}>
                    <ContactPermissionBadge vinculo={vinculo} />
                </View>

                <View style={estilos.linhaInformacao}>
                    <Text
                        importantForAccessibility="no-hide-descendants"
                        style={estilos.iconeInformacao}
                    >
                        ◷
                    </Text>

                    <Text style={estilos.textoInformacao}>
                        <Text style={estilos.rotuloInformacao}>Data de envio do convite: </Text>

                        {dataConvite}
                    </Text>
                </View>

                {rotuloEspera ? (
                    <View style={estilos.linhaInformacao}>
                        <Text
                            importantForAccessibility="no-hide-descendants"
                            style={estilos.iconeInformacao}
                        >
                            ⧖
                        </Text>

                        <Text style={estilos.textoEspera}>{rotuloEspera}</Text>
                    </View>
                ) : null}
            </View>

            <View style={estilos.divisor} />

            <View style={estilos.estado}>
                <ContactStatusBadge estado={estado} />
            </View>

            {conviteRecebidoPendente ? (
                <View style={estilos.acoesRecebidas}>
                    <View style={estilos.linhaAcoesRecebidas}>
                        <View style={estilos.acaoRecebida}>
                            <ButtonScreen
                                texto="Aceitar"
                                variante="verde"
                                aoPressionar={() => executarAcao('aceitar')}
                                rotuloAcessibilidade={`Aceitar convite de ${identificacao}`}
                                carregando={acaoEmAndamento === 'aceitar'}
                                desativado={bloqueado}
                                estilo={estilos.botaoRecebido}
                            />
                        </View>

                        <View style={estilos.acaoRecebida}>
                            <ButtonScreen
                                texto="Recusar"
                                variante="verde"
                                aoPressionar={() => executarAcao('recusar')}
                                rotuloAcessibilidade={`Recusar convite de ${identificacao}`}
                                carregando={acaoEmAndamento === 'recusar'}
                                desativado={bloqueado}
                                estilo={estilos.botaoRecebido}
                            />
                        </View>
                    </View>
                </View>
            ) : null}

            <ButtonScreen
                texto="Resumo de Permissões"
                variante="laranja"
                aoPressionar={abrirResumo}
                rotuloAcessibilidade={`Abrir resumo de permissões de ${identificacao}`}
                desativado={bloqueado || typeof aoAbrirResumo !== 'function'}
                estilo={estilos.botaoResumo}
            />
        </View>
    );
}

export {
    ContactCard,
    formatarDataConvite,
    normalizarEstado,
    normalizarPerspectiva,
    obterIdentificacao,
    obterVinculoSeguro
};
