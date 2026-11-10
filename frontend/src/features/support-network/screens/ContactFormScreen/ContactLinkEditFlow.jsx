import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import { LockKeyIcon, WarningCircleIcon } from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../../settings/layouts/SettingsLayout/SettingsLayout';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { IndividualPermissionsForm } from '../../components/IndividualPermissionsForm/IndividualPermissionsForm';
import { estilos } from './ContactFormScreen.styles';

const MENSAGEM_ERRO = 'Não foi possível atualizar o vínculo deste contato. Tente novamente.';

const CODIGOS_SESSAO_INVALIDA = new Set(['SESSAO_INVALIDA', 'TOKEN_INVALIDO', 'TOKEN_EXPIRADO']);

function assinaturaPermissoes(permissoes) {
    return JSON.stringify(
        Array.isArray(permissoes) ? [...new Set(permissoes)].sort((a, b) => a.localeCompare(b)) : []
    );
}

function criarDadosDaConfiguracao(configuracao, dadosIniciais) {
    const categoriaAtual = configuracao.vinculoAtual.categoria;
    const categoriaInicial = Number.isSafeInteger(dadosIniciais?.categoriaId)
        ? dadosIniciais.categoriaId
        : null;

    return {
        email: configuracao.contato.email,
        iconeId: configuracao.contato.iconeId ?? dadosIniciais?.iconeId ?? null,
        corId: configuracao.contato.corId ?? dadosIniciais?.corId ?? null,
        categoriaId: categoriaInicial ?? categoriaAtual?.id ?? null,
        permissoesIndividuais:
            configuracao.vinculoAtual.tipo === 'individual'
                ? [...configuracao.vinculoAtual.permissoes]
                : []
    };
}

function houveAlteracaoReal(configuracao, dados) {
    if (!configuracao || !dados) return false;

    const aparenciaAlterada =
        dados.iconeId !== configuracao.contato.iconeId ||
        dados.corId !== configuracao.contato.corId;

    const vinculoAlterado =
        configuracao.vinculoAtual.tipo === 'categoria'
            ? dados.categoriaId !== configuracao.vinculoAtual.categoria?.id ||
              (dados.categoriaId === null &&
                  assinaturaPermissoes(dados.permissoesIndividuais) !==
                      assinaturaPermissoes(configuracao.vinculoAtual.permissoes))
            : Number.isSafeInteger(dados.categoriaId) && dados.categoriaId > 0;

    return aparenciaAlterada || vinculoAlterado;
}

function vinculoFoiAlterado(configuracao, dados) {
    if (!configuracao || !dados) return false;

    if (configuracao.vinculoAtual.tipo === 'categoria') {
        return (
            dados.categoriaId !== configuracao.vinculoAtual.categoria?.id ||
            (dados.categoriaId === null &&
                assinaturaPermissoes(dados.permissoesIndividuais) !==
                    assinaturaPermissoes(configuracao.vinculoAtual.permissoes))
        );
    }

    return Number.isSafeInteger(dados.categoriaId) && dados.categoriaId > 0;
}

function criarAlteracao(configuracao, dados) {
    const alteracao = Number.isSafeInteger(dados.categoriaId)
        ? {
              tipo: 'categoria',
              categoriaId: dados.categoriaId
          }
        : {
              tipo: 'individual',
              permissoesIndividuais: [...dados.permissoesIndividuais]
          };

    return {
        ...alteracao,
        iconeId: dados.iconeId,
        corId: dados.corId,
        versao: configuracao.versao
    };
}

