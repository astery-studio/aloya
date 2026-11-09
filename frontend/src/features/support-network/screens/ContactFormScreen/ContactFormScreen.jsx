//Orquestra o cadastro de contato, permissões, consulta de conta e envio do convite.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import SimpleModal from '../../../../shared/components/feedback/Modal/SimpleModal';
import {
    PaperPlaneTiltIcon,
    WarningCircleIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../../settings/layouts/SettingsLayout/SettingsLayout';
import { ContactForm } from '../../components/ContactForm/ContactForm';
import { IndividualPermissionsForm } from '../../components/IndividualPermissionsForm/IndividualPermissionsForm';
import { estilos } from './ContactFormScreen.styles';

const ALERTA_EMAIL = Object.freeze({
    codigo: 'EMAIL_CONTATO_INVALIDO',
    titulo: 'E-mail inválido',
    mensagem: 'Informe um e-mail válido.',
    recuperavel: false
});

const ALERTA_REDE_BLOQUEADA = Object.freeze({
    codigo: 'REDE_APOIO_BLOQUEADA',
    titulo: 'Rede de Apoio bloqueada',
    mensagem: 'O acesso à Rede de Apoio depende da autorização de um responsável legal.',
    recuperavel: false
});

const ALERTA_LIMITE = Object.freeze({
    codigo: 'LIMITE_CONVITE_CONTATO',
    titulo: 'Muitas tentativas',
    mensagem: 'Aguarde alguns minutos antes de tentar enviar outro convite.',
    recuperavel: false
});

const ALERTA_CONVITE_EXISTENTE = Object.freeze({
    codigo: 'CONVITE_JA_PENDENTE',
    titulo: 'Convite já enviado',
    mensagem: 'Já existe um convite pendente para este e-mail.',
    recuperavel: false
});

const ALERTA_CONTATO_EXISTENTE = Object.freeze({
    codigo: 'CONTATO_JA_VINCULADO',
    titulo: 'Contato já adicionado',
    mensagem: 'Este contato já faz parte da sua Rede de Apoio.',
    recuperavel: false
});

const ALERTA_PROPRIA_CONTA = Object.freeze({
    codigo: 'CONVITE_PARA_PROPRIA_CONTA',
    titulo: 'E-mail não permitido',
    mensagem: 'Você não pode convidar seu próprio e-mail.',
    recuperavel: false
});

const ALERTA_CATEGORIAS = Object.freeze({
    codigo: 'ERRO_CATEGORIAS_CONTATO',
    titulo: 'Algo deu errado',
    mensagem: 'Não foi possível carregar as categorias. Tente novamente.',
    recuperavel: true,
    origem: 'categorias'
});

const ALERTA_INTERNO = Object.freeze({
    codigo: 'ERRO_ENVIO_CONVITE',
    titulo: 'Algo deu errado',
    mensagem: 'Ocorreu um erro ao enviar convite. Verifique sua conexão e tente novamente.',
    recuperavel: true,
    origem: 'convite'
});

const codigosSessaoInvalida = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
]);

function criarDadosIniciais(dadosIniciais) {
    const dadosSeguros =
        dadosIniciais !== null && typeof dadosIniciais === 'object' && !Array.isArray(dadosIniciais)
            ? dadosIniciais
            : {};

    return {
        email: typeof dadosSeguros.email === 'string' ? dadosSeguros.email : '',
        iconeId: typeof dadosSeguros.iconeId === 'string' ? dadosSeguros.iconeId : 'pessoa',
        corId: typeof dadosSeguros.corId === 'string' ? dadosSeguros.corId : 'branco',
        categoriaId:
            Number.isSafeInteger(dadosSeguros.categoriaId) && dadosSeguros.categoriaId > 0
                ? dadosSeguros.categoriaId
                : null,
        permissoesIndividuais: Array.isArray(dadosSeguros.permissoesIndividuais)
            ? dadosSeguros.permissoesIndividuais.filter(
                  (permissao) => typeof permissao === 'string'
              )
            : []
    };
}

function emailsCorrespondem(primeiroEmail, segundoEmail) {
    if (typeof primeiroEmail !== 'string' || typeof segundoEmail !== 'string') {
        return false;
    }

    const primeiroNormalizado = primeiroEmail.trim().toLowerCase();
    const segundoNormalizado = segundoEmail.trim().toLowerCase();

    return Boolean(primeiroNormalizado) && primeiroNormalizado === segundoNormalizado;
}

