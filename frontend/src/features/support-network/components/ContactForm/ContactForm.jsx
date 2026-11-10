//Reúne e-mail, aparência, vínculo e ação de salvar um contato.
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { UserGearIcon, UsersIcon } from '../../../../shared/components/icons/AppIcons';
import EmailInput from '../../../../shared/components/forms/EmailInput';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { corContatoEhValida, iconeContatoEhValido } from '../../constants/contactAppearanceOptions';
import { ContactAppearancePicker } from '../ContactAppearancePicker/ContactAppearancePicker';
import { normalizarPermissoesSelecionadas } from '../PermissionBulkSelector/PermissionBulkSelector';
import {
    SupportCategorySelector,
    idCategoriaEhValido
} from '../SupportCategorySelector/SupportCategorySelector';
import { criarEstilos } from './ContactForm.styles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const TAMANHO_MAXIMO_EMAIL = 254;

function normalizarModo(modo) {
    return modo === 'edicao' ? 'edicao' : 'cadastro';
}

function emailContatoEhValido(email) {
    if (typeof email !== 'string') {
        return false;
    }

    const emailNormalizado = email.trim().toLowerCase();

    return emailNormalizado.length <= TAMANHO_MAXIMO_EMAIL && EMAIL_REGEX.test(emailNormalizado);
}

function prepararContatoParaSalvar(dados) {
    const email = typeof dados?.email === 'string' ? dados.email.trim().toLowerCase() : '';

    const iconeId = dados?.iconeId;
    const corId = dados?.corId;

    const categoriaValida = idCategoriaEhValido(dados?.categoriaId);

    const permissoesIndividuais = normalizarPermissoesSelecionadas(dados?.permissoesIndividuais);

    const possuiPermissoesIndividuais = permissoesIndividuais.length > 0;

    const possuiExatamenteUmVinculo = categoriaValida !== possuiPermissoesIndividuais;

    if (
        !emailContatoEhValido(email) ||
        !iconeContatoEhValido(iconeId) ||
        !corContatoEhValida(corId) ||
        !possuiExatamenteUmVinculo
    ) {
        return null;
    }

    const contato = {
        email,
        iconeId,
        corId
    };

    if (categoriaValida) {
        contato.categoriaId = dados.categoriaId;
    } else {
        contato.permissoesIndividuais = permissoesIndividuais;
    }

    return Object.freeze(contato);
}

