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
            diario: 'Você não possui acesso aos dados do diário.'
        });
    }

    return Object.freeze({
        gerais: `${nomeContato} não possui acesso direto aos dados de permissões gerais.`,
        diario: `${nomeContato} não possui acesso aos dados do diário.`
    });
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
                    estilos={estilos}
                >
                    {resumo.gerais.map((permissao) => (
                        <ItemPermissao
                            key={permissao.id}
                            texto={permissao.titulo}
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
                    {resumo.diario.map((grupo) => (
                        <ItemPermissao
                            key={grupo.id}
                            texto={`${grupo.titulo}: ${grupo.permissoes
                                .map((permissao) => permissao.titulo)
                                .join(', ')}.`}
                            destacarInicio
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

function ItemPermissao({ texto, destacarInicio = false, estilos }) {
    if (!destacarInicio) {
        return (
            <View style={estilos.item}>
                <View importantForAccessibility="no-hide-descendants" style={estilos.marcador} />

                <Text style={estilos.textoItem}>{texto}</Text>
            </View>
        );
    }

    const indiceSeparador = texto.indexOf(':');

    const titulo = indiceSeparador >= 0 ? texto.slice(0, indiceSeparador + 1) : texto;

    const complemento = indiceSeparador >= 0 ? texto.slice(indiceSeparador + 1) : '';

    return (
        <View style={estilos.item}>
            <View importantForAccessibility="no-hide-descendants" style={estilos.marcador} />

            <Text style={estilos.textoItem}>
                <Text style={estilos.textoItemDestaque}>{titulo}</Text>

                {complemento}
            </Text>
        </View>
    );
}

export {
    ContactPermissionsSummaryModal,
    criarMensagensVazias,
    criarResumoPermissoes,
    normalizarNome,
    normalizarPermissoes,
    normalizarPerspectiva
};