function copiarDadosConvite(dados) {
    const copia = {
        email: dados.email,
        iconeId: dados.iconeId,
        corId: dados.corId
    };

    if (Number.isSafeInteger(dados.categoriaId) && dados.categoriaId > 0) {
        copia.categoriaId = dados.categoriaId;
    } else {
        copia.permissoesIndividuais = [...(dados.permissoesIndividuais ?? [])];
    }

    return Object.freeze(copia);
}

function assinaturaPermissoes(permissoes) {
    return JSON.stringify(Array.isArray(permissoes) ? [...new Set(permissoes)].sort() : []);
}

function conviteCriadoEhValido(resultado) {
    return (
        resultado !== null &&
        typeof resultado === 'object' &&
        !Array.isArray(resultado) &&
        resultado.mensagem === 'Convite enviado com sucesso.' &&
        resultado.convite !== null &&
        typeof resultado.convite === 'object' &&
        Number.isSafeInteger(resultado.convite.id) &&
        resultado.convite.id > 0
    );
}

function obterAlertaDoErro(erro) {
    if (
        erro?.codigo === ALERTA_EMAIL.codigo ||
        (erro?.codigo === 'ERRO_VALIDACAO' &&
            Array.isArray(erro?.detalhes) &&
            erro.detalhes.some((detalhe) => detalhe?.campo === 'email'))
    ) {
        return ALERTA_EMAIL;
    }

    if (erro?.codigo === ALERTA_REDE_BLOQUEADA.codigo) {
        return ALERTA_REDE_BLOQUEADA;
    }

    if (erro?.codigo === ALERTA_CONVITE_EXISTENTE.codigo) {
        return ALERTA_CONVITE_EXISTENTE;
    }

    if (erro?.codigo === ALERTA_CONTATO_EXISTENTE.codigo) {
        return ALERTA_CONTATO_EXISTENTE;
    }

    if (erro?.codigo === ALERTA_PROPRIA_CONTA.codigo) {
        return ALERTA_PROPRIA_CONTA;
    }

    if (
        erro?.status === 429 ||
        (typeof erro?.codigo === 'string' && erro.codigo.startsWith('LIMITE_'))
    ) {
        return ALERTA_LIMITE;
    }

    return ALERTA_INTERNO;
}

