//Mostra as identidades de gênero aceitas pelo backend dentro do painel de seleção.
import { SelectionSheet } from '../../../components/feedback/SelectionSheet/SelectionSheet'

const opcoesIdentidadeGenero = Object.freeze([
    Object.freeze({ id: 'Prefiro não informar', label: 'Prefiro não informar' }),
    Object.freeze({ id: 'Mulher Cisgênero', label: 'Mulher Cisgênero' }),
    Object.freeze({ id: 'Homem Cisgênero', label: 'Homem Cisgênero' }),
    Object.freeze({ id: 'Mulher Trans', label: 'Mulher Trans' }),
    Object.freeze({ id: 'Homem Trans', label: 'Homem Trans' }),
    Object.freeze({ id: 'Não-binário', label: 'Não-binário' }),
    Object.freeze({ id: 'Outro', label: 'Outro' })
])

function GenderSelector({visivel, valorSelecionado, onSelecionar, onFechar}) {
    return (
        <SelectionSheet
            visivel={visivel}
            titulo="Identidade de Gênero"
            opcoes={opcoesIdentidadeGenero}
            valorSelecionado={valorSelecionado}
            onSelecionar={onSelecionar}
            onFechar={onFechar}
        />
    )
}

export { GenderSelector }