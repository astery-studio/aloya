//Mostra alertas comuns e confirmações que exigem a senha atual da pessoa usuária.
import { Text, View } from 'react-native';
import { LockKeyIcon } from 'phosphor-react-native/src/icons/LockKey';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';

import ButtonPopup from '../../../common/Button/ButtonPopup';
import PasswordInput from '../../../forms/PasswordInput';
import AppModal from '../AppModal';
import { estilos } from './AlertModal.styles';
import { useTheme } from '../../../../hooks/useTheme';
import { criarAparenciaErroInterno } from '../InternalErrorModal.styles';

function ignorarFechamento() {}

export default function AlertModal({
    variante = 'padrao',
    visivel,
    aoFechar,
    icone,
    titulo,
    mensagem,
    destaque,
    senha = '',
    aoAlterarSenha,
    erroSenha,
    acaoPrincipal,
    acaoSecundaria,
    aparencia: aparenciaInformada = {},
    erroInterno = false
}) {
    const comSenha = variante === 'comSenha';
    const confirmacao = variante === 'confirmacao';
    const senhaAtual = typeof senha === 'string' ? senha : '';
    const Icone = icone === undefined ? (comSenha ? LockKeyIcon : WarningCircleIcon) : icone;
    const acaoPadrao =
        !comSenha && !acaoPrincipal && typeof aoFechar === 'function'
            ? { texto: 'Entendi', aoPressionar: aoFechar }
            : null;
    const principal = acaoPrincipal || acaoPadrao;
    const secundariaPadrao =
        comSenha && !acaoSecundaria && typeof aoFechar === 'function'
            ? { texto: 'Cancelar', aoPressionar: aoFechar }
            : null;
    const secundaria = acaoSecundaria || secundariaPadrao;
    const carregando = Boolean(principal?.carregando);
    const possuiAcao = Boolean(principal || secundaria);
    const principalDesativada = Boolean(
        principal?.desativado || (comSenha && senhaAtual.length === 0)
    );
    const fechamentoDoModal = carregando ? ignorarFechamento : aoFechar;

    if (!['padrao', 'comSenha', 'confirmacao'].includes(variante)) {
        throw new Error(`Variante de AlertModal inválida: ${variante}`);
    }

    if (visivel && comSenha && !acaoPrincipal) {
        throw new Error('AlertModal com senha precisa de uma ação principal.');
    }

    if (visivel && comSenha && typeof aoAlterarSenha !== 'function') {
        throw new Error('AlertModal com senha precisa da função aoAlterarSenha.');
    }

    if (visivel && !possuiAcao) {
        throw new Error('AlertModal precisa de pelo menos uma ação ou de uma função aoFechar.');
    }

    const tema = useTheme();
    const aparenciaConfirmacao = confirmacao
        ? {
              fundoIcone: tema.escuro ? tema.cores.interface.separador : '#F5EDE3',
              corIcone: tema.cores.marca.primaria,
              icone: { borderRadius: 12 }
          }
        : {};
    const aparenciaErro = erroInterno ? criarAparenciaErroInterno(tema) : {};
    const aparencia = {
        ...aparenciaConfirmacao,
        ...aparenciaInformada,
        ...aparenciaErro,
        icone: [aparenciaConfirmacao.icone, aparenciaInformada.icone, aparenciaErro.icone]
    };

    return (
        <AppModal
            variante={comSenha || confirmacao || erroInterno ? 'acao' : 'alerta'}
            visivel={visivel}
            aoFechar={fechamentoDoModal}
            icone={Icone}
            titulo={titulo}
            mensagem={mensagem}
            destaque={destaque}
            estilo={aparencia.modal}
            fundoIcone={aparencia.fundoIcone}
            corIcone={aparencia.corIcone}
            estiloIcone={aparencia.icone}
            estiloCabecalho={aparencia.cabecalho}
            estiloIconeCabecalho={aparencia.iconeCabecalho}
            corIconeCabecalho={aparencia.corIconeCabecalho}
        >
            {comSenha ? (
                <View style={estilos.campoSenha}>
                    <PasswordInput
                        label="Senha atual"
                        placeholder="Senha atual"
                        value={senhaAtual}
                        onChangeText={aoAlterarSenha}
                        variante="popup"
                        estilo={aparencia.senha?.campo}
                        estiloFocado={aparencia.senha?.campoFocado}
                        estiloEntrada={[
                            aparencia.senha?.texto,
                            senhaAtual.length > 0 && aparencia.senha?.textoPreenchido
                        ]}
                        estiloEntradaFocada={aparencia.senha?.textoFocado}
                        corIcone={aparencia.senha?.corIcone}
                        {...(aparencia.senha?.corPlaceholder
                            ? { placeholderTextColor: aparencia.senha.corPlaceholder }
                            : {})}
                        desativado={carregando}
                        autoComplete="current-password"
                        textContentType="password"
                        returnKeyType="done"
                    />

                    {erroSenha ? (
                        <Text
                            accessibilityRole="alert"
                            accessibilityLiveRegion="polite"
                            style={[
                                estilos.erroSenha,
                                aparencia.erroSenha,
                                tema.escuro && { color: '#EF9A9A' }
                            ]}
                        >
                            {erroSenha}
                        </Text>
                    ) : null}
                </View>
            ) : null}

            {principal ? (
                <ButtonPopup
                    texto={principal.texto}
                    aoPressionar={principal.aoPressionar}
                    variante={principal.variante || 'vermelho'}
                    desativado={principalDesativada}
                    carregando={carregando}
                    rotuloAcessibilidade={principal.rotuloAcessibilidade}
                    estilo={[
                        { width: '100%' },
                        aparencia.botaoPrincipal,
                        principalDesativada && aparencia.botaoPrincipalDesativado
                    ]}
                    estiloTexto={[
                        aparencia.textoPrincipal,
                        principalDesativada && aparencia.textoPrincipalDesativado
                    ]}
                />
            ) : null}

            {secundaria ? (
                <ButtonPopup
                    texto={secundaria.texto}
                    aoPressionar={secundaria.aoPressionar}
                    variante={secundaria.variante || 'branco'}
                    desativado={secundaria.desativado || carregando}
                    carregando={secundaria.carregando}
                    rotuloAcessibilidade={secundaria.rotuloAcessibilidade}
                    estilo={[{ width: '100%' }, aparencia.botaoSecundario]}
                    estiloTexto={aparencia.textoSecundario}
                />
            ) : null}
        </AppModal>
    );
}
