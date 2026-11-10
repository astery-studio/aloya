//Apresenta, somente para leitura, as permissões efetivas de um vínculo.
import { useMemo } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ButtonPopup from '../../../../shared/components/common/Button/ButtonPopup/ButtonPopup';
import AppModal from '../../../../shared/components/feedback/Modal/ModalBase/AppModal';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { gruposPermissoes, permissoesGerais } from '../../constants/permissionOptions';
import { ContactPermissionBadge } from '../ContactPermissionBadge/ContactPermissionBadge';
import { criarEstilos } from './ContactPermissionsSummaryModal.styles';

const permissoesConhecidas = new Set([
    ...permissoesGerais.map((permissao) => permissao.id),
    ...gruposPermissoes.flatMap((grupo) => grupo.permissoes.map((permissao) => permissao.id))
]);

const DESCRICOES_PERMISSOES_GERAIS = Object.freeze({
    'geral.fase_atual': (nome) => `Você terá acesso à fase em que ${nome} está.`,
    'geral.anticoncepcionais': (nome) =>
        `Você terá acesso à lista e ao histórico de uso de anticoncepcionais de ${nome}.`,
    'geral.historico_ciclo': (nome) =>
        `Você terá acesso aos ciclos, à menstruação e às previsões de ciclo de ${nome}.`,
    'geral.alerta_anticoncepcional': (nome) =>
        `Você será afetado pelas configurações de alarme do anticoncepcional de ${nome}.`,
    'geral.dicas': (nome) =>
        `Você receberá notificações e dicas práticas sobre a fase atual de ${nome}.`
});

const DESCRICOES_PERMISSOES_GERAIS_PRINCIPAL = Object.freeze({
    'geral.fase_atual': 'Este contato terá acesso a fase você está.',
    'geral.anticoncepcionais': 'Este contato terá acesso a lista e ao histórico de uso.',
    'geral.historico_ciclo':
        'Este contato terá acesso ao ciclos, menstruação e previsões de ciclo.',
    'geral.alerta_anticoncepcional':
        'Este contato será afetado pelas configurações de alarme do anticoncepcional.',
    'geral.dicas': 'Este contato receberá notificações e dicas práticas sobre a fase atual.'
});

const DESCRICOES_GRUPOS_DIARIO_PRINCIPAL = Object.freeze({
    ciclo: 'Fluxo Menstrual, sangramento de escape e secreção/corrimento.',
    corpo: 'Sintomas físicos, pele, cabelo, digestão, banheiro, região genital, tórax/peito, temperatura basal e peso.',
    emocional: 'sintomas emocionais, sintomas pré-menstruais.',
    vidaIntima: 'Atividade sexual(com parceiro(a), autoerotismo, desejo/libido, vida social.',
    energia: 'energia, qualidade de sono e tempo de sono.',
    saude: 'testes, consultas e anotação livre.'
});

const ESPACO_VERTICAL_EXTERNO = 32;
const ALTURA_CONTEUDO_FIXO = 210;

function calcularLimitesModal(alturaTela, margemSuperior = 0, margemInferior = 0) {
    const alturaSegura = Number.isFinite(alturaTela) && alturaTela > 0 ? alturaTela : 640;
    const areaSegura =
        alturaSegura -
        Math.max(0, Number(margemSuperior) || 0) -
        Math.max(0, Number(margemInferior) || 0);
    const alturaMaximaModal = Math.max(280, areaSegura - ESPACO_VERTICAL_EXTERNO);

    return Object.freeze({
        alturaMaximaModal,
        alturaMaximaRolagem: Math.max(120, alturaMaximaModal - ALTURA_CONTEUDO_FIXO)
    });
}

function normalizarPerspectiva(perspectiva) {
    return perspectiva === 'recebido' ? 'recebido' : 'enviado';
}

function normalizarNome(nomeContato) {
    return typeof nomeContato === 'string' && nomeContato.trim().length > 0
        ? nomeContato.trim()
        : 'Contato';
}