function ContactFormScreen({
    contatoId = null,
    dadosIniciais,
    emailUsuario,
    service,
    categoriasService,
    onVoltar,
    onSalvo,
    onSessaoExpirada,
    onCriarCategoria,
    onRascunhoAlterado
}) {
    const tema = useTheme();

    const [dados, definirDados] = useState(() => criarDadosIniciais(dadosIniciais));

    const [categorias, definirCategorias] = useState([]);
    const [carregandoCategorias, definirCarregandoCategorias] = useState(true);

    const [enviando, definirEnviando] = useState(false);
    const [alerta, definirAlerta] = useState(null);

    const [confirmacaoNaoRegistrado, definirConfirmacaoNaoRegistrado] = useState(false);

    const [permissoesVisiveis, definirPermissoesVisiveis] = useState(false);

    const [rascunhoPermissoes, definirRascunhoPermissoes] = useState([]);

    const [conviteCriado, definirConviteCriado] = useState(null);

    const [sucessoVisivel, definirSucessoVisivel] = useState(false);

    const telaMontada = useRef(true);
    const requisicaoEmAndamento = useRef(false);
    const controleCategorias = useRef(null);
    const pedidoPendente = useRef(null);
    const ultimaTentativa = useRef(null);

    const serviceDisponivel =
        typeof service?.consultarEmail === 'function' &&
        typeof service?.enviarConvite === 'function';

    const categoriasServiceDisponivel = typeof categoriasService?.listarCategorias === 'function';

    const permissoesAlteradas = useMemo(
        () =>
            assinaturaPermissoes(rascunhoPermissoes) !==
            assinaturaPermissoes(dados.permissoesIndividuais),
        [dados.permissoesIndividuais, rascunhoPermissoes]
    );

    const carregarCategorias = useCallback(async () => {
        controleCategorias.current?.abort();

        if (!categoriasServiceDisponivel) {
            definirCarregandoCategorias(false);
            definirAlerta(ALERTA_CATEGORIAS);
            return;
        }

        const controle = new AbortController();

        controleCategorias.current = controle;

        definirCarregandoCategorias(true);
        definirAlerta(null);

        try {
            const resultado = await categoriasService.listarCategorias({
                signal: controle.signal
            });

            if (!Array.isArray(resultado)) {
                throw new Error('Resposta inválida ao carregar categorias.');
            }

            if (!controle.signal.aborted && telaMontada.current) {
                definirCategorias(resultado);
            }
        } catch (erro) {
            if (erro?.name !== 'AbortError' && !controle.signal.aborted && telaMontada.current) {
                definirAlerta(ALERTA_CATEGORIAS);
            }
        } finally {
            if (!controle.signal.aborted && telaMontada.current) {
                definirCarregandoCategorias(false);
            }
        }
    }, [categoriasService, categoriasServiceDisponivel]);

    useEffect(() => {
        telaMontada.current = true;

        carregarCategorias();

        return () => {
            telaMontada.current = false;
            controleCategorias.current?.abort();
        };
    }, [carregarCategorias]);

    const alterarDados = useCallback(
        (alteracoes) => {
            if (
                requisicaoEmAndamento.current ||
                alteracoes === null ||
                typeof alteracoes !== 'object' ||
                Array.isArray(alteracoes)
            ) {
                return;
            }

            definirDados((atuais) => {
                const atualizados = {
                    ...atuais,
                    ...alteracoes
                };

                onRascunhoAlterado?.(atualizados);

                return atualizados;
            });
        },
        [onRascunhoAlterado]
    );

    const processarConvite = useCallback(
        async (dadosValidados, consultarPrimeiro = true) => {
            if (requisicaoEmAndamento.current || !serviceDisponivel) {
                return;
            }

            const dadosSeguros = copiarDadosConvite(dadosValidados);

            let etapa = consultarPrimeiro ? 'consulta' : 'envio';

            requisicaoEmAndamento.current = true;
            definirEnviando(true);
            definirAlerta(null);

            try {
                if (consultarPrimeiro) {
                    const consulta = await service.consultarEmail(dadosSeguros.email);

                    if (consulta?.contaContatoCadastrada !== true) {
                        pedidoPendente.current = dadosSeguros;

                        ultimaTentativa.current = null;

                        definirConfirmacaoNaoRegistrado(true);

                        return;
                    }
                }

                etapa = 'envio';

                const resultado = await service.enviarConvite(dadosSeguros);

                if (!conviteCriadoEhValido(resultado)) {
                    throw new Error('Resposta inválida ao enviar convite.');
                }

                if (!telaMontada.current) {
                    return;
                }

                pedidoPendente.current = null;
                ultimaTentativa.current = null;

                definirConviteCriado(resultado.convite);
                definirConfirmacaoNaoRegistrado(false);
                definirSucessoVisivel(true);
            } catch (erro) {
                if (!telaMontada.current) {
                    return;
                }

                if (
                    codigosSessaoInvalida.has(erro?.codigo) &&
                    typeof onSessaoExpirada === 'function'
                ) {
                    onSessaoExpirada();
                    return;
                }

                const novoAlerta = obterAlertaDoErro(erro);

                if (novoAlerta.recuperavel) {
                    ultimaTentativa.current = {
                        dados: dadosSeguros,
                        consultarPrimeiro: etapa === 'consulta'
                    };
                } else {
                    ultimaTentativa.current = null;
                }

                definirAlerta(novoAlerta);
            } finally {
                requisicaoEmAndamento.current = false;

                if (telaMontada.current) {
                    definirEnviando(false);
                }
            }
        },
        [onSessaoExpirada, service, serviceDisponivel]
    );

    const salvarContato = useCallback(
        (dadosValidados) => {
            if (emailsCorrespondem(dadosValidados?.email, emailUsuario)) {
                definirAlerta(ALERTA_PROPRIA_CONTA);
                return;
            }

            return processarConvite(dadosValidados, true);
        },
        [emailUsuario, processarConvite]
    );

    const confirmarEnvioNaoRegistrado = useCallback(() => {
        if (enviando || !pedidoPendente.current) {
            return;
        }

        definirConfirmacaoNaoRegistrado(false);

        return processarConvite(pedidoPendente.current, false);
    }, [enviando, processarConvite]);

    const cancelarEnvioNaoRegistrado = useCallback(() => {
        if (!enviando) {
            pedidoPendente.current = null;
            definirConfirmacaoNaoRegistrado(false);
        }
    }, [enviando]);

    const abrirPermissoes = useCallback(() => {
        if (enviando) {
            return;
        }

        definirRascunhoPermissoes([...dados.permissoesIndividuais]);

        definirPermissoesVisiveis(true);
    }, [dados.permissoesIndividuais, enviando]);

    const fecharPermissoes = useCallback(() => {
        if (!enviando) {
            definirPermissoesVisiveis(false);
        }
    }, [enviando]);

    const salvarPermissoes = useCallback(
        (novasPermissoes) => {
            if (enviando || !Array.isArray(novasPermissoes) || novasPermissoes.length === 0) {
                return;
            }

            alterarDados({
                categoriaId: null,
                permissoesIndividuais: [...novasPermissoes]
            });

            definirPermissoesVisiveis(false);
        },
        [alterarDados, enviando]
    );

    const tentarNovamente = useCallback(() => {
        const tentativa = ultimaTentativa.current;

        definirAlerta(null);

        if (alerta?.origem === 'categorias') {
            carregarCategorias();
            return;
        }

        if (tentativa) {
            processarConvite(tentativa.dados, tentativa.consultarPrimeiro);
        }
    }, [alerta?.origem, carregarCategorias, processarConvite]);

    const fecharAlerta = useCallback(() => {
        if (!enviando) {
            definirAlerta(null);
        }
    }, [enviando]);

    const concluir = useCallback(() => {
        definirSucessoVisivel(false);

        onSalvo?.(conviteCriado);
    }, [conviteCriado, onSalvo]);

    const voltar = useCallback(() => {
        if (!requisicaoEmAndamento.current) {
            onVoltar?.();
        }
    }, [onVoltar]);

    return (
        <>
            <SettingsLayout
                titulo={contatoId === null ? 'Novo Contato' : 'Editar Contato'}
                onVoltar={voltar}
                corFundo={tema.escuro ? tema.cores.interface.fundo : undefined}
            >
                <View style={estilos.conteudo}>
                    {carregandoCategorias ? (
                        <View
                            testID="carregando-formulario-contato"
                            accessibilityLabel="Carregando formulário de contato"
                            style={estilos.carregamento}
                        >
                            <ActivityIndicator size="large" color={tema.cores.interface.destaque} />
                        </View>
                    ) : (
                        <ContactForm
                            dados={dados}
                            categorias={categorias}
                            modo={contatoId === null ? 'cadastro' : 'edicao'}
                            aoAlterar={alterarDados}
                            aoSalvar={serviceDisponivel ? salvarContato : undefined}
                            aoAbrirPermissoes={abrirPermissoes}
                            aoCriarCategoria={onCriarCategoria}
                            carregando={enviando}
                            alterado
                        />
                    )}
                </View>
            </SettingsLayout>

            <IndividualPermissionsForm
                visivel={permissoesVisiveis}
                aoFechar={fecharPermissoes}
                permissoesSelecionadas={rascunhoPermissoes}
                aoAlterar={definirRascunhoPermissoes}
                aoSalvar={salvarPermissoes}
                alterado={permissoesAlteradas}
                carregando={false}
            />

            <SimpleModal
                visivel={confirmacaoNaoRegistrado}
                aoFechar={cancelarEnvioNaoRegistrado}
                icone={WarningCircleIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Contato Não Registrado"
                mensagem="Envie um convite por e-mail para que o usuário se cadastre antes de aceitar o convite"
                acaoPrincipal={{
                    texto: 'Enviar Convite',
                    variante: 'verde',
                    aoPressionar: confirmarEnvioNaoRegistrado,
                    carregando: enviando
                }}
            />

            <SimpleModal
                erroInterno={Boolean(alerta?.recuperavel)}
                visivel={alerta !== null}
                aoFechar={fecharAlerta}
                icone={WarningCircleIcon}
                corIcone={
                    alerta?.recuperavel
                        ? tema.cores.interface.textoSecundario
                        : tema.cores.marca.primaria
                }
                fundoIcone={
                    alerta?.recuperavel
                        ? tema.cores.interface.borda
                        : tema.cores.icones.configuracoes.laranja.caixa
                }
                titulo={alerta?.titulo}
                mensagem={alerta?.mensagem}
                acaoPrincipal={
                    alerta?.recuperavel
                        ? {
                              texto: 'Tentar novamente',
                              variante: 'preto',
                              aoPressionar: tentarNovamente,
                              carregando: enviando
                          }
                        : {
                              texto: 'OK',
                              variante: 'verde',
                              aoPressionar: fecharAlerta
                          }
                }
                acaoSecundaria={
                    alerta?.recuperavel
                        ? {
                              texto: 'Voltar',
                              variante: 'branco',
                              aoPressionar: fecharAlerta,
                              desativado: enviando
                          }
                        : undefined
                }
            />

            <SimpleModal
                visivel={sucessoVisivel}
                aoFechar={concluir}
                icone={PaperPlaneTiltIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Convite enviado com sucesso"
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: concluir
                }}
            />
        </>
    );
}

export { ContactFormScreen, criarDadosIniciais, emailsCorrespondem, obterAlertaDoErro };