function ContactLinkEditFlow({
    contatoId,
    dadosIniciais,
    service,
    onVoltar,
    onSalvo,
    onSessaoExpirada,
    onCriarCategoria
}) {
    const tema = useTheme();
    const [configuracao, definirConfiguracao] = useState(null);
    const [dados, definirDados] = useState(null);
    const [carregando, definirCarregando] = useState(true);
    const [salvando, definirSalvando] = useState(false);
    const [erro, definirErro] = useState(null);
    const [confirmacaoTroca, definirConfirmacaoTroca] = useState(null);
    const [sucesso, definirSucesso] = useState(false);
    const [permissoesVisiveis, definirPermissoesVisiveis] = useState(false);
    const [rascunhoPermissoes, definirRascunhoPermissoes] = useState([]);
    const controleConsulta = useRef(null);
    const montada = useRef(true);
    const atualizando = useRef(false);

    const serviceDisponivel =
        typeof service?.consultar === 'function' && typeof service?.atualizar === 'function';

    const carregar = useCallback(async () => {
        controleConsulta.current?.abort();
        definirErro(null);

        if (!serviceDisponivel) {
            definirCarregando(false);
            definirErro(MENSAGEM_ERRO);
            return;
        }

        const controle = new AbortController();
        controleConsulta.current = controle;
        definirCarregando(true);

        try {
            const resposta = await service.consultar(contatoId, { signal: controle.signal });
            if (!controle.signal.aborted && montada.current) {
                definirConfiguracao(resposta);
                definirDados(criarDadosDaConfiguracao(resposta, dadosIniciais));
            }
        } catch (falha) {
            if (falha?.name === 'AbortError' || controle.signal.aborted || !montada.current) return;

            if (CODIGOS_SESSAO_INVALIDA.has(falha?.codigo)) {
                onSessaoExpirada?.();
                return;
            }

            definirErro(MENSAGEM_ERRO);
        } finally {
            if (!controle.signal.aborted && montada.current) definirCarregando(false);
        }
    }, [contatoId, dadosIniciais, onSessaoExpirada, service, serviceDisponivel]);

    useEffect(() => {
        montada.current = true;
        carregar();

        return () => {
            montada.current = false;
            controleConsulta.current?.abort();
        };
    }, [carregar]);

    const alterado = useMemo(() => houveAlteracaoReal(configuracao, dados), [configuracao, dados]);

    const categorias = useMemo(() => configuracao?.proximoVinculo.categorias ?? [], [configuracao]);

    const alterarDados = useCallback(
        (alteracoes) => {
            if (atualizando.current || !alteracoes || typeof alteracoes !== 'object') return;

            if (Object.prototype.hasOwnProperty.call(alteracoes, 'categoriaId')) {
                if (!Number.isSafeInteger(alteracoes.categoriaId)) return;
                if (alteracoes.categoriaId === dados?.categoriaId) return;
                definirConfirmacaoTroca({
                    tipo: 'categoria',
                    categoriaId: alteracoes.categoriaId
                });
                return;
            }

            definirDados((atuais) => ({ ...atuais, ...alteracoes }));
        },
        [dados?.categoriaId]
    );

    const abrirPermissoes = useCallback(() => {
        if (salvando) return;

        if (Number.isSafeInteger(dados?.categoriaId)) {
            definirConfirmacaoTroca({ tipo: 'individual' });
            return;
        }

        definirRascunhoPermissoes([...dados.permissoesIndividuais]);
        definirPermissoesVisiveis(true);
    }, [dados, salvando]);

    const salvarPermissoes = useCallback(
        (permissoes) => {
            if (!Array.isArray(permissoes) || permissoes.length === 0 || salvando) return;
            definirDados((atuais) => ({
                ...atuais,
                categoriaId: null,
                permissoesIndividuais: [...permissoes]
            }));
            definirPermissoesVisiveis(false);
        },
        [salvando]
    );

    const confirmarTrocaLocal = useCallback(() => {
        if (confirmacaoTroca?.tipo === 'individual') {
            definirConfirmacaoTroca(null);
            definirRascunhoPermissoes([]);
            definirPermissoesVisiveis(true);
            return;
        }

        if (confirmacaoTroca?.tipo === 'categoria') {
            definirDados((atuais) => ({
                ...atuais,
                categoriaId: confirmacaoTroca.categoriaId,
                permissoesIndividuais: []
            }));
        }

        definirConfirmacaoTroca(null);
    }, [confirmacaoTroca]);

    const salvar = useCallback(async () => {
        if (!alterado || atualizando.current || !serviceDisponivel) return;

        atualizando.current = true;
        definirSalvando(true);
        definirErro(null);

        try {
            const resultado = await service.atualizar(
                contatoId,
                criarAlteracao(configuracao, dados)
            );
            if (montada.current) definirSucesso(resultado);
        } catch (falha) {
            if (!montada.current) return;
            if (CODIGOS_SESSAO_INVALIDA.has(falha?.codigo)) {
                onSessaoExpirada?.();
                return;
            }
            definirErro(MENSAGEM_ERRO);
        } finally {
            atualizando.current = false;
            if (montada.current) definirSalvando(false);
        }
    }, [alterado, configuracao, contatoId, dados, onSessaoExpirada, service, serviceDisponivel]);

    const concluir = useCallback(() => {
        const resultado = sucesso;
        definirSucesso(false);
        onSalvo?.(resultado);
    }, [onSalvo, sucesso]);

    const categoriaConfirmada = categorias.find(
        (categoria) => categoria.id === confirmacaoTroca?.categoriaId
    );
    const destinoIndividual = dados?.categoriaId === null;

    return (
        <>
            <SettingsLayout
                titulo="Editar Contato"
                onVoltar={onVoltar}
                corFundo={tema.escuro ? tema.cores.interface.fundo : undefined}
            >
                <View style={estilos.conteudo}>
                    {carregando || !dados ? (
                        <View
                            testID="carregando-edicao-vinculo"
                            accessibilityLabel="Carregando vínculo do contato"
                            style={estilos.carregamento}
                        >
                            <ActivityIndicator size="large" color={tema.cores.interface.destaque} />
                        </View>
                    ) : (
                        <ContactForm
                            dados={dados}
                            categorias={categorias}
                            modo="edicao"
                            aoAlterar={alterarDados}
                            aoSalvar={salvar}
                            aoAbrirPermissoes={abrirPermissoes}
                            aoCriarCategoria={onCriarCategoria}
                            carregando={salvando}
                            alterado={alterado}
                            permitirPermissoes
                            permitirCriarCategoria
                        />
                    )}
                </View>
            </SettingsLayout>

            <IndividualPermissionsForm
                visivel={permissoesVisiveis}
                aoFechar={() => !salvando && definirPermissoesVisiveis(false)}
                permissoesSelecionadas={rascunhoPermissoes}
                aoAlterar={definirRascunhoPermissoes}
                aoSalvar={salvarPermissoes}
                alterado={
                    assinaturaPermissoes(rascunhoPermissoes) !==
                    assinaturaPermissoes(configuracao?.vinculoAtual.permissoes)
                }
                carregando={salvando}
            />

            <SimpleModal
                visivel={confirmacaoTroca !== null}
                aoFechar={() => !salvando && definirConfirmacaoTroca(null)}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo={
                    confirmacaoTroca?.tipo === 'individual'
                        ? 'Desvincular categoria'
                        : 'Vincular a categoria'
                }
                mensagem={
                    confirmacaoTroca?.tipo === 'individual'
                        ? 'Esta ação remove o contato da categoria cadastrada e torna as permissões individuais.'
                        : `Esta ação remove as permissões individuais cadastradas e vincula o contato a categoria ‘${categoriaConfirmada?.nome ?? ''}’`
                }
                acaoPrincipal={{
                    texto: 'Continuar',
                    variante: 'verde',
                    aoPressionar: confirmarTrocaLocal,
                    carregando: salvando
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: () => definirConfirmacaoTroca(null),
                    desativado: salvando
                }}
            />

            <SimpleModal
                visivel={Boolean(sucesso)}
                aoFechar={concluir}
                icone={LockKeyIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo={
                    destinoIndividual
                        ? 'Permissões atualizadas com sucesso'
                        : 'Vínculo atualizado com sucesso'
                }
                acaoPrincipal={{ texto: 'OK', variante: 'verde', aoPressionar: concluir }}
            />

            <SimpleModal
                erroInterno
                visivel={erro !== null}
                aoFechar={() => definirErro(null)}
                icone={WarningCircleIcon}
                titulo="Algo deu errado"
                mensagem={erro}
                acaoPrincipal={{
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: configuracao ? salvar : carregar,
                    carregando: carregando || salvando
                }}
                acaoSecundaria={{
                    texto: 'Voltar',
                    variante: 'branco',
                    aoPressionar: () => definirErro(null),
                    desativado: carregando || salvando
                }}
            />
        </>
    );
}

export {
    ContactLinkEditFlow,
    assinaturaPermissoes,
    criarAlteracao,
    criarDadosDaConfiguracao,
    houveAlteracaoReal,
    vinculoFoiAlterado
};
