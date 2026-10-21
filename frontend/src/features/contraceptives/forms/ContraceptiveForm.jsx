//Mostra o formulário compartilhado pelo cadastro e pela edição de anticoncepcionais.
import { useState } from 'react';
import { View } from 'react-native';
import { FilePlus, WarningCircle } from 'phosphor-react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import FormField from '../../../shared/components/forms/FormField';
import TextInput from '../../../shared/components/forms/TextInput';
import { EditFieldSheet } from '../../../shared/components/feedback/EditFieldSheet/EditFieldSheet';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import { useContraceptiveForm } from '../hooks/useContraceptiveForm';
import { AlertIntensitySelector } from './AlertIntensitySelector';
import { ContraceptiveTypeSelector } from './ContraceptiveTypeSelector';
import { ExpirationDateField } from './ExpirationDateField';
import { FrequencySelector } from './FrequencySelector';
import { SelectorField } from './SelectorField';
import { UsageTimeSelector } from './UsageTimeSelector';
import { estilos } from './contraceptiveForms.styles';

//Recebe os dados e ações do formulário e mostra o modo de cadastro ou edição.
function ContraceptiveForm({
    onSubmit,
    anticoncepcional = null,
    salvando = false
}) {
    const form = useContraceptiveForm(onSubmit, anticoncepcional);
    const {
        dados,
        painel,
        alerta,
        hoje,
        alterar,
        enviar
    } = form;

    const [nomeTemporario, setNomeTemporario] = useState(dados.nome);
    const nomeTemporarioNormalizado = nomeTemporario.trim();
    const nomeAtualNormalizado = dados.nome.trim();
    const podeSalvarNome = Boolean(nomeTemporarioNormalizado) && nomeTemporarioNormalizado !== nomeAtualNormalizado && !salvando;

    //Abre um painel somente quando nenhuma operação de salvamento está acontecendo.
    function abrirPainel(nomePainel) {
        if (!salvando) form.abrir(nomePainel);
    }

    //Abre o painel de nome com uma cópia do valor atual.
    function abrirEdicaoNome() {
        if (salvando) return;

        setNomeTemporario(dados.nome);
        form.abrir('nome');
    }

    //Aplica o nome temporário ao formulário e fecha o painel.
    function salvarNome() {
        if (!podeSalvarNome) return;

        alterar('nome', nomeTemporarioNormalizado);
        form.fecharPainel();
    }

    const textoBotao = form.modoEdicao
        ? 'Atualizar anticoncepcional'
        : 'Salvar anticoncepcional';

    return (
        <View style={estilos.formulario}>
            {form.modoEdicao ? (
                <>
                    <SelectorField
                        label="Nome da Medicação"
                        valor={dados.nome}
                        placeholder="Digite o nome"
                        onPress={abrirEdicaoNome}
                        navegar
                        icone={FilePlus}
                        corIcone="#C85A44"
                        fundoIcone="transparent"
                    />

                    <EditFieldSheet
                        visivel={painel === 'nome'}
                        titulo="Editar nome do anticoncepcional"
                        tipo="nome"
                        valor={nomeTemporario}
                        onAlterar={setNomeTemporario}
                        onFechar={form.fecharPainel}
                        salvando={salvando}
                        botaoSalvar={(
                            <ButtonScreen
                                texto="Salvar"
                                variante="verde"
                                aoPressionar={salvarNome}
                                desativado={!podeSalvarNome}
                                carregando={salvando}
                            />
                        )}
                    />
                </>
            ) : (
                <FormField
                    label="Nome da Medicação"
                    campo={(
                        <TextInput
                            placeholder="Digite o nome"
                            value={dados.nome}
                            onChangeText={(valor) => alterar('nome', valor)}
                            variante="categoria"
                            maxLength={120}
                            desativado={salvando}
                        />
                    )}
                />
            )}

            <ContraceptiveTypeSelector
                valor={dados.tipo}
                aberto={painel === 'tipo'}
                onAbrir={() => abrirPainel('tipo')}
                onSelecionar={form.selecionarTipo}
                onFechar={form.fecharPainel}
            />

            {dados.tipo === 'diu_hormonal' ? (
                <ExpirationDateField
                    valor={dados.dataValidade}
                    aberto={painel === 'validade'}
                    onAbrir={() => abrirPainel('validade')}
                    onSelecionar={async (valor) => {
                        alterar('dataValidade', valor);
                        return true;
                    }}
                    onFechar={form.fecharPainel}
                    dataMinima={hoje}
                />
            ) : dados.tipo ? (
                <>
                    <UsageTimeSelector
                        horarios={dados.horarios}
                        permiteMultiplos={form.permiteMultiplos}
                        aberto={painel === 'horarios'}
                        onAbrir={() => abrirPainel('horarios')}
                        onConfirmar={(valor) => {
                            alterar('horarios', valor);
                            form.fecharPainel();
                        }}
                        onFechar={form.fecharPainel}
                    />

                    <FrequencySelector
                        tipo={dados.tipo}
                        valor={dados.frequenciaId}
                        aberto={painel === 'frequencia'}
                        onAbrir={() => abrirPainel('frequencia')}
                        onSelecionar={form.selecionarFrequencia}
                        onFechar={form.fecharPainel}
                    />

                    {form.exigePrimeiroUso ? (
                        <ExpirationDateField
                            label="Data do primeiro uso"
                            titulo="Data do primeiro uso"
                            valor={dados.dataPrimeiroUso}
                            aberto={painel === 'primeiroUso'}
                            onAbrir={() => abrirPainel('primeiroUso')}
                            onSelecionar={async (valor) => {
                                alterar('dataPrimeiroUso', valor);
                                return true;
                            }}
                            onFechar={form.fecharPainel}
                        />
                    ) : null}
                </>
            ) : null}

            <AlertIntensitySelector
                valor={dados.intensidadeAlerta}
                aberto={painel === 'intensidade'}
                onAbrir={() => abrirPainel('intensidade')}
                onSelecionar={(valor) => {
                    alterar('intensidadeAlerta', valor);
                    form.fecharPainel();
                }}
                onFechar={form.fecharPainel}
            />

            <ButtonScreen
                texto={textoBotao}
                aoPressionar={enviar}
                desativado={!form.podeEnviar}
                carregando={salvando}
                estilo={{
                    marginTop: -8
                }}
            />

            <SimpleModal
                visivel={Boolean(alerta)}
                aoFechar={salvando ? undefined : form.fecharAlerta}
                icone={WarningCircle}
                corIcone={alerta?.tipo === 'rede' ? '#5C5C59' : '#C85A44'}
                fundoIcone={alerta?.tipo === 'rede' ? '#EDEDED' : '#F5EDE3'}
                titulo={alerta?.titulo}
                mensagem={alerta?.mensagem}
                acaoPrincipal={alerta?.tipo === 'rede' ? {
                    texto: 'Tentar novamente',
                    variante: 'preto',
                    aoPressionar: enviar,
                    carregando: salvando,
                    desativado: salvando
                } : {
                    texto: 'OK',
                    variante: 'verde',
                    aoPressionar: form.fecharAlerta,
                    desativado: salvando
                }}
                acaoSecundaria={alerta?.tipo === 'rede' ? {
                    texto: 'Voltar',
                    aoPressionar: form.fecharAlerta,
                    desativado: salvando
                } : undefined}
            />
        </View>
    );
}

export { ContraceptiveForm };