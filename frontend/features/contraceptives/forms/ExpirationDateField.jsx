import { CalendarBlank } from 'phosphor-react-native';
import { DatePickerSheet } from '../../../components/feedback/DatePickerSheet/DatePickerSheet';
import { SelectorField } from './SelectorField';

function paraExibicao(iso) {
    if (!iso) return '';
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function ExpirationDateField({ valor, aberto, onAbrir, onSelecionar, onFechar, dataMinima, label = 'Data de Validade', titulo = 'Data de Validade' }) {
    return (
        <>
            <SelectorField
                label={label}
                valor={paraExibicao(valor)}
                placeholder="DD/MM/AAAA"
                onPress={onAbrir}
                icone={CalendarBlank}
                fundoIcone="transparent"
            />
            <DatePickerSheet visivel={aberto} titulo={titulo} valorSelecionado={valor} dataMinima={dataMinima} onSelecionar={onSelecionar} onFechar={onFechar} />
        </>
    );
}

export { ExpirationDateField };
