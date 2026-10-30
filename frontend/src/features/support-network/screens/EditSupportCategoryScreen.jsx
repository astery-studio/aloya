//Orquestra a edição de uma categoria e a confirmação do impacto nos contatos vinculados.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { BellIcon, WarningCircleIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { CategoryImpactConfirmationModal } from '../components/CategoryImpactConfirmationModal';
import {
    prepararCategoriaParaSalvar,
    SupportCategoryForm
} from '../components/SupportCategoryForm';
import { estilos } from './EditSupportCategoryScreen.styles';

const ALERTA_NOME = Object.freeze({
    codigo: 'NOME_CATEGORIA_OBRIGATORIO',
    titulo: 'Salvar sem nome',
    mensagem: 'Dê um nome para a categoria.',
    recuperavel: false
});

const ALERTA_PERMISSOES = Object.freeze({
    codigo: 'PERMISSAO_CATEGORIA_OBRIGATORIA',
    titulo: 'Categoria sem permissões',
    mensagem: 'Selecione ao menos um tipo de dado que esta categoria poderá visualizar.',
    recuperavel: false
});

const ALERTA_DUPLICIDADE = Object.freeze({
    codigo: 'CATEGORIA_NOME_DUPLICADO',
    titulo: 'Categoria existente',
    mensagem: 'Você já tem uma categoria com esse nome.',
    recuperavel: false
});

const ALERTA_LIMITE = Object.freeze({
    codigo: 'LIMITE_ATUALIZACAO_CATEGORIA',
    titulo: 'Muitas tentativas',
    mensagem: 'Aguarde alguns minutos antes de tentar atualizar a categoria novamente.',
    recuperavel: false
});

const ALERTA_NAO_ENCONTRADA = Object.freeze({
    codigo: 'CATEGORIA_NAO_ENCONTRADA',
    titulo: 'Categoria indisponível',
    mensagem: 'Esta categoria não está mais disponível.',
    recuperavel: false
});

const ALERTA_VERSAO = Object.freeze({
    codigo: 'CATEGORIA_ALTERADA_CONCORRENTEMENTE',
    titulo: 'Categoria alterada',
    mensagem: 'Esta categoria foi alterada em outro dispositivo. Volte à lista e tente novamente.',
    recuperavel: false
});

const ALERTA_INTERNO = Object.freeze({
    codigo: 'ERRO_ATUALIZACAO_CATEGORIA',
    titulo: 'Algo deu errado',
    mensagem:
        'Ocorreu um erro ao atualizar sua categoria. Verifique sua conexão e tente novamente.',
    recuperavel: true
});

const codigosSessaoInvalida = new Set([
    'NAO_AUTENTICADO',
    'TOKEN_INVALIDO',
    'SESSAO_INVALIDA',
    'SESSAO_AUSENTE'
]);

//Cria uma cópia editável somente dos campos que pertencem ao formulário.
function copiarDadosCategoria(categoria) {
    return {
        nome: typeof categoria?.nome === 'string' ? categoria.nome : '',
        dadosVisiveis: Array.isArray(categoria?.dadosVisiveis) ? [...categoria.dadosVisiveis] : []
    };
}

//Normaliza o nome somente para detectar se houve uma alteração real.
function normalizarNomeComparacao(nome) {
    if (typeof nome !== 'string') {
        return '';
    }

    return nome.normalize('NFKC').trim().replace(/\s+/gu, ' ');
}

//Cria uma assinatura independente da ordem das permissões.
function criarAssinaturaDados(dados) {
    const permissoes = Array.isArray(dados?.dadosVisiveis)
        ? [
              ...new Set(dados.dadosVisiveis.filter((permissao) => typeof permissao === 'string'))
          ].sort()
        : [];

    return JSON.stringify({
        nome: normalizarNomeComparacao(dados?.nome),
        dadosVisiveis: permissoes
    });
}

//Confirma se existe a estrutura mínima necessária para editar a categoria.
function categoriaEhEditavel(categoria) {
    return (
        categoria !== null &&
        typeof categoria === 'object' &&
        !Array.isArray(categoria) &&
        Number.isSafeInteger(categoria.id) &&
        categoria.id > 0 &&
        typeof categoria.nome === 'string' &&
        Array.isArray(categoria.dadosVisiveis) &&
        categoria.dadosVisiveis.length > 0 &&
        Number.isSafeInteger(categoria.quantidadeContatos) &&
        categoria.quantidadeContatos >= 0 &&
        typeof categoria.atualizadoEm === 'string'
    );
}