function normalizarPermissoes(permissoes) {
    if (!Array.isArray(permissoes)) {
        return [];
    }

    const recebidas = new Set(
        permissoes.filter(
            (permissao) => typeof permissao === 'string' && permissoesConhecidas.has(permissao)
        )
    );

    return [
        ...permissoesGerais.map((permissao) => permissao.id),
        ...gruposPermissoes.flatMap((grupo) => grupo.permissoes.map((permissao) => permissao.id))
    ].filter((permissao) => recebidas.has(permissao));
}

function criarResumoPermissoes(permissoes) {
    const normalizadas = normalizarPermissoes(permissoes);

    const selecionadas = new Set(normalizadas);

    const gerais = permissoesGerais
        .filter((permissao) => selecionadas.has(permissao.id))
        .map((permissao) => ({
            id: permissao.id,
            titulo: permissao.titulo
        }));

    const diario = gruposPermissoes
        .map((grupo) => ({
            id: grupo.id,
            titulo: grupo.titulo,
            permissoes: grupo.permissoes
                .filter((permissao) => selecionadas.has(permissao.id))
                .map((permissao) => ({
                    id: permissao.id,
                    titulo: permissao.titulo
                }))
        }))
        .filter((grupo) => grupo.permissoes.length > 0);

    return Object.freeze({
        gerais: Object.freeze(gerais),
        diario: Object.freeze(diario)
    });
}

function criarMensagensVazias(perspectiva, nomeContato) {
    if (perspectiva === 'recebido') {
        return Object.freeze({
            gerais: 'Você não possui acesso direto aos dados de permissões gerais.',
            diario: `Você não possui acesso direto ao diário de ${nomeContato}.`
        });
    }

    return Object.freeze({
        gerais: 'Este contato não possuí acesso direto aos seus dados.',
        diario: 'Este contato não possuí acesso ao seu diário.'
    });
}

function criarDescricaoGerais(perspectiva, nomeContato) {
    return perspectiva === 'recebido'
        ? `Você possui as seguintes permissões de acesso aos dados de ${nomeContato}:`
        : 'Este contato possuí as seguintes permissões de acesso dos seus dados:';
}

function criarDescricaoPermissaoGeral(id, nomeContato, perspectiva = 'recebido') {
    if (perspectiva === 'enviado') {
        return DESCRICOES_PERMISSOES_GERAIS_PRINCIPAL[id] ?? '';
    }

    const criarDescricao = DESCRICOES_PERMISSOES_GERAIS[id];

    return typeof criarDescricao === 'function' ? criarDescricao(nomeContato) : '';
}

function criarDescricaoGrupoDiario(grupo, perspectiva) {
    if (perspectiva === 'enviado') {
        return DESCRICOES_GRUPOS_DIARIO_PRINCIPAL[grupo.id] ?? '';
    }

    return grupo.permissoes
        .map((permissao) => permissao.titulo)
        .join(', ')
        .toLocaleLowerCase('pt-BR');
}

function ContactPermissionsSummaryModal({
    visivel,
    perspectiva,
    nomeContato,
    permissoes,
    vinculo,
    aoFechar
}) {
    const { height: alturaTela } = useWindowDimensions();

    const areasSeguras = useSafeAreaInsets();

    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const perspectivaSegura = normalizarPerspectiva(perspectiva);

    const nomeSeguro = normalizarNome(nomeContato);

    const resumo = useMemo(() => criarResumoPermissoes(permissoes), [permissoes]);

    const mensagensVazias = useMemo(
        () => criarMensagensVazias(perspectivaSegura, nomeSeguro),
        [nomeSeguro, perspectivaSegura]
    );

    const descricaoDiario =
        perspectivaSegura === 'recebido'
            ? `Você possui acesso às seguintes categorias do diário de ${nomeSeguro}:`
            : 'Este contato possuí acesso as seguintes categorias do seu diário:';

    const descricaoGerais = criarDescricaoGerais(perspectivaSegura, nomeSeguro);

    const limites = useMemo(
        () => calcularLimitesModal(alturaTela, areasSeguras.top, areasSeguras.bottom),
        [alturaTela, areasSeguras.bottom, areasSeguras.top]
    );

    function fechar() {
        if (typeof aoFechar === 'function') {
            aoFechar();
        }
    }

    return (
        <AppModal
            variante="simples"
            visivel={Boolean(visivel)}
            aoFechar={fechar}
            titulo="Resumo de Permissões"
            rolagemExternaHabilitada={false}
            estilo={[
                estilos.modal,
                {
                    maxHeight: limites.alturaMaximaModal
                }
            ]}
        >
            <View testID="contact-permissions-summary" style={estilos.conteudo}>
                <ScrollView
                    testID="contact-permissions-scroll"
                    style={[
                        estilos.rolagemPermissoes,
                        {
                            maxHeight: limites.alturaMaximaRolagem
                        }
                    ]}
                    contentContainerStyle={estilos.conteudoRolagem}
                    nestedScrollEnabled
                    bounces={false}
                    showsVerticalScrollIndicator
                >
                    <Secao
                        titulo="PERMISSÕES GERAIS"
                        vazio={resumo.gerais.length === 0}
                        mensagemVazia={mensagensVazias.gerais}
                        descricao={resumo.gerais.length > 0 ? descricaoGerais : null}
                        estilos={estilos}
                    >
                        {resumo.gerais.map((permissao, indice) => (
                            <ItemPermissao
                                key={permissao.id}
                                indice={indice}
                                titulo={permissao.titulo}
                                complemento={criarDescricaoPermissaoGeral(
                                    permissao.id,
                                    nomeSeguro,
                                    perspectivaSegura
                                )}
                                estilos={estilos}
                            />
                        ))}
                    </Secao>

                    <Secao
                        titulo="PERMISSÕES DE ACESSO AO DIÁRIO"
                        vazio={resumo.diario.length === 0}
                        mensagemVazia={mensagensVazias.diario}
                        descricao={resumo.diario.length > 0 ? descricaoDiario : null}
                        estilos={estilos}
                    >
                        {resumo.diario.map((grupo, indice) => (
                            <ItemPermissao
                                key={grupo.id}
                                indice={indice}
                                titulo={grupo.titulo}
                                complemento={criarDescricaoGrupoDiario(grupo, perspectivaSegura)}
                                estilos={estilos}
                            />
                        ))}
                    </Secao>
                </ScrollView>

                <View style={estilos.vinculo}>
                    <ContactPermissionBadge vinculo={vinculo} />
                </View>

                <ButtonPopup
                    texto="OK"
                    aoPressionar={fechar}
                    variante="verde"
                    rotuloAcessibilidade="Fechar resumo de permissões"
                    estilo={estilos.botao}
                    estiloTexto={estilos.textoBotao}
                />
            </View>
        </AppModal>
    );
}

function Secao({ titulo, vazio, mensagemVazia, descricao, estilos, children }) {
    return (
        <View style={estilos.secao}>
            <Text style={estilos.tituloSecao}>{titulo}</Text>

            {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}

            {vazio ? (
                <Text style={estilos.mensagemVazia}>{mensagemVazia}</Text>
            ) : (
                <View style={estilos.lista}>{children}</View>
            )}
        </View>
    );
}

function ItemPermissao({ indice, titulo, complemento, estilos }) {
    return (
        <View style={estilos.item}>
            <Text
                importantForAccessibility="no-hide-descendants"
                style={[estilos.marcador, indice % 2 === 1 && estilos.marcadorAlternado]}
            >
                ●
            </Text>

            <Text style={estilos.textoItem}>
                <Text style={estilos.textoItemDestaque}>{titulo}: </Text>
                <Text style={estilos.textoItemComplemento}>{complemento}</Text>
            </Text>
        </View>
    );
}

export {
    DESCRICOES_PERMISSOES_GERAIS,
    DESCRICOES_PERMISSOES_GERAIS_PRINCIPAL,
    DESCRICOES_GRUPOS_DIARIO_PRINCIPAL,
    ContactPermissionsSummaryModal,
    calcularLimitesModal,
    criarDescricaoGerais,
    criarDescricaoGrupoDiario,
    criarDescricaoPermissaoGeral,
    criarMensagensVazias,
    criarResumoPermissoes,
    normalizarNome,
    normalizarPermissoes,
    normalizarPerspectiva
};
