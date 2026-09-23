const espacamentos = Object.freeze({
    minimo: 4,
    pequeno: 8,
    medio: 16,
    grande: 24,
    extraGrande: 32,
    maximo: 48
})

const espacamentosLayout = Object.freeze({
    margemHorizontalTela: espacamentos.grande,
    espacamentoEntreColunas: espacamentos.medio
})

export {
    espacamentos,
    espacamentosLayout
}
/**
 * Define a escala de espaçamentos reutilizada na interface.
 */
