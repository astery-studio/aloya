//Centraliza as permissões gerais exibidas no formulário de categorias.
const permissoesGerais = Object.freeze([
    Object.freeze({
        id: 'geral.fase_atual',
        titulo: 'Acesso à Fase Atual'
    }),
    Object.freeze({
        id: 'geral.anticoncepcionais',
        titulo: 'Acesso aos Anticoncepcionais'
    }),
    Object.freeze({
        id: 'geral.historico_ciclo',
        titulo: 'Acesso ao Histórico de Ciclo'
    }),
    Object.freeze({
        id: 'geral.alerta_anticoncepcional',
        titulo: 'Receber alerta de Anticoncepcional'
    }),
    Object.freeze({
        id: 'geral.dicas',
        titulo: 'Receber dicas'
    })
])

export {permissoesGerais}