function ContactForm({
    dados,
    categorias = [],
    modo = 'cadastro',
    aoAlterar,
    aoSalvar,
    aoAbrirPermissoes,
    aoCriarCategoria,
    carregando = false,
    alterado = false,
    erros = {}
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const modoSeguro = normalizarModo(modo);
    const editando = modoSeguro === 'edicao';

    const email = typeof dados?.email === 'string' ? dados.email : '';

    const erroEmailLocal =
        email.trim().length > 0 && !emailContatoEhValido(email)
            ? 'Informe um e-mail válido.'
            : null;

    const iconeId = typeof dados?.iconeId === 'string' ? dados.iconeId : null;

    const corId = typeof dados?.corId === 'string' ? dados.corId : null;

    const categoriaId = dados?.categoriaId ?? null;

    const permissoesIndividuais = normalizarPermissoesSelecionadas(dados?.permissoesIndividuais);

    const dadosPreparados = prepararContatoParaSalvar({
        email,
        iconeId,
        corId,
        categoriaId,
        permissoesIndividuais
    });

    const camposBloqueados = carregando || typeof aoAlterar !== 'function';

    const formularioValido = dadosPreparados !== null;

    const salvarBloqueado =
        carregando ||
        !formularioValido ||
        (editando && !alterado) ||
        typeof aoSalvar !== 'function';

    const errosSeguros = erros && typeof erros === 'object' && !Array.isArray(erros) ? erros : {};

    function alterarEmail(novoEmail) {
        if (!camposBloqueados) {
            aoAlterar({
                email: novoEmail
            });
        }
    }

    function alterarAparencia(novaAparencia) {
        if (!camposBloqueados) {
            aoAlterar({
                iconeId: novaAparencia.iconeId,
                corId: novaAparencia.corId
            });
        }
    }

    function selecionarCategoria(novaCategoriaId) {
        if (!camposBloqueados) {
            aoAlterar({
                categoriaId: novaCategoriaId,
                permissoesIndividuais: []
            });
        }
    }

    function abrirPermissoes() {
        if (!carregando && typeof aoAbrirPermissoes === 'function') {
            aoAbrirPermissoes();
        }
    }

    function criarCategoria() {
        if (!carregando && typeof aoCriarCategoria === 'function') {
            aoCriarCategoria();
        }
    }

    function salvar() {
        if (!salvarBloqueado && dadosPreparados) {
            return aoSalvar(dadosPreparados);
        }
    }

    return (
        <View testID="contact-form" style={estilos.container}>
            <EmailInput
                label="E-mail do Contato"
                placeholder="Digite o e-mail do contato convidado"
                value={email}
                onChangeText={alterarEmail}
                erro={errosSeguros.email ?? erroEmailLocal}
                destacarErro={false}
                estiloErro={estilos.erroEmail}
                desativado={camposBloqueados || editando}
                variante="categoria"
                maxLength={TAMANHO_MAXIMO_EMAIL}
                returnKeyType="next"
                autoCorrect={false}
            />

            <ContactAppearancePicker
                iconeId={iconeId}
                corId={corId}
                aoAlterar={camposBloqueados ? undefined : alterarAparencia}
                desabilitado={camposBloqueados}
            />

            {errosSeguros.aparencia ? (
                <Text
                    accessible
                    accessibilityRole="alert"
                    accessibilityLabel={errosSeguros.aparencia}
                    style={estilos.erro}
                >
                    {errosSeguros.aparencia}
                </Text>
            ) : null}

            <View style={estilos.permissoes}>
                <Text style={estilos.tituloSecao}>Permissões do Contato</Text>

                <ButtonScreen
                    texto="Cadastrar Permissões Individuais"
                    rotuloAcessibilidade="Cadastrar permissões individuais"
                    icone={UserGearIcon}
                    tamanhoIcone={18}
                    variante="laranja"
                    aoPressionar={abrirPermissoes}
                    desativado={carregando || typeof aoAbrirPermissoes !== 'function'}
                    estilo={estilos.botaoPermissao}
                    estiloTexto={estilos.textoBotaoPermissao}
                />

                <ButtonScreen
                    texto="Cadastrar Categoria Nova"
                    rotuloAcessibilidade="Cadastrar categoria nova"
                    icone={UsersIcon}
                    tamanhoIcone={18}
                    variante="verde"
                    aoPressionar={criarCategoria}
                    desativado={carregando || typeof aoCriarCategoria !== 'function'}
                    estilo={estilos.botaoPermissao}
                    estiloTexto={estilos.textoBotaoPermissao}
                />

                <SupportCategorySelector
                    categorias={categorias}
                    categoriaId={categoriaId}
                    aoSelecionar={camposBloqueados ? undefined : selecionarCategoria}
                    desabilitado={camposBloqueados}
                />

                {errosSeguros.permissao ? (
                    <Text
                        accessible
                        accessibilityRole="alert"
                        accessibilityLabel={errosSeguros.permissao}
                        style={estilos.erro}
                    >
                        {errosSeguros.permissao}
                    </Text>
                ) : null}
            </View>

            <View style={estilos.acao}>
                <ButtonScreen
                    texto="Salvar"
                    rotuloAcessibilidade={
                        editando ? 'Salvar alterações do contato' : 'Salvar novo contato'
                    }
                    variante="laranja"
                    aoPressionar={salvar}
                    desativado={salvarBloqueado}
                    carregando={carregando}
                />
            </View>
        </View>
    );
}

export { ContactForm, emailContatoEhValido, normalizarModo, prepararContatoParaSalvar };
