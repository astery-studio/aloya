import { useCallback, useEffect, useMemo, useState } from 'react';

import { obterHojeDiario } from '../utils/diaryDate';
import { prepararFormularioDiario } from '../utils/diaryForm';
import {
    criarAssinaturaFormulario,
    criarCategoriasInativasPreservadas,
    criarValoresIniciaisEdicao
} from '../utils/diaryEditForm';

const MENSAGEM_SALVAMENTO =
    'Ocorreu um erro ao salvar registro. Verifique sua conexão e tente novamente.';
const MENSAGEM_REGISTRO_DUPLICADO =
    'Já existe um registro no Diário para esta data. Escolha outra data ou edite o registro existente.';
const MENSAGEM_CONFLITO_EDICAO =
    'Este registro foi alterado em outro dispositivo. Reabra-o para editar a versão mais recente.';

function useDiaryEntryForm({
    ativo,
    catalogo,
    service,
    modo = 'criar',
    dataInicial,
    registroInicial,
    onCriado,
    onSalvo,
    onSessaoExpirada
}) {
    const [data, setData] = useState(() => dataInicial || obterHojeDiario());
    const [valores, setValores] = useState({});
    const [erros, setErros] = useState({});
    const [erroSalvamento, setErroSalvamento] = useState(null);
    const [conflitoVersao, setConflitoVersao] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const editando = modo === 'editar';
    const valoresIniciais = useMemo(
        () => (editando ? criarValoresIniciaisEdicao(registroInicial) : {}),
        [editando, registroInicial]
    );

    useEffect(() => {
        if (!ativo) return;
        setData(
            editando && registroInicial?.data
                ? registroInicial.data
                : dataInicial || obterHojeDiario()
        );
        setValores(valoresIniciais);
        setErros({});
        setErroSalvamento(null);
        setConflitoVersao(false);
        setSalvando(false);
    }, [
        ativo,
        dataInicial,
        editando,
        registroInicial?.data,
        registroInicial?.id,
        registroInicial?.versao,
        valoresIniciais
    ]);

    const alterado = useMemo(() => {
        if (!editando || !registroInicial || !catalogo) return false;
        const hoje = obterHojeDiario();
        return (
            criarAssinaturaFormulario({ catalogo, valores, data, hoje }) !==
            criarAssinaturaFormulario({
                catalogo,
                valores: valoresIniciais,
                data: registroInicial.data,
                hoje
            })
        );
    }, [catalogo, data, editando, registroInicial, valores, valoresIniciais]);

    const alterarValor = useCallback((categoriaId, valor) => {
        setValores((atuais) => ({ ...atuais, [categoriaId]: valor }));
        setErros((atuais) => {
            if (!atuais[categoriaId] && !atuais.conteudo) return atuais;
            const proximos = { ...atuais };
            delete proximos[categoriaId];
            delete proximos.conteudo;
            return proximos;
        });
    }, []);

    const limparErroSalvamento = useCallback(() => {
        setErroSalvamento(null);
        setConflitoVersao(false);
    }, []);

    const salvar = useCallback(async () => {
        const acaoDisponivel = editando
            ? typeof service?.editarRegistro === 'function'
            : typeof service?.criarRegistro === 'function';
        if (salvando || !acaoDisponivel || (editando && !alterado)) return false;
        const formulario = prepararFormularioDiario({
            catalogo,
            valores,
            data,
            hoje: obterHojeDiario()
        });
        if (editando) {
            formulario.dados.categorias.push(
                ...criarCategoriasInativasPreservadas(catalogo, registroInicial)
            );
            if (formulario.dados.categorias.length > 0) delete formulario.erros.conteudo;
            formulario.valido = Object.keys(formulario.erros).length === 0;
        }
        setErros(formulario.erros);
        if (!formulario.valido) return false;

        setSalvando(true);
        setErroSalvamento(null);
        setConflitoVersao(false);
        try {
            const registro = editando
                ? await service.editarRegistro(
                      registroInicial.id,
                      registroInicial.versao,
                      formulario.dados
                  )
                : await service.criarRegistro(formulario.dados);
            await onSalvo?.(registro);
            if (!editando) await onCriado?.(registro);
            return true;
        } catch (erro) {
            if (erro?.status === 401) onSessaoExpirada?.();
            const registroDuplicado =
                erro?.status === 409 && erro?.codigo === 'REGISTRO_DIARIO_DUPLICADO';
            const conflitoEdicao = editando && erro?.status === 409 && !registroDuplicado;
            setConflitoVersao(conflitoEdicao);
            setErroSalvamento(
                registroDuplicado
                    ? MENSAGEM_REGISTRO_DUPLICADO
                    : conflitoEdicao
                      ? MENSAGEM_CONFLITO_EDICAO
                      : MENSAGEM_SALVAMENTO
            );
            return false;
        } finally {
            setSalvando(false);
        }
    }, [
        alterado,
        catalogo,
        data,
        editando,
        onCriado,
        onSalvo,
        onSessaoExpirada,
        registroInicial,
        salvando,
        service,
        valores
    ]);

    return {
        data,
        setData,
        valores,
        erros,
        erroSalvamento,
        conflitoVersao,
        salvando,
        alterado,
        alterarValor,
        limparErroSalvamento,
        salvar
    };
}

export {
    MENSAGEM_CONFLITO_EDICAO,
    MENSAGEM_REGISTRO_DUPLICADO,
    MENSAGEM_SALVAMENTO,
    useDiaryEntryForm
};