//Converte códigos conhecidos em mensagens seguras para a interface.
function obterAlertaDoErro(erro) {
    if (erro?.codigo === ALERTA_DUPLICIDADE.codigo) {
        return ALERTA_DUPLICIDADE;
    }

    if (erro?.codigo === ALERTA_NOME.codigo) {
        return ALERTA_NOME;
    }

    if (erro?.codigo === ALERTA_PERMISSOES.codigo) {
        return ALERTA_PERMISSOES;
    }

    if (erro?.codigo === ALERTA_NAO_ENCONTRADA.codigo) {
        return ALERTA_NAO_ENCONTRADA;
    }

    if (
        erro?.codigo === ALERTA_VERSAO.codigo ||
        erro?.codigo === 'VERSAO_CATEGORIA_DESATUALIZADA'
    ) {
        return ALERTA_VERSAO;
    }

    if (
        erro?.status === 429 ||
        (typeof erro?.codigo === 'string' && erro.codigo.startsWith('LIMITE_'))
    ) {
        return ALERTA_LIMITE;
    }

    if (erro?.codigo === 'ERRO_VALIDACAO') {
        const detalhes = Array.isArray(erro.detalhes) ? erro.detalhes : [];

        const campos = new Set(detalhes.map((detalhe) => detalhe?.campo));

        if (campos.has('nome')) {
            return ALERTA_NOME;
        }

        if (campos.has('dadosVisiveis')) {
            return ALERTA_PERMISSOES;
        }
    }

    return ALERTA_INTERNO;
}

