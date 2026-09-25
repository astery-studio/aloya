import { ArrowsClockwise } from 'phosphor-react-native';
import { SelectionSheet } from '../../../components/feedback/SelectionSheet/SelectionSheet';
import { obterFrequencia, obterFrequencias } from '../constants/contraceptiveOptions';
import { SelectorField } from './SelectorField';

function FrequencySelector({ tipo, valor, aberto, onAbrir, onSelecionar, onFechar }) {
    const opcoes = obterFrequencias(tipo);
    return (
        <>
            <SelectorField label="Frequência de Uso" valor={obterFrequencia(tipo, valor)?.label} placeholder="Selecione a frequência" onPress={onAbrir} icone={ArrowsClockwise} corIcone="#7B5EA7" fundoIcone="#EDE6F8" />
            <SelectionSheet visivel={aberto} titulo="Frequência de Uso" opcoes={opcoes} valorSelecionado={valor} onSelecionar={onSelecionar} onFechar={onFechar} variante="anticoncepcional" />
        </>
    );
}

export { FrequencySelector };
