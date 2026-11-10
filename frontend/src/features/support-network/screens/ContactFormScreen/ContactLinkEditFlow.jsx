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

    return {
        email: configuracao.contato.email,
        iconeId: dadosIniciais?.iconeId ?? null,
        corId: dadosIniciais?.corId ?? null,
        categoriaId: categoriaAtual?.id ?? null,
        permissoesIndividuais:
            configuracao.vinculoAtual.tipo === 'individual'
                ? [...configuracao.vinculoAtual.permissoes]
                : []
    };
}

function houveAlteracaoReal(configuracao, dados) {
    if (!configuracao || !dados) return false;

    if (configuracao.vinculoAtual.tipo === 'categoria') {
        return (
            dados.categoriaId === null &&
            assinaturaPermissoes(dados.permissoesIndividuais) !==
                assinaturaPermissoes(configuracao.vinculoAtual.permissoes)
        );
    }

    return Number.isSafeInteger(dados.categoriaId) && dados.categoriaId > 0;
}

function criarAlteracao(configuracao, dados) {
    if (configuracao.vinculoAtual.tipo === 'categoria') {
        return {
            tipo: 'individual',
            permissoesIndividuais: [...dados.permissoesIndividuais],
            versao: configuracao.versao
        };
    }

    return {
        tipo: 'categoria',
        categoriaId: dados.categoriaId,
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
    const [confirmando, definirConfirmando] = useState(false);
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

    const categorias = useMemo(() => {
        if (!configuracao) return [];
        if (configuracao.vinculoAtual.tipo === 'categoria') {
            return configuracao.vinculoAtual.categoria ? [configuracao.vinculoAtual.categoria] : [];
        }
        return configuracao.proximoVinculo.categorias;
    }, [configuracao]);

    const alterarDados = useCallback((alteracoes) => {
        if (atualizando.current || !alteracoes || typeof alteracoes !== 'object') return;
        definirDados((atuais) => ({ ...atuais, ...alteracoes }));
    }, []);

    const abrirPermissoes = useCallback(() => {
        if (configuracao?.vinculoAtual.tipo !== 'categoria' || salvando) return;
        definirRascunhoPermissoes([...configuracao.proximoVinculo.permissoesPreenchidas]);
        definirPermissoesVisiveis(true);
    }, [configuracao, salvando]);

    const salvarPermissoes = useCallback(
        (permissoes) => {
            if (!Array.isArray(permissoes) || permissoes.length === 0 || salvando) return;
            alterarDados({ categoriaId: null, permissoesIndividuais: [...permissoes] });
            definirPermissoesVisiveis(false);
        },
        [alterarDados, salvando]
    );

    const solicitarSalvamento = useCallback(() => {
        if (alterado && !salvando) definirConfirmando(true);
    }, [alterado, salvando]);

    const confirmar = useCallback(async () => {
        if (!alterado || atualizando.current || !serviceDisponivel) return;

        atualizando.current = true;
        definirSalvando(true);
        definirConfirmando(false);
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

    const categoriaDestino = categorias.find((categoria) => categoria.id === dados?.categoriaId);
    const partindoDeCategoria = configuracao?.vinculoAtual.tipo === 'categoria';

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
                            aoSalvar={solicitarSalvamento}
                            aoAbrirPermissoes={partindoDeCategoria ? abrirPermissoes : undefined}
                            aoCriarCategoria={partindoDeCategoria ? undefined : onCriarCategoria}
                            carregando={salvando}
                            alterado={alterado}
                            bloquearAparencia
                            permitirPermissoes={partindoDeCategoria}
                            permitirCriarCategoria={!partindoDeCategoria}
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
                visivel={confirmando}
                aoFechar={() => !salvando && definirConfirmando(false)}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo={partindoDeCategoria ? 'Desvincular categoria' : 'Vincular a categoria'}
                mensagem={
                    partindoDeCategoria
                        ? 'Esta ação remove o contato da categoria cadastrada e torna as permissões individuais.'
                        : `Esta ação remove as permissões individuais cadastradas e vincula o contato a categoria ‘${categoriaDestino?.nome ?? ''}’`
                }
                acaoPrincipal={{
                    texto: 'Continuar',
                    variante: 'verde',
                    aoPressionar: confirmar,
                    carregando: salvando
                }}
                acaoSecundaria={{
                    texto: 'Cancelar',
                    variante: 'branco',
                    aoPressionar: () => definirConfirmando(false),
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
                    partindoDeCategoria
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
                    aoPressionar: configuracao ? confirmar : carregar,
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
    houveAlteracaoReal
};
