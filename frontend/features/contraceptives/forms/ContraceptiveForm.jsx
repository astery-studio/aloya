import { View } from 'react-native';
import { FilePlus } from 'phosphor-react-native';
import ButtonScreen from '../../../components/common/Button/ButtonScreen';
import FormField from '../../../components/forms/FormField';
import TextInput from '../../../components/forms/TextInput';
import AlertModal from '../../../components/feedback/Modal/AlertModal/AlertModal';
import { useContraceptiveForm } from '../hooks/useContraceptiveForm';
import { AlertIntensitySelector } from './AlertIntensitySelector';
import { ContraceptiveTypeSelector } from './ContraceptiveTypeSelector';
import { ExpirationDateField } from './ExpirationDateField';
import { FrequencySelector } from './FrequencySelector';
import { UsageTimeSelector } from './UsageTimeSelector';
import { estilos } from './contraceptiveForms.styles';

function ContraceptiveForm({ onSubmit, salvando = false }) {
    const form = useContraceptiveForm(onSubmit);
    const { dados, painel, alerta, hoje, alterar, enviar } = form;

    return (
        <View style={estilos.formulario}>
            <FormField label="Nome da Medicação" campo={<TextInput placeholder="Digite o nome" value={dados.nome} onChangeText={(valor) => alterar('nome', valor)} variante="anticoncepcional" iconeEsquerda={FilePlus} />} />
            <ContraceptiveTypeSelector valor={dados.tipo} aberto={painel === 'tipo'} onAbrir={() => form.abrir('tipo')} onSelecionar={form.selecionarTipo} onFechar={form.fecharPainel} />

            {dados.tipo === 'diu_hormonal' ? (
                <ExpirationDateField valor={dados.dataValidade} aberto={painel === 'validade'} onAbrir={() => form.abrir('validade')} onSelecionar={async (valor) => { alterar('dataValidade', valor); return true; }} onFechar={form.fecharPainel} dataMinima={hoje} />
            ) : dados.tipo ? (
                <>
                    <UsageTimeSelector horarios={dados.horarios} permiteMultiplos={form.permiteMultiplos} aberto={painel === 'horarios'} onAbrir={() => form.abrir('horarios')} onConfirmar={(valor) => { alterar('horarios', valor); form.fecharPainel(); }} onFechar={form.fecharPainel} />
                    <FrequencySelector tipo={dados.tipo} valor={dados.frequenciaId} aberto={painel === 'frequencia'} onAbrir={() => form.abrir('frequencia')} onSelecionar={form.selecionarFrequencia} onFechar={form.fecharPainel} />
                    {form.exigePrimeiroUso ? (
                        <ExpirationDateField
                            label="Data do primeiro uso"
                            titulo="Data do primeiro uso"
                            valor={dados.dataPrimeiroUso}
                            aberto={painel === 'primeiroUso'}
                            onAbrir={() => form.abrir('primeiroUso')}
                            onSelecionar={async (valor) => { alterar('dataPrimeiroUso', valor); return true; }}
                            onFechar={form.fecharPainel}
                        />
                    ) : null}
                </>
            ) : null}

            <AlertIntensitySelector valor={dados.intensidadeAlerta} aberto={painel === 'intensidade'} onAbrir={() => form.abrir('intensidade')} onSelecionar={(valor) => { alterar('intensidadeAlerta', valor); form.fecharPainel(); }} onFechar={form.fecharPainel} />
            <ButtonScreen texto="Salvar anticoncepcional" aoPressionar={enviar} carregando={salvando} estilo={{ marginTop: -8 }} />
            <AlertModal
                visivel={Boolean(alerta)}
                aoFechar={form.fecharAlerta}
                titulo={alerta?.titulo}
                mensagem={alerta?.mensagem}
                acaoPrincipal={alerta?.tipo === 'rede' ? { texto: 'Tentar novamente', variante: 'verde', aoPressionar: enviar } : { texto: 'OK', variante: 'verde', aoPressionar: form.fecharAlerta }}
                acaoSecundaria={alerta?.tipo === 'rede' ? { texto: 'Voltar', aoPressionar: form.fecharAlerta } : undefined}
            />
        </View>
    );
}

export { ContraceptiveForm };
