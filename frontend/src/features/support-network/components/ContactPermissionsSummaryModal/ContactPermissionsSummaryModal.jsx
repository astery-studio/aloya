//Apresenta, somente para leitura, as permissões efetivas de um vínculo.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

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
        gerais: `${nomeContato} não possui acesso direto aos dados de permissões gerais.`,
        diario: `${nomeContato} não possui acesso aos dados do diário.`
    });
}

function criarDescricaoGerais(perspectiva, nomeContato) {
    return perspectiva === 'recebido'
        ? `Você possui as seguintes permissões de acesso aos dados de ${nomeContato}:`
        : `${nomeContato} possui as seguintes permissões de acesso aos seus dados:`;
}

function criarDescricaoPermissaoGeral(id, nomeContato) {
    const criarDescricao = DESCRICOES_PERMISSOES_GERAIS[id];

    return typeof criarDescricao === 'function' ? criarDescricao(nomeContato) : '';
}

function ContactPermissionsSummaryModal({
    visivel,
    perspectiva,
    nomeContato,
    permissoes,
    vinculo,
    aoFechar
}) {
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
            : `${nomeSeguro} possui acesso às seguintes categorias do seu diário:`;

    const descricaoGerais = criarDescricaoGerais(perspectivaSegura, nomeSeguro);

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
            estilo={estilos.modal}
        >
            <View testID="contact-permissions-summary" style={estilos.conteudo}>
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
                            complemento={criarDescricaoPermissaoGeral(permissao.id, nomeSeguro)}
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
                            complemento={grupo.permissoes
                                .map((permissao) => permissao.titulo)
                                .join(', ')
                                .toLocaleLowerCase('pt-BR')}
                            estilos={estilos}
                        />
                    ))}
                </Secao>

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
                •
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
    ContactPermissionsSummaryModal,
    criarDescricaoGerais,
    criarDescricaoPermissaoGeral,
    criarMensagensVazias,
    criarResumoPermissoes,
    normalizarNome,
    normalizarPermissoes,
    normalizarPerspectiva
};
