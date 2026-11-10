//Permite preparar e aplicar filtros de estado e permissão aos contatos.
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ButtonPopup from '../../../../shared/components/common/Button/ButtonPopup/ButtonPopup';
import AppModal from '../../../../shared/components/feedback/Modal/ModalBase/AppModal';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { ContactFilterChip } from '../ContactFilterChip/ContactFilterChip';
import { criarEstilos } from './ContactFiltersModal.styles';

const ESTADOS_CONTATO = Object.freeze([
    Object.freeze({
        id: 'pendente',
        rotulo: 'Pendente'
    }),
    Object.freeze({
        id: 'ativo',
        rotulo: 'Ativo'
    }),
    Object.freeze({
        id: 'inativo',
        rotulo: 'Inativo'
    }),
    Object.freeze({
        id: 'recusado',
        rotulo: 'Convite Recusado'
    })
]);

const ESTADOS_PERMITIDOS = new Set(ESTADOS_CONTATO.map(({ id }) => id));

const FILTROS_VAZIOS = Object.freeze({
    estados: Object.freeze([]),
    categoriaIds: Object.freeze([]),
    permissaoIndividual: false
});

function idCategoriaEhValido(id) {
    return (Number.isSafeInteger(id) && id > 0) || (typeof id === 'string' && id.trim().length > 0);
}

function normalizarCategorias(categorias) {
    if (!Array.isArray(categorias)) {
        return [];
    }

    const identificadores = new Set();

    return categorias
        .filter((categoria) => {
            const idValido = idCategoriaEhValido(categoria?.id);

            const nomeValido =
                typeof categoria?.nome === 'string' && categoria.nome.trim().length > 0;

            const chave = String(categoria?.id);

            if (!idValido || !nomeValido || identificadores.has(chave)) {
                return false;
            }

            identificadores.add(chave);

            return true;
        })
        .map((categoria) => ({
            id: categoria.id,
            nome: categoria.nome.trim()
        }))
        .sort((primeira, segunda) =>
            primeira.nome.localeCompare(segunda.nome, 'pt-BR', {
                sensitivity: 'base'
            })
        );
}

function normalizarFiltros(filtros, categorias = []) {
    const filtrosSeguros =
        filtros !== null && typeof filtros === 'object' && !Array.isArray(filtros) ? filtros : {};

    const categoriasValidas = normalizarCategorias(categorias);

    const categoriasPorChave = new Map(
        categoriasValidas.map((categoria) => [String(categoria.id), categoria.id])
    );

    const estadosRecebidos = new Set(
        Array.isArray(filtrosSeguros.estados)
            ? filtrosSeguros.estados.filter((estado) => ESTADOS_PERMITIDOS.has(estado))
            : []
    );

    const categoriaIds = [];

    if (Array.isArray(filtrosSeguros.categoriaIds)) {
        const idsIncluidos = new Set();

        for (const categoriaId of filtrosSeguros.categoriaIds) {
            const chave = String(categoriaId);

            if (categoriasPorChave.has(chave) && !idsIncluidos.has(chave)) {
                idsIncluidos.add(chave);
                categoriaIds.push(categoriasPorChave.get(chave));
            }
        }
    }

    return {
        estados: ESTADOS_CONTATO.map(({ id }) => id).filter((estado) =>
            estadosRecebidos.has(estado)
        ),

        categoriaIds,

        permissaoIndividual: filtrosSeguros.permissaoIndividual === true
    };
}

function filtrosEstaoVazios(filtros) {
    const filtrosSeguros = normalizarFiltros(filtros);

    return (
        filtrosSeguros.estados.length === 0 &&
        filtrosSeguros.categoriaIds.length === 0 &&
        !filtrosSeguros.permissaoIndividual
    );
}

function idsIguais(primeiroId, segundoId) {
    return (
        idCategoriaEhValido(primeiroId) &&
        idCategoriaEhValido(segundoId) &&
        String(primeiroId) === String(segundoId)
    );
}