//Orquestra os estados da edição sem duplicar os controles internos do formulário.
function EditSupportCategoryScreen({
    categoria,
    carregando = false,
    editarCategoria,
    onVoltar,
    onCategoriaAtualizada,
    onConcluido,
    onSessaoExpirada
}) {
    const tema = useTheme();
    const categoriaInicialValida = categoriaEhEditavel(categoria);

    const [categoriaBase, definirCategoriaBase] = useState(
        categoriaInicialValida ? categoria : null
    );

    const [dados, definirDados] = useState(() => copiarDadosCategoria(categoria));

    const [salvando, definirSalvando] = useState(false);

    const [alertaErro, definirAlertaErro] = useState(null);

    const [sucessoVisivel, definirSucessoVisivel] = useState(false);

    const [categoriaAtualizada, definirCategoriaAtualizada] = useState(null);

    const [confirmacaoVisivel, definirConfirmacaoVisivel] = useState(false);

    const [quantidadeImpactada, definirQuantidadeImpactada] = useState(0);

    const pedidoPendente = useRef(null);

    const ultimaTentativa = useRef(null);

    const requisicaoEmAndamento = useRef(false);

    const telaMontada = useRef(true);

    const servicoDisponivel = typeof editarCategoria === 'function';

    const assinaturaInicial = useMemo(
        () => criarAssinaturaDados(copiarDadosCategoria(categoriaBase)),
        [categoriaBase]
    );

    const assinaturaAtual = useMemo(() => criarAssinaturaDados(dados), [dados]);

    const possuiAlteracao = categoriaBase !== null && assinaturaAtual !== assinaturaInicial;

    const carregandoInicial = carregando || (categoriaBase === null && categoria === undefined);

    useEffect(() => {
        telaMontada.current = true;
        return () => {
            telaMontada.current = false;
        };
    }, []);

    //Atualiza o formulário quando a navegação entrega uma nova categoria.
    useEffect(() => {
        if (requisicaoEmAndamento.current || !categoriaEhEditavel(categoria)) {
            return;
        }

        definirCategoriaBase(categoria);

        definirDados(copiarDadosCategoria(categoria));
    }, [categoria]);

    //Atualiza somente os campos controlados pelo formulário.
    const alterarDados = useCallback((alteracoes) => {
        if (
            requisicaoEmAndamento.current ||
            alteracoes === null ||
            typeof alteracoes !== 'object' ||
            Array.isArray(alteracoes)
        ) {
            return;
        }

        definirDados((dadosAtuais) => {
            const novosDados = {
                ...dadosAtuais
            };

            if (typeof alteracoes.nome === 'string') {
                novosDados.nome = alteracoes.nome;
            }

            if (Array.isArray(alteracoes.dadosVisiveis)) {
                novosDados.dadosVisiveis = [
                    ...new Set(
                        alteracoes.dadosVisiveis.filter(
                            (permissao) => typeof permissao === 'string'
                        )
                    )
                ];
            }

            return novosDados;
        });
    }, []);

    const mostrarErroValidacao = useCallback((erro) => {
        if (erro?.codigo === ALERTA_NOME.codigo) {
            definirAlertaErro(ALERTA_NOME);
            return;
        }

        if (erro?.codigo === ALERTA_PERMISSOES.codigo) {
            definirAlertaErro(ALERTA_PERMISSOES);
            return;
        }

        definirAlertaErro(ALERTA_INTERNO);
    }, []);

    //Finaliza uma edição validada e mantém a categoria retornada como nova referência.
    const executarAtualizacao = useCallback(
        async (pedido) => {
            if (requisicaoEmAndamento.current || !servicoDisponivel || categoriaBase === null) {
                return;
            }

            requisicaoEmAndamento.current = true;

            ultimaTentativa.current = pedido;

            definirSalvando(true);
            definirAlertaErro(null);

            try {
                const resultado = await editarCategoria(categoriaBase.id, pedido);

                if (!categoriaEhEditavel(resultado)) {
                    throw new Error('Resposta inválida ao atualizar categoria.');
                }

                if (!telaMontada.current) {
                    return;
                }

                definirCategoriaBase(resultado);

                definirDados(copiarDadosCategoria(resultado));

                definirCategoriaAtualizada(resultado);

                definirConfirmacaoVisivel(false);

                definirQuantidadeImpactada(0);

                pedidoPendente.current = null;

                ultimaTentativa.current = null;

                definirSucessoVisivel(true);

                try {
                    onCategoriaAtualizada?.(resultado);
                } catch {
                    //A atualização já foi concluída e não deve ser repetida por falha de navegação.
                }
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

                if (erro?.codigo === 'CONFIRMACAO_IMPACTO_NECESSARIA') {
                    const quantidade = erro?.detalhes?.quantidadeContatos;

                    if (Number.isSafeInteger(quantidade) && quantidade > 0) {
                        pedidoPendente.current = {
                            nome: pedido.nome,
                            dadosVisiveis: [...pedido.dadosVisiveis],
                            atualizadoEm: pedido.atualizadoEm
                        };

                        definirQuantidadeImpactada(quantidade);

                        definirConfirmacaoVisivel(true);

                        ultimaTentativa.current = null;

                        return;
                    }
                }

                definirAlertaErro(obterAlertaDoErro(erro));
            } finally {
                requisicaoEmAndamento.current = false;

                if (telaMontada.current) {
                    definirSalvando(false);
                }
            }
        },
        [categoriaBase, editarCategoria, onCategoriaAtualizada, onSessaoExpirada, servicoDisponivel]
    );

    //Valida a alteração e decide se a confirmação de impacto deve ser exibida.
    const solicitarAtualizacao = useCallback(() => {
        if (!possuiAlteracao || categoriaBase === null) {
            return;
        }

        const resultado = prepararCategoriaParaSalvar(dados);

        if (resultado.erro) {
            mostrarErroValidacao(resultado.erro);
            return;
        }

        const pedido = Object.freeze({
            nome: resultado.dados.nome,
            dadosVisiveis: Object.freeze([...resultado.dados.dadosVisiveis]),
            atualizadoEm: categoriaBase.atualizadoEm
        });

        if (categoriaBase.quantidadeContatos > 0) {
            pedidoPendente.current = pedido;

            definirQuantidadeImpactada(categoriaBase.quantidadeContatos);

            definirConfirmacaoVisivel(true);

            return;
        }

        executarAtualizacao(pedido);
    }, [categoriaBase, dados, executarAtualizacao, mostrarErroValidacao, possuiAlteracao]);

    //Confirma a quantidade exibida no modal e envia a edição ao backend.
    const confirmarImpacto = useCallback(() => {
        if (!pedidoPendente.current || quantidadeImpactada <= 0 || salvando) {
            return;
        }

        executarAtualizacao({
            ...pedidoPendente.current,
            quantidadeContatosConfirmada: quantidadeImpactada
        });
    }, [executarAtualizacao, quantidadeImpactada, salvando]);

    //Fecha a confirmação sem perder as alterações do formulário.
    const cancelarImpacto = useCallback(() => {
        if (salvando) {
            return;
        }

        definirConfirmacaoVisivel(false);

        definirQuantidadeImpactada(0);

        pedidoPendente.current = null;
    }, [salvando]);

    //Repete somente a requisição que falhou anteriormente.
    const tentarNovamente = useCallback(() => {
        if (ultimaTentativa.current) {
            executarAtualizacao(ultimaTentativa.current);
        }
    }, [executarAtualizacao]);

    const fecharErro = useCallback(() => {
        if (!salvando) {
            definirAlertaErro(null);
        }
    }, [salvando]);

    const concluirAtualizacao = useCallback(() => {
        definirSucessoVisivel(false);

        onConcluido?.(categoriaAtualizada);
    }, [categoriaAtualizada, onConcluido]);

    const voltar = useCallback(() => {
        if (!requisicaoEmAndamento.current) {
            onVoltar?.();
        }
    }, [onVoltar]);

    return (
        <>
            <SettingsLayout
                titulo="Atualizar Categoria"
                onVoltar={voltar}
                rodapeFixo
                rodape={
                    <ButtonScreen
                        texto="Atualizar"
                        aoPressionar={solicitarAtualizacao}
                        desativado={
                            carregandoInicial ||
                            salvando ||
                            !servicoDisponivel ||
                            !possuiAlteracao ||
                            categoriaBase === null
                        }
                        carregando={salvando}
                        variante="laranja"
                    />
                }
            >
                <View style={estilos.conteudo}>
                    {carregandoInicial ? (
                        <View
                            testID="carregando-categoria"
                            accessibilityLabel="Carregando categoria"
                            style={estilos.carregamento}
                        >
                            <ActivityIndicator size="large" color={tema.cores.marca.secundaria} />
                        </View>
                    ) : (
                        <SupportCategoryForm
                            dados={dados}
                            aoAlterar={alterarDados}
                            aoSalvar={executarAtualizacao}
                            aoErroValidacao={mostrarErroValidacao}
                            carregando={salvando}
                            bloqueado={!servicoDisponivel || categoriaBase === null}
                            exibirAcao={false}
                        />
                    )}
                </View>
            </SettingsLayout>

            <CategoryImpactConfirmationModal
                visivel={confirmacaoVisivel}
                quantidadeContatos={quantidadeImpactada}
                carregando={salvando}
                onConfirmar={confirmarImpacto}
                onCancelar={cancelarImpacto}
            />

            <SimpleModal
                visivel={alertaErro !== null}
                aoFechar={fecharErro}
                icone={WarningCircleIcon}
                corIcone={
                    alertaErro?.recuperavel
                        ? tema.cores.interface.textoSecundario
                        : tema.cores.marca.primaria
                }
                fundoIcone={
                    alertaErro?.recuperavel
                        ? tema.cores.interface.borda
                        : tema.cores.icones.configuracoes.laranja.caixa
                }
                titulo={alertaErro?.titulo}
                mensagem={alertaErro?.mensagem}
                acaoPrincipal={
                    alertaErro?.recuperavel
                        ? {
                              texto: 'Tentar novamente',
                              variante: 'preto',
                              aoPressionar: tentarNovamente,
                              carregando: salvando
                          }
                        : {
                              texto: 'OK',
                              variante: 'verde',
                              aoPressionar: fecharErro
                          }
                }
                acaoSecundaria={
                    alertaErro?.recuperavel
                        ? {
                              texto: 'Voltar',
                              variante: 'branco',
                              aoPressionar: fecharErro,
                              desativado: salvando
                          }
                        : undefined
                }
            />

            <SimpleModal
                visivel={sucessoVisivel}
                aoFechar={concluirAtualizacao}
                icone={BellIcon}
                corIcone={tema.cores.marca.primaria}
                fundoIcone={tema.cores.icones.configuracoes.laranja.caixa}
                titulo="Categoria atualizada com sucesso"
                acaoPrincipal={{
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: concluirAtualizacao
                }}
            />
        </>
    );
}

export { EditSupportCategoryScreen };
