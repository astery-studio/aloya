import { formatarData, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { CATALOGO_DIARIO } from '../../diary/catalog/diary.catalog.js';
import { apresentarDetalheRegistro } from '../../diary/presenters/diaryEntry.presenter.js';
import { obterCategoriasAtivas } from '../../diary/services/diaryActiveCategories.js';
import { criarWhereHistorico } from '../../diary/services/diaryHistory.query.js';
import { codificarCursor, decodificarCursor } from '../../diary/utils/diaryCursor.js';
import { validarHistorico } from '../../diary/validators/diaryHistory.validator.js';
import { lerIdCompartilhado, negarAcessoCompartilhado } from './sharedSupportAccess.service.js';

const PREFIXOS = {
    ciclo_sangramento: 'ciclo',
    corpo_sintomas_fisicos: 'corpo',
    emocional: 'emocional',
    energia_sono: 'energia',
    vida_intima_social: 'vida_intima',
    saude_acompanhamento: 'saude'
};

function criarSharedSupportDiary({ prisma }) {
    async function preparar({ titularId, permissoes }) {
        const concedidas = CATALOGO_DIARIO.flatMap((macro) =>
            macro.categorias
                .filter(({ id }) => permissoes.includes(`${PREFIXOS[macro.id]}.${id}`))
                .map(({ id }) => id)
        );
        if (!concedidas.length) negarAcessoCompartilhado();

        const [macros, categorias] = await Promise.all([
            prisma.preferenciaMacrocategoriaDiario.findMany({ where: { usuarioId: titularId } }),
            prisma.preferenciaCategoriaDiario.findMany({ where: { usuarioId: titularId } })
        ]);
        const ativas = obterCategoriasAtivas(macros, categorias);

        return {
            visiveis: new Set(concedidas.filter((id) => ativas.has(id))),
            exibirFaseHistorica:
                permissoes.includes('geral.historico_ciclo') &&
                permissoes.includes('geral.fase_atual')
        };
    }

    function selecionarCategorias(visiveis) {
        return {
            where: { categoriaId: { in: [...visiveis] } },
            include: { opcoes: true, medicaoTemperatura: true }
        };
    }

    function apresentar(registro, { visiveis, exibirFaseHistorica }) {
        const { id, data, fase, categorias } = apresentarDetalheRegistro(registro, null, visiveis);
        return { id, data, ...(exibirFaseHistorica ? { fase } : {}), categorias };
    }

    async function catalogo(acesso) {
        const { visiveis } = await preparar(acesso);
        const macrocategorias = CATALOGO_DIARIO.map(({ id, nome, categorias }) => ({
            id,
            nome,
            categorias: categorias
                .filter((categoria) => visiveis.has(categoria.id))
                .map(({ id, nome }) => ({ id, nome }))
        })).filter(({ categorias }) => categorias.length);
        return { macrocategorias };
    }

    async function listar(acesso, query) {
        const contexto = await preparar(acesso);
        const { visiveis, exibirFaseHistorica } = contexto;
        const { limite, cursor, filtros } = validarHistorico(query);
        if (
            filtros.categorias.some((id) => !visiveis.has(id)) ||
            (filtros.fases.length && !exibirFaseHistorica)
        ) {
            negarAcessoCompartilhado();
        }

        const assinatura = { filtros, titularId: acesso.titularId, categorias: [...visiveis] };
        const posicao = cursor ? decodificarCursor(cursor, assinatura) : null;
        const where = criarWhereHistorico(acesso.titularId, filtros, null, visiveis);
        if (posicao) {
            const ancora = await prisma.registroDiario.findFirst({
                where: { ...where, id: posicao.id, dataRegistro: paraDataCalendario(posicao.data) },
                select: { id: true }
            });
            if (!ancora) negarAcessoCompartilhado();
        }

        const registros = await prisma.registroDiario.findMany({
            where: criarWhereHistorico(acesso.titularId, filtros, posicao, visiveis),
            orderBy: [{ dataRegistro: 'desc' }, { id: 'desc' }],
            take: limite + 1,
            include: { categorias: selecionarCategorias(visiveis) }
        });
        const pagina = registros.slice(0, limite);
        const ultimo = pagina.at(-1);
        return {
            itens: pagina.map((registro) => apresentar(registro, contexto)),
            proximoCursor:
                registros.length > limite
                    ? codificarCursor(
                          { data: formatarData(ultimo.dataRegistro), id: ultimo.id },
                          assinatura
                      )
                    : null
        };
    }

    async function buscar(acesso, registroId) {
        const contexto = await preparar(acesso);
        const categorias = selecionarCategorias(contexto.visiveis);
        const registro = await prisma.registroDiario.findFirst({
            where: {
                id: lerIdCompartilhado(registroId),
                usuarioId: acesso.titularId,
                categorias: { some: categorias.where }
            },
            include: { categorias }
        });
        if (!registro) negarAcessoCompartilhado();
        return apresentar(registro, contexto);
    }

    return { catalogo, listar, buscar };
}

export { criarSharedSupportDiary };
