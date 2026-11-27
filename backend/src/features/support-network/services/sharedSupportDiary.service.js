import { diferencaDias, formatarData, paraDataCalendario } from '../../cycles/utils/calendar.js';
import { CATALOGO_DIARIO } from '../../diary/catalog/diary.catalog.js';
import { apresentarDetalheRegistro } from '../../diary/presenters/diaryEntry.presenter.js';
import { apresentarResumoRegistro } from '../../diary/presenters/diaryHistory.presenter.js';
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

function criarSharedSupportDiary({
    prisma,
    currentCycleService,
    diaryOverviewService,
    diaryDetailService
}) {
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

    function apresentarResumo(registro, { visiveis, exibirFaseHistorica }, ciclos) {
        const ciclo = ciclos.find(({ dataInicio }) => dataInicio <= registro.dataRegistro);
        const dia = ciclo ? diferencaDias(ciclo.dataInicio, registro.dataRegistro) + 1 : null;
        const { id, data, fase, diaCiclo, principais, maisQuantidade, trechoAnotacao } =
            apresentarResumoRegistro(registro, visiveis, dia);
        return {
            id,
            data,
            ...(exibirFaseHistorica ? { fase, diaCiclo } : {}),
            principais,
            maisQuantidade,
            trechoAnotacao
        };
    }

    async function resumo(acesso) {
        const { visiveis } = await preparar(acesso);
        const { titularId, permissoes } = acesso;
        const fase = permissoes.includes('geral.fase_atual')
            ? ((
                  await currentCycleService.buscarEstadoAtual({ usuarioId: titularId })
              ).faseAtual?.toLowerCase() ?? null)
            : null;
        const { diasRegistrados, destaques, informacoesSuficientes } =
            await diaryOverviewService.buscar(titularId, fase, visiveis);
        return { fase, diasRegistrados, destaques, informacoesSuficientes };
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
        const ciclos =
            exibirFaseHistorica && pagina.length
                ? await prisma.registroCiclo.findMany({
                      where: {
                          usuarioId: acesso.titularId,
                          dataInicio: { lte: pagina[0].dataRegistro }
                      },
                      orderBy: [{ dataInicio: 'desc' }, { id: 'desc' }],
                      select: { dataInicio: true }
                  })
                : [];
        return {
            itens: pagina.map((registro) => apresentarResumo(registro, contexto, ciclos)),
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
        const ciclo = contexto.exibirFaseHistorica
            ? await diaryDetailService.buscarContextoCiclo(acesso.titularId, registro.dataRegistro)
            : null;
        const {
            id,
            data,
            fase,
            categorias: categoriasVisiveis
        } = apresentarDetalheRegistro(registro, ciclo, contexto.visiveis);
        return {
            id,
            data,
            ...(contexto.exibirFaseHistorica ? { fase, ciclo } : {}),
            categorias: categoriasVisiveis
        };
    }

    return { catalogo, listar, buscar, resumo };
}

export { criarSharedSupportDiary };
