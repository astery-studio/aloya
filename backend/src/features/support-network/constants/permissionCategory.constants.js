//Centraliza os únicos identificadores de permissão aceitos nas categorias da Rede de Apoio.
const permissoesDaCategoria = Object.freeze([
    'geral.fase_atual',
    'geral.anticoncepcionais',
    'geral.historico_ciclo',
    'geral.alerta_anticoncepcional',
    'geral.dicas',
    'ciclo.fluxo_menstrual',
    'ciclo.sangramento_escape',
    'ciclo.secrecao_corrimento',
    'corpo.sintomas_fisicos',
    'corpo.pele',
    'corpo.cabelo',
    'corpo.digestao',
    'corpo.banheiro',
    'corpo.regiao_genital',
    'corpo.torax_peito',
    'corpo.temperatura_basal',
    'corpo.peso',
    'emocional.sintomas_emocionais',
    'emocional.sintomas_pre_menstruais',
    'energia.energia',
    'energia.qualidade_sono',
    'energia.tempo_sono',
    'vida_intima.atividade_sexual',
    'vida_intima.autoerotismo',
    'vida_intima.desejo_libido',
    'vida_intima.vida_social',
    'saude.testes',
    'saude.consultas',
    'saude.anotacao_livre'
])

const conjuntoDePermissoes = new Set(permissoesDaCategoria)

//Informa se um identificador recebido pertence ao catálogo seguro do backend.
function permissaoCategoriaEhValida(permissao) {
    return typeof permissao === 'string' && conjuntoDePermissoes.has(permissao)
}

//Remove repetições e coloca as permissões na ordem oficial do catálogo.
function ordenarPermissoesCategoria(permissoes) {
    const permissoesSelecionadas = new Set(permissoes)

    return permissoesDaCategoria.filter(permissao => permissoesSelecionadas.has(permissao))
}

export { ordenarPermissoesCategoria, permissaoCategoriaEhValida, permissoesDaCategoria }