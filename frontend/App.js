//Mostra uma galeria provisória com todos os componentes disponíveis no frontend.
//É usado somente para testes visuais no Expo e deve ser substituído pela navegação real depois da conferência.

import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';

import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { WarningCircleIcon } from 'phosphor-react-native/src/icons/WarningCircle';

import Button from './components/common/Button/Button';
import ButtonDashed from './components/common/Button/ButtonDashed';
import ButtonPopup from './components/common/Button/ButtonPopup';
import ButtonScreen from './components/common/Button/ButtonScreen';
import { ButtonSelection } from './components/common/Button/ButtonSelection/ButtonSelection';
import { NavigationField } from './components/common/NavigationField/NavigationField';

import FormField from './components/forms/FormField';
import DateInput from './components/forms/DateInput';
import EmailInput from './components/forms/EmailInput';
import PasswordInput from './components/forms/PasswordInput';
import RadioOption from './components/forms/RadioOption';
import TextInput from './components/forms/TextInput';
import TimeInput from './components/forms/TimeInput';

import { BottomSheet } from './components/feedback/Bottomsheet/BottomSheet';
import { DatePickerSheet } from './components/feedback/DatePickerSheet/DatePickerSheet';
import { EditFieldSheet } from './components/feedback/EditFieldSheet/EditFieldSheet';
import { SelectionSheet } from './components/feedback/SelectionSheet/SelectionSheet';
import AlertModal from './components/feedback/Modal/AlertModal/AlertModal';
import AppModal from './components/feedback/Modal/AppModal';
import SimpleModal from './components/feedback/Modal/SimpleModal';

import { Header } from './components/navigation/Header/Header';
import { BottomTabBar } from './components/navigation/BottomTab/BottomTabBar/BottomTabBar';
import { BottomTabItem } from './components/navigation/BottomTab/BottomTabItem/BottomTabItem';

import { BottomSheetLayout } from './layouts/BottomSheet/BottomSheetLayout';
import { MainLayout } from './layouts/MainLayout/MainLayout';

import { obterDadoLocal, removerDadoLocal, salvarDadoLocal } from './services/storage/localStorage';
import { estilos } from './App.style';

//Lista pequena de opções usada para conferir o SelectionSheet.
const opcoesGenero = [
    { id: 'MULHER_CIS', label: 'Mulher cisgênero', descricao: 'Identidade feminina correspondente ao sexo atribuído no nascimento.' },
    { id: 'MULHER_TRANS', label: 'Mulher transgênero', descricao: 'Identidade feminina diferente do sexo atribuído no nascimento.' },
    { id: 'NAO_BINARIO', label: 'Pessoa não binária', descricao: 'Identidade que não se limita ao gênero feminino ou masculino.' },
    { id: 'NAO_INFORMAR', label: 'Prefiro não informar' }
];

