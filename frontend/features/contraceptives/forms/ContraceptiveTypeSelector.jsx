import { Pill } from 'phosphor-react-native';
import { SelectionSheet } from '../../../components/feedback/SelectionSheet/SelectionSheet';
import { TIPOS_ANTICONCEPCIONAL, obterTipo } from '../constants/contraceptiveOptions';
import { SelectorField } from './SelectorField';

function ContraceptiveTypeSelector({ valor, aberto, onAbrir, onSelecionar, onFechar }) {
    return (
        <>
            <SelectorField label="Tipo" valor={obterTipo(valor)?.label} placeholder="Selecione o tipo" onPress={onAbrir} icone={Pill} />
            <SelectionSheet visivel={aberto} titulo="Tipo de Anticoncepcional" opcoes={TIPOS_ANTICONCEPCIONAL} valorSelecionado={valor} onSelecionar={onSelecionar} onFechar={onFechar} />
        </>
    );
}

export { ContraceptiveTypeSelector };