function ContactFiltersModal({ visivel, filtros, categorias = [], aoAplicar, aoFechar }) {
    const tema = useTheme();

    const estilos = useMemo(() => criarEstilos(tema), [tema]);

    const categoriasValidas = useMemo(() => normalizarCategorias(categorias), [categorias]);

    const [rascunho, definirRascunho] = useState(() =>
        normalizarFiltros(filtros, categoriasValidas)
    );

    const visivelAnterior = useRef(false);

    useEffect(() => {
        if (Boolean(visivel) && !visivelAnterior.current) {
            definirRascunho(normalizarFiltros(filtros, categoriasValidas));
        }

        visivelAnterior.current = Boolean(visivel);
    }, [categoriasValidas, filtros, visivel]);

    function alternarEstado(estado) {
        definirRascunho((atual) => {
            const selecionado = atual.estados.includes(estado);

            return {
                ...atual,
                estados: selecionado
                    ? atual.estados.filter((item) => item !== estado)
                    : [...atual.estados, estado]
            };
        });
    }

    function alternarCategoria(categoriaId) {
        definirRascunho((atual) => {
            const selecionada = atual.categoriaIds.some((id) => idsIguais(id, categoriaId));

            return {
                ...atual,
                categoriaIds: selecionada
                    ? atual.categoriaIds.filter((id) => !idsIguais(id, categoriaId))
                    : [...atual.categoriaIds, categoriaId]
            };
        });
    }

    function alternarPermissaoIndividual() {
        definirRascunho((atual) => ({
            ...atual,
            permissaoIndividual: !atual.permissaoIndividual
        }));
    }

    function limpar() {
        definirRascunho({
            estados: [],
            categoriaIds: [],
            permissaoIndividual: false
        });
    }

    function aplicar() {
        if (typeof aoAplicar !== 'function') {
            return;
        }

        aoAplicar(normalizarFiltros(rascunho, categoriasValidas));
    }

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
            titulo="Filtrar Contatos"
            estilo={estilos.modal}
        >
            <View testID="contact-filters-modal" style={estilos.conteudo}>
                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>FILTRO DE TIPO DE CONTATO</Text>

                    <View
                        accessibilityRole="group"
                        accessibilityLabel="Filtros de tipo de contato"
                        style={estilos.chips}
                    >
                        {ESTADOS_CONTATO.map(({ id, rotulo }) => (
                            <ContactFilterChip
                                key={id}
                                rotulo={rotulo}
                                grupo="estado"
                                selecionado={rascunho.estados.includes(id)}
                                aoPressionar={() => alternarEstado(id)}
                            />
                        ))}
                    </View>
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>FILTRO DE TIPO DE PERMISSÃO</Text>

                    <ScrollView
                        style={estilos.rolagemPermissoes}
                        contentContainerStyle={estilos.chips}
                        nestedScrollEnabled
                        bounces={false}
                        showsVerticalScrollIndicator={categoriasValidas.length > 6}
                    >
                        {categoriasValidas.map((categoria) => (
                            <ContactFilterChip
                                key={String(categoria.id)}
                                rotulo={categoria.nome}
                                grupo="permissao"
                                selecionado={rascunho.categoriaIds.some((id) =>
                                    idsIguais(id, categoria.id)
                                )}
                                aoPressionar={() => alternarCategoria(categoria.id)}
                            />
                        ))}

                        <ContactFilterChip
                            rotulo="Permissões Individuais"
                            grupo="permissao"
                            selecionado={rascunho.permissaoIndividual}
                            aoPressionar={alternarPermissaoIndividual}
                        />
                    </ScrollView>
                </View>

                <View style={estilos.acoes}>
                    <ButtonPopup
                        texto="Limpar"
                        variante="branco"
                        aoPressionar={limpar}
                        rotuloAcessibilidade="Limpar filtros de contatos"
                        estilo={estilos.botaoLimpar}
                        estiloTexto={estilos.textoBotaoLimpar}
                    />

                    <ButtonPopup
                        texto="Aplicar Filtro"
                        variante="verde"
                        aoPressionar={aplicar}
                        rotuloAcessibilidade="Aplicar filtros de contatos"
                        desativado={typeof aoAplicar !== 'function'}
                        estilo={estilos.botaoAplicar}
                        estiloTexto={estilos.textoBotaoAplicar}
                    />
                </View>
            </View>
        </AppModal>
    );
}

export {
    ESTADOS_CONTATO,
    FILTROS_VAZIOS,
    ContactFiltersModal,
    filtrosEstaoVazios,
    idsIguais,
    normalizarCategorias,
    normalizarFiltros
};