//Mostra todos os componentes e controla apenas os dados necessários para os testes visuais.
//Não recebe propriedades e retorna a galeria provisória completa.
export default function App() {
    const [fontesCarregadas, erroFontes] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold });

    const [mensagem, setMensagem] = useState('Toque nos componentes para testar as interações.');
    const [texto, setTexto] = useState('');
    const [textoCategoria, setTextoCategoria] = useState('');
    const [textoPopup, setTextoPopup] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [dataDigitada, setDataDigitada] = useState('');
    const [horario, setHorario] = useState('');
    const [radioSelecionado, setRadioSelecionado] = useState('opcao-a');
    const [botaoSelecionado, setBotaoSelecionado] = useState('moderado');
    const [abaAtiva, setAbaAtiva] = useState('configuracoes');

    const [modalAtivo, setModalAtivo] = useState(null);
    const [painelAtivo, setPainelAtivo] = useState(null);
    const [generoSelecionado, setGeneroSelecionado] = useState('MULHER_CIS');
    const [dataSelecionada, setDataSelecionada] = useState('2000-03-15');

    const [nomeEditado, setNomeEditado] = useState('Kaylanne Sátiro');
    const [emailEditado, setEmailEditado] = useState('kaylanne@example.com');
    const [nascimentoEditado, setNascimentoEditado] = useState('2000-03-15');
    const [campoEditado, setCampoEditado] = useState(null);

    const [resultadoStorage, setResultadoStorage] = useState('Nenhuma operação executada.');

    //Recebe uma descrição curta e mostra na galeria qual interação acabou de acontecer.
    function registrarAcao(descricao) {
        setMensagem(descricao);
    }

    //Recebe o identificador escolhido, atualiza a seleção e fecha o painel.
    function selecionarGenero(id) {
        setGeneroSelecionado(id);
        setPainelAtivo(null);
        registrarAcao(`Gênero selecionado: ${id}`);
    }

    //Recebe uma data da agenda, atualiza o valor e fecha o painel automaticamente.
    async function selecionarData(data) {
        setDataSelecionada(data);
        registrarAcao(`Data selecionada: ${data}`);
        return true;
    }

    //Salva uma preferência não sensível para testar o AsyncStorage.
    async function salvarPreferencia() {
        try {
            await salvarDadoLocal('galeria-preferencia', { modoCompacto: true, ultimaSecao: 'componentes' });
            setResultadoStorage('Preferência salva com sucesso.');
        } catch (erro) {
            setResultadoStorage(erro.message);
        }
    }

    //Lê a preferência não sensível usada pela galeria.
    async function lerPreferencia() {
        try {
            const valor = await obterDadoLocal('galeria-preferencia');
            setResultadoStorage(valor ? JSON.stringify(valor) : 'Nenhuma preferência encontrada.');
        } catch (erro) {
            setResultadoStorage(erro.message);
        }
    }

    //Remove somente a preferência criada pela galeria.
    async function removerPreferencia() {
        try {
            await removerDadoLocal('galeria-preferencia');
            setResultadoStorage('Preferência removida.');
        } catch (erro) {
            setResultadoStorage(erro.message);
        }
    }

    //Retorna as propriedades correspondentes ao campo aberto para edição.
    function obterEdicaoAtual() {
        if (campoEditado === 'email') {
            return { titulo: 'Editar e-mail', tipo: 'email', valor: emailEditado, onAlterar: setEmailEditado };
        }

        if (campoEditado === 'data') {
            return { titulo: 'Editar data de nascimento', tipo: 'data', valor: nascimentoEditado, onAlterar: setNascimentoEditado };
        }

        return { titulo: 'Editar nome', tipo: 'nome', valor: nomeEditado, onAlterar: setNomeEditado };
    }

    if (erroFontes) {
        return (
            <View style={estilos.carregamento}>
                <Text style={estilos.textoCarregamento}>Não foi possível carregar as fontes da galeria.</Text>
            </View>
        );
    }

    if (!fontesCarregadas) {
        return (
            <View style={estilos.carregamento}>
                <Text style={estilos.textoCarregamento}>Carregando componentes...</Text>
            </View>
        );
    }

    const edicaoAtual = obterEdicaoAtual();

    return (
        <View style={estilos.tela}>
            <StatusBar style="dark" />

            <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
                <View style={estilos.introducao}>
                    <Text style={estilos.tituloPrincipal}>Galeria de componentes</Text>
                    <Text style={estilos.descricaoPrincipal}>Confira aparência, estados, acessibilidade e interações. Este App é apenas provisório.</Text>
                </View>

                <Text accessibilityLiveRegion="polite" style={estilos.mensagemInteracao}>{mensagem}</Text>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Button base</Text>
                    <Text style={estilos.descricaoSecao}>Variantes, tamanhos, ícones e estados do componente criado pela Carla.</Text>

                    <Button texto="Laranja grande" aoPressionar={() => registrarAcao('Button laranja pressionado.')} />
                    <Button texto="Verde grande" variante="verde" aoPressionar={() => registrarAcao('Button verde pressionado.')} />
                    <Button texto="Branco" variante="branco" aoPressionar={() => registrarAcao('Button branco pressionado.')} />
                    <Button texto="Preto" variante="preto" aoPressionar={() => registrarAcao('Button preto pressionado.')} />
                    <Button texto="Vermelho" variante="vermelho" aoPressionar={() => registrarAcao('Button vermelho pressionado.')} />
                    <Button texto="Borda laranja" variante="bordaLaranja" aoPressionar={() => registrarAcao('Button com borda laranja pressionado.')} />
                    <Button texto="Borda verde" variante="bordaVerde" aoPressionar={() => registrarAcao('Button com borda verde pressionado.')} />
                    <Button texto="Tracejado" variante="tracejado" aoPressionar={() => registrarAcao('Button tracejado pressionado.')} />
                    <Button texto="Compacto com ícone" tamanho="compacto" largura={220} icone={GearIcon} aoPressionar={() => registrarAcao('Button compacto pressionado.')} />
                    <Button texto="Ícone à direita" icone={GearIcon} posicaoIcone="direita" aoPressionar={() => registrarAcao('Button com ícone à direita pressionado.')} />
                    <Button texto="Desativado" desativado aoPressionar={() => registrarAcao('Esta ação não deveria acontecer.')} />
                    <Button texto="Carregando" carregando aoPressionar={() => registrarAcao('Esta ação não deveria acontecer.')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>ButtonScreen</Text>
                    <Text style={estilos.descricaoSecao}>Ação principal das telas e formulários.</Text>

                    <ButtonScreen texto="Avançar" aoPressionar={() => registrarAcao('ButtonScreen ativo pressionado.')} />
                    <ButtonScreen texto="Salvar desativado" desativado aoPressionar={() => registrarAcao('Esta ação não deveria acontecer.')} />
                    <ButtonScreen texto="Confirmando" carregando aoPressionar={() => registrarAcao('Esta ação não deveria acontecer.')} />
                    <ButtonScreen texto="Cadastrar anticoncepcional" variante="verde" icone={GearIcon} aoPressionar={() => registrarAcao('Cadastro iniciado.')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Botões especializados</Text>

                    <Text style={estilos.subtitulo}>ButtonPopup</Text>
                    <ButtonPopup texto="Verde" variante="verde" aoPressionar={() => registrarAcao('ButtonPopup verde pressionado.')} />
                    <ButtonPopup texto="Branco" variante="branco" aoPressionar={() => registrarAcao('ButtonPopup branco pressionado.')} />
                    <ButtonPopup texto="Preto" variante="preto" aoPressionar={() => registrarAcao('ButtonPopup preto pressionado.')} />
                    <ButtonPopup texto="Vermelho" variante="vermelho" aoPressionar={() => registrarAcao('ButtonPopup vermelho pressionado.')} />

                    <Text style={estilos.subtitulo}>ButtonDashed</Text>
                    <ButtonDashed texto="Adicionar item" aoPressionar={() => registrarAcao('ButtonDashed pressionado.')} />

                    <Text style={estilos.subtitulo}>ButtonSelection</Text>
                    <ButtonSelection label="Leve" descricao="Sintomas pequenos" icone={GearIcon} selected={botaoSelecionado === 'leve'} onPress={() => setBotaoSelecionado('leve')} />
                    <ButtonSelection label="Moderado" descricao="Sintomas que exigem atenção" icone={GearIcon} selected={botaoSelecionado === 'moderado'} onPress={() => setBotaoSelecionado('moderado')} />
                    <ButtonSelection label="Crítico" descricao="Estado desativado para conferência" icone={GearIcon} desabilitado onPress={() => setBotaoSelecionado('critico')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Campos de formulário</Text>

                    <Text style={estilos.subtitulo}>TextInput padrão</Text>
                    <TextInput label="Nome" placeholder="Digite seu nome" value={texto} onChangeText={setTexto} />

                    <Text style={estilos.subtitulo}>TextInput categoria</Text>
                    <TextInput label="Nome da categoria" placeholder="Exemplo: Família" variante="categoria" value={textoCategoria} onChangeText={setTextoCategoria} />

                    <Text style={estilos.subtitulo}>TextInput popup</Text>
                    <TextInput label="Valor do popup" placeholder="Digite um valor" variante="popup" value={textoPopup} onChangeText={setTextoPopup} />

                    <Text style={estilos.subtitulo}>TextInput desativado</Text>
                    <TextInput label="Campo desativado" value="Não pode ser editado" desativado />

                    <Text style={estilos.subtitulo}>EmailInput</Text>
                    <EmailInput value={email} onChangeText={setEmail} />

                    <Text style={estilos.subtitulo}>PasswordInput</Text>
                    <PasswordInput value={senha} onChangeText={setSenha} />

                    <Text style={estilos.subtitulo}>DateInput</Text>
                    <DateInput valor={dataDigitada} onChangeText={setDataDigitada} aoPressionarCalendario={() => setPainelAtivo('data')} />
                    <DateInput valor="15/03/2000" desativado />

                    <Text style={estilos.subtitulo}>TimeInput</Text>
                    <TimeInput valor={horario} onChangeText={setHorario} podeRemover aoRemover={() => setHorario('')} />
                    <TimeInput valor="08:30" desativado podeRemover />

                    <Text style={estilos.subtitulo}>RadioOption</Text>
                    <RadioOption titulo="Opção A" descricao="Opção atualmente selecionada" selecionado={radioSelecionado === 'opcao-a'} aoPressionar={() => setRadioSelecionado('opcao-a')} />
                    <RadioOption titulo="Opção B" descricao="Toque para selecionar" selecionado={radioSelecionado === 'opcao-b'} aoPressionar={() => setRadioSelecionado('opcao-b')} />
                    <RadioOption titulo="Opção desativada" desativado aoPressionar={() => setRadioSelecionado('desativada')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>FormField</Text>

                    <FormField label="Estrutura de campo" mensagemAuxiliar="Este texto é uma ajuda para preencher o campo.">
                        <View style={estilos.exemploFormField}>
                            <Text style={estilos.textoExemplo}>Conteúdo inserido por children.</Text>
                        </View>
                    </FormField>

                    <FormField
                        label="Título de seção"
                        tituloSecao
                        mensagemAuxiliar="Também aceita o conteúdo pela propriedade campo."
                        campo={
                            <View style={estilos.exemploFormField}>
                                <Text style={estilos.textoExemplo}>Conteúdo recebido pela propriedade campo.</Text>
                            </View>
                        }
                    />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>NavigationField</Text>

                    <NavigationField label="Configurações de perfil" icone={GearIcon} paleta="corVerde" onPress={() => registrarAcao('NavigationField com borda pressionado.')} />
                    <NavigationField label="Segurança da conta" icone={GearIcon} paleta="corAzul" onPress={() => registrarAcao('Paleta azul pressionada.')} />
                    <NavigationField label="Excluir conta" icone={GearIcon} paleta="corLaranja" onPress={() => registrarAcao('Paleta laranja pressionada.')} />
                    <NavigationField label="Anticoncepcional em atenção" icone={GearIcon} paleta="corVermelho" variante="semBorda" onPress={() => registrarAcao('Variante sem borda pressionada.')} />
                    <NavigationField label="Adicionar anticoncepcional" icone={GearIcon} paleta="corVerde2" variante="botao" onPress={() => registrarAcao('Variante botão pressionada.')} />
                    <NavigationField label="Campo desabilitado" icone={GearIcon} desabilitado onPress={() => registrarAcao('Esta ação não deveria acontecer.')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Header</Text>

                    <Text style={estilos.subtitulo}>Padrão</Text>
                    <View style={estilos.previewHeader}>
                        <Header titulo="Configurações" />
                    </View>

                    <Text style={estilos.subtitulo}>Com voltar e título maior</Text>
                    <View style={estilos.previewHeader}>
                        <Header titulo="Configurações de perfil com quebra de linha" variante="comVoltar" onVoltar={() => registrarAcao('Voltar pressionado.')} />
                    </View>
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Navegação inferior</Text>

                    <Text style={estilos.subtitulo}>BottomTabItem ativo</Text>
                    <View style={estilos.previewBottomItem}>
                        <BottomTabItem icone={GearIcon} label="Config." ativo onPress={() => registrarAcao('BottomTabItem pressionado.')} />
                    </View>

                    <Text style={estilos.subtitulo}>BottomTabItem inativo</Text>
                    <View style={estilos.previewBottomItem}>
                        <BottomTabItem icone={GearIcon} label="Config." onPress={() => registrarAcao('BottomTabItem inativo pressionado.')} />
                    </View>

                    <Text style={estilos.subtitulo}>BottomTabBar</Text>
                    <View style={estilos.previewBottomBar}>
                        <BottomTabBar abaAtiva={abaAtiva} onSelecionar={setAbaAtiva} />
                    </View>
                    <Text style={estilos.descricaoSecao}>Aba selecionada: {abaAtiva}</Text>
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>MainLayout</Text>
                    <Text style={estilos.descricaoSecao}>O Header e a BottomTabBar reais são renderizados dentro deste preview.</Text>

                    <View style={estilos.previewLayout}>
                        <MainLayout titulo="Preview do layout" varianteHeader="comVoltar" onVoltar={() => registrarAcao('Voltar do MainLayout pressionado.')} abaAtiva={abaAtiva} onSelecionarAba={setAbaAtiva}>
                            <View style={estilos.conteudoMainLayout}>
                                <Text style={estilos.textoExemplo}>Conteúdo da screen dentro do MainLayout.</Text>
                            </View>
                        </MainLayout>
                    </View>
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Modais</Text>
                    <Text style={estilos.descricaoSecao}>Abra um modal por vez e teste as ações, o botão voltar do Android e os estados de carregamento.</Text>

                    <ButtonScreen texto="Abrir SimpleModal" aoPressionar={() => setModalAtivo('simples')} />
                    <ButtonScreen texto="Abrir AlertModal" variante="vermelho" aoPressionar={() => setModalAtivo('alerta')} />
                    <ButtonScreen texto="Abrir AppModal de ação" variante="verde" aoPressionar={() => setModalAtivo('acao')} />
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Bottom Sheets</Text>

                    <ButtonScreen texto="Abrir BottomSheet base" aoPressionar={() => setPainelAtivo('base')} />
                    <ButtonScreen texto="Abrir SelectionSheet" variante="verde" aoPressionar={() => setPainelAtivo('selecao')} />
                    <ButtonScreen texto="Abrir DatePickerSheet" variante="verde" aoPressionar={() => setPainelAtivo('data')} />
                    <ButtonScreen texto="Editar nome" variante="bordaVerde" aoPressionar={() => setCampoEditado('nome')} />
                    <ButtonScreen texto="Editar e-mail" variante="bordaVerde" aoPressionar={() => setCampoEditado('email')} />
                    <ButtonScreen texto="Editar nascimento" variante="bordaVerde" aoPressionar={() => setCampoEditado('data')} />

                    <Text style={estilos.descricaoSecao}>Gênero atual: {generoSelecionado}</Text>
                    <Text style={estilos.descricaoSecao}>Data atual: {dataSelecionada}</Text>
                </View>

                <View style={estilos.secao}>
                    <Text style={estilos.tituloSecao}>Armazenamento local</Text>
                    <Text style={estilos.descricaoSecao}>Teste somente informações não sensíveis. Nenhum token ou senha é usado aqui.</Text>

                    <ButtonScreen texto="Salvar preferência" aoPressionar={salvarPreferencia} />
                    <ButtonScreen texto="Ler preferência" variante="verde" aoPressionar={lerPreferencia} />
                    <ButtonScreen texto="Remover preferência" variante="vermelho" aoPressionar={removerPreferencia} />

                    <Text style={estilos.resultadoStorage}>{resultadoStorage}</Text>
                </View>
            </ScrollView>

            <SimpleModal
                visivel={modalAtivo === 'simples'}
                aoFechar={() => setModalAtivo(null)}
                icone={GearIcon}
                titulo="Operação concluída"
                mensagem="Este é o SimpleModal com duas ações."
                acaoPrincipal={{ texto: 'Entendi', aoPressionar: () => setModalAtivo(null) }}
                acaoSecundaria={{ texto: 'Ação secundária', aoPressionar: () => registrarAcao('Ação secundária do SimpleModal pressionada.') }}
            />

            <AlertModal
                visivel={modalAtivo === 'alerta'}
                aoFechar={() => setModalAtivo(null)}
                titulo="Não foi possível continuar"
                mensagem="Este é um exemplo de erro ou situação excepcional."
                destaque="Nenhum dado foi alterado."
                acaoPrincipal={{ texto: 'Tentar novamente', aoPressionar: () => setModalAtivo(null) }}
                acaoSecundaria={{ texto: 'Cancelar', aoPressionar: () => setModalAtivo(null) }}
            />

            <AppModal
                variante="acao"
                visivel={modalAtivo === 'acao'}
                aoFechar={() => setModalAtivo(null)}
                icone={WarningCircleIcon}
                titulo="Confirme a ação"
                mensagem="Este é o AppModal base na variante de ação."
            >
                <ButtonPopup texto="Confirmar" variante="vermelho" aoPressionar={() => setModalAtivo(null)} estilo={{ width: '100%' }} />
                <ButtonPopup texto="Cancelar" variante="branco" aoPressionar={() => setModalAtivo(null)} estilo={{ width: '100%' }} />
            </AppModal>

            <BottomSheet visivel={painelAtivo === 'base'} onFechar={() => setPainelAtivo(null)}>
                <BottomSheetLayout titulo="BottomSheet base" onFechar={() => setPainelAtivo(null)}>
                    <View style={estilos.conteudoBottomSheet}>
                        <Text style={estilos.textoExemplo}>Este conteúdo testa BottomSheet e BottomSheetLayout juntos.</Text>
                        <ButtonScreen texto="Fechar painel" aoPressionar={() => setPainelAtivo(null)} />
                    </View>
                </BottomSheetLayout>
            </BottomSheet>

            <SelectionSheet
                visivel={painelAtivo === 'selecao'}
                titulo="Identidade de gênero"
                opcoes={opcoesGenero}
                valorSelecionado={generoSelecionado}
                onSelecionar={selecionarGenero}
                onFechar={() => setPainelAtivo(null)}
            />

            <DatePickerSheet
                visivel={painelAtivo === 'data'}
                titulo="Data de nascimento"
                valorSelecionado={dataSelecionada}
                dataMinima="1900-01-01"
                dataMaxima={new Date().toISOString().slice(0, 10)}
                onSelecionar={selecionarData}
                onFechar={() => setPainelAtivo(null)}
            />

            <EditFieldSheet
                visivel={campoEditado !== null}
                titulo={edicaoAtual.titulo}
                tipo={edicaoAtual.tipo}
                valor={edicaoAtual.valor}
                onAlterar={edicaoAtual.onAlterar}
                onFechar={() => setCampoEditado(null)}
                botaoSalvar={<ButtonScreen texto="Salvar" aoPressionar={() => setCampoEditado(null)} />}
            />
        </View>
    );
}