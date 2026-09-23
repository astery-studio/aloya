<<<<<<< HEAD
/**
 * Mostra somente os testes do MainLayout no Expo.
 * É usado temporariamente como entrada do aplicativo.
 * Existe para conferir Header, conteúdo e BottomTabBar juntos.
 */

import { useState } from 'react'
import {
    Button,
    ScrollView,
    Text,
    View
} from 'react-native'

import { useFonts } from 'expo-font'

import {
    DMSans_400Regular
} from '@expo-google-fonts/dm-sans/400Regular'
=======
import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Envelope, Lock, Plus, Trash } from 'phosphor-react-native';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    useFonts
} from '@expo-google-fonts/dm-sans';
import {
    cores, espacamentos, espacamentosLayout, fontFamilies,
    radius, shadows, typography
} from './theme';
import Button from './components/common/Button/Button';
import ButtonPopup from './components/common/Button/ButtonPopup';
import ButtonDashed from './components/common/Button/ButtonDashed';
import TextInput from './components/forms/TextInput';
import EmailInput from './components/forms/EmailInput';
import PasswordInput from './components/forms/PasswordInput';
import DateInput from './components/forms/DateInput';
import TimeInput from './components/forms/TimeInput';
import RadioOption from './components/forms/RadioOption';
import AppModal from './components/feedback/Modal/AppModal';
import SimpleModal from './components/feedback/Modal/SimpleModal';

const variantesBotao = [
    'laranja', 'verde', 'branco', 'preto', 'vermelho',
    'bordaLaranja', 'bordaVerde', 'tracejado'
];

function Secao({ titulo, children }) {
    return (
        <View style={{ gap: espacamentos.medio }}>
            <Text style={{ ...typography.h2, color: cores.neutras.textoPrincipalClaro }}>
                {titulo}
            </Text>
            {children}
        </View>
    );
}
>>>>>>> 59ec37659ac8f1bd1b2499ea20c917bb90159d20

import {
    DMSans_500Medium
} from '@expo-google-fonts/dm-sans/500Medium'

import {
    DMSans_600SemiBold
} from '@expo-google-fonts/dm-sans/600SemiBold'

import {
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans/700Bold'

import { MainLayout } from './layouts/MainLayout/MainLayout'
import { fontFamilies, tema } from './theme'

const nomesDasAbas = {
    membros: 'Membros',
    ciclos: 'Ciclos',
    inicio: 'Início',
    diario: 'Diário',
    configuracoes: 'Configurações'
}

/**
 * Não recebe propriedades.
 * Mostra as variações do MainLayout e permite trocar a aba ativa.
 * Retorna a tela temporária de teste.
 */
export default function App() {
<<<<<<< HEAD
    const [fontesCarregadas, erroFontes] =
        useFonts({
            DMSans_400Regular,
            DMSans_500Medium,
            DMSans_600SemiBold,
            DMSans_700Bold
        })

    const [abaAtiva, setAbaAtiva] =
        useState('configuracoes')

    const [cabecalhoComVoltar, setCabecalhoComVoltar] =
        useState(false)

    function mostrarCabecalhoComVoltar() {
        setCabecalhoComVoltar(true)
    }

    function voltarParaCabecalhoPadrao() {
        setCabecalhoComVoltar(false)
    }

    if (erroFontes) {
        return (
            <View style={{ padding: 24 }}>
                <Text>
                    Não foi possível carregar as fontes.
                </Text>
            </View>
        )
    }

    if (!fontesCarregadas) {
        return (
            <View style={{ padding: 24 }}>
                <Text>
                    Carregando fontes...
                </Text>
            </View>
        )
    }

    return (
        <MainLayout
            titulo={
                cabecalhoComVoltar
                    ? 'Tela interna'
                    : 'Configurações'
            }
            varianteHeader={
                cabecalhoComVoltar
                    ? 'comVoltar'
                    : 'padrao'
            }
            onVoltar={
                cabecalhoComVoltar
                    ? voltarParaCabecalhoPadrao
                    : undefined
            }
            abaAtiva={abaAtiva}
            onSelecionarAba={setAbaAtiva}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingBottom: 32
                }}
            >
                <Text
                    style={{
                        color:
                            tema.cores.neutras
                                .textoSecundarioClaro,
                        fontFamily: fontFamilies.medium,
                        fontSize: 16,
                        lineHeight: 24
                    }}
                >
                    Área de conteúdo da screen
                </Text>

                <View
                    style={{
                        marginTop: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor:
                            tema.cores.neutras.bordaClara,
                        borderRadius:
                            tema.radius.buttonAndInput,
                        backgroundColor:
                            tema.cores.neutras
                                .superficieClara
                    }}
                >
                    <Text
                        style={{
                            color:
                                tema.cores.neutras
                                    .textoPrincipalClaro,
                            fontFamily:
                                fontFamilies.regular,
                            fontSize: 16,
                            lineHeight: 24
                        }}
                    >
                        Aba ativa: {
                            nomesDasAbas[abaAtiva]
                        }
                    </Text>
                </View>

                <View
                    style={{
                        marginTop: 16,
                        gap: 12
                    }}
                >
                    <Button
                        title="Testar Header com voltar"
                        onPress={
                            mostrarCabecalhoComVoltar
                        }
                    />

                    <Button
                        title="Voltar ao Header padrão"
                        onPress={
                            voltarParaCabecalhoPadrao
                        }
                    />
                </View>

                <View
                    style={{
                        height: 400,
                        justifyContent: 'flex-end'
                    }}
                >
                    <Text
                        style={{
                            color:
                                tema.cores.neutras
                                    .textoSecundarioClaro,
                            fontFamily:
                                fontFamilies.regular,
                            fontSize: 14,
                            lineHeight: 20,
                            textAlign: 'center'
                        }}
                    >
                        Role esta área e confirme que o Header
                        e a barra inferior permanecem no lugar.
                    </Text>
                </View>
            </ScrollView>
        </MainLayout>
    )
}
=======
    const [fontsLoaded] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });
    const [nome, setNome] = useState('');
    const [categoria, setCategoria] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [senhaPopup, setSenhaPopup] = useState('');
    const [data, setData] = useState('');
    const [horarios, setHorarios] = useState([{ id: 1, valor: '' }]);
    const proximoHorarioId = useRef(2);
    const [opcao, setOpcao] = useState('Diária');
    const [modal, setModal] = useState(null);
    const fecharModal = () => setModal(null);
    const avisar = (nome) => Alert.alert('Botão pressionado', nome);

    if (!fontsLoaded) return null;

    return (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
            gap: espacamentos.extraGrande,
            paddingHorizontal: espacamentosLayout.margemHorizontalTela,
            paddingTop: 60,
            paddingBottom: espacamentos.maximo,
            backgroundColor: cores.neutras.fundoClaro
        }}>
            <Text style={{ ...typography.h1, color: cores.neutras.textoPrincipalClaro }}>
                Aloya — componentes
            </Text>
            <Secao titulo="Cores e tipografia">
                {Object.entries(cores).flatMap(([grupo, paleta]) =>
                    Object.entries(paleta).map(([nomeCor, cor]) => (
                        <View key={`${grupo}.${nomeCor}`} style={{
                            flexDirection: 'row', alignItems: 'center',
                            gap: espacamentos.pequeno
                        }}>
                            <View style={{
                                width: 24, height: 24, backgroundColor: cor,
                                borderRadius: radius.buttonAndInput, borderWidth: 1,
                                borderColor: cores.neutras.bordaClara
                            }} />
                            <Text style={typography.caption}>
                                {grupo}.{nomeCor}: {cor}
                            </Text>
                        </View>
                    ))
                )}
                {Object.entries(typography).map(([nomeTipo, estilo]) => (
                    <Text key={nomeTipo} style={{
                        ...estilo, color: cores.neutras.textoPrincipalClaro
                    }}>
                        {nomeTipo} — DM Sans
                    </Text>
                ))}
                <Text style={typography.caption}>
                    Fontes: {Object.keys(fontFamilies).join(', ')}
                </Text>
            </Secao>
            <Secao titulo="Espaçamentos, cantos e sombras">
                <Text style={typography.caption}>
                    Espaçamentos: {Object.entries(espacamentos).map(
                        ([nome, valor]) => `${nome} ${valor}`
                    ).join(' · ')}
                </Text>
                <Text style={typography.caption}>
                    Layout: {Object.entries(espacamentosLayout).map(
                        ([nome, valor]) => `${nome} ${valor}`
                    ).join(' · ')}
                </Text>
                {Object.entries(radius).map(([nome, valor]) => (
                    <View key={nome} style={{
                        padding: espacamentos.pequeno,
                        backgroundColor: cores.neutras.bordaClara,
                        borderTopLeftRadius: valor,
                        borderTopRightRadius: valor,
                        borderBottomLeftRadius: nome === 'settingsCalendar' ||
                            nome === 'bottomSheet' ? 0 : valor,
                        borderBottomRightRadius: nome === 'settingsCalendar' ||
                            nome === 'bottomSheet' ? 0 : valor
                    }}>
                        <Text style={typography.caption}>{nome}: {valor}px</Text>
                    </View>
                ))}
                {Object.entries(shadows).map(([nome, sombra]) => (
                    <View key={nome} style={{ ...sombra,
                        padding: espacamentos.medio,
                        backgroundColor: cores.neutras.superficieClara,
                        borderRadius: radius.popup }}>
                        <Text style={typography.caption}>Sombra: {nome}</Text>
                    </View>
                ))}
            </Secao>
            <Secao titulo="Botão base">
                {variantesBotao.map((variante) => (
                    <Button key={variante} texto={variante} variante={variante}
                        aoPressionar={() => avisar(variante)} />
                ))}
                <Button texto="Com ícone" icone={Plus}
                    aoPressionar={() => avisar('Com ícone')} />
                <Button texto="Desativado" desativado />
                <Button texto="Carregando" carregando />
            </Secao>
            <Secao titulo="Botões de popup">
                {['verde', 'branco', 'preto', 'vermelho'].map((variante) => (
                    <ButtonPopup key={variante} texto={variante} variante={variante}
                        aoPressionar={() => avisar(`popup ${variante}`)} />
                ))}
            </Secao>
            <Secao titulo="Campos de texto">
                <TextInput label="Nome" placeholder="Digite seu nome"
                    value={nome} onChangeText={setNome} />
                <TextInput label="Nome da categoria" variante="categoria"
                    placeholder="Digite o nome da categoria"
                    value={categoria} onChangeText={setCategoria} />
                <TextInput label="Desativado" value="" desativado />
                <EmailInput value={email} onChangeText={setEmail} />
                <PasswordInput value={senha} onChangeText={setSenha} />
                <PasswordInput label="Confirmar senha" variante="popup"
                    value={senhaPopup} onChangeText={setSenhaPopup} />
            </Secao>
            <Secao titulo="Data e horários">
                <DateInput valor={data} onChangeText={setData} />
                {horarios.map((horario) => (
                    <TimeInput key={horario.id} valor={horario.valor}
                        onChangeText={(valor) => setHorarios(horarios.map(
                            (atual) => atual.id === horario.id
                                ? { ...atual, valor } : atual
                        ))}
                        podeRemover={horarios.length > 1}
                        aoRemover={() => setHorarios(horarios.filter(
                            (atual) => atual.id !== horario.id
                        ))} />
                ))}
                <ButtonDashed texto="Cadastrar novo horário"
                    aoPressionar={() => setHorarios([
                        ...horarios, { id: proximoHorarioId.current++, valor: '' }
                    ])} />
            </Secao>
            <Secao titulo="Opção única">
                {['Diária', 'Mensal'].map((titulo) => (
                    <RadioOption key={titulo} titulo={titulo}
                        descricao={titulo === 'Diária' ? 'Uso todos os dias' : 'Uso mensal'}
                        selecionado={opcao === titulo}
                        aoPressionar={() => setOpcao(titulo)} />
                ))}
                <RadioOption titulo="Indisponível" desativado />
            </Secao>
            <Secao titulo="Modais">
                <Button texto="Abrir AppModal" variante="bordaVerde"
                    aoPressionar={() => setModal('base')} />
                <Button texto="Abrir SimpleModal" variante="verde"
                    aoPressionar={() => setModal('simples')} />
                <Button texto="Abrir modal com duas ações"
                    aoPressionar={() => setModal('duplo')} />
                <Button texto="Abrir alerta" variante="vermelho"
                    aoPressionar={() => setModal('alerta')} />
            </Secao>
            <AppModal visivel={modal === 'base'} aoFechar={fecharModal}
                icone={Lock} titulo="Estrutura base"
                mensagem="Ícone, título, mensagem e ações configuráveis.">
                <ButtonPopup texto="Fechar" aoPressionar={fecharModal}
                    estilo={{ width: '100%' }} />
            </AppModal>
            <SimpleModal visivel={modal === 'simples'} aoFechar={fecharModal}
                icone={Lock} titulo="Senha redefinida com sucesso"
                mensagem="Faça login com sua nova senha."
                acaoPrincipal={{ texto: 'Fazer login', aoPressionar: fecharModal }} />
            <SimpleModal visivel={modal === 'duplo'} aoFechar={fecharModal}
                icone={Envelope} titulo="E-mail enviado"
                mensagem="Confira sua caixa de entrada."
                acaoPrincipal={{ texto: 'Entendi', aoPressionar: fecharModal }}
                acaoSecundaria={{
                    texto: 'Enviar novamente', aoPressionar: fecharModal
                }} />
            <AppModal variante="alerta" visivel={modal === 'alerta'} aoFechar={fecharModal}
                icone={Trash} titulo="Excluir conta permanentemente?"
                mensagem="Esta ação removerá seus dados de forma permanente."
                destaque="Deseja continuar?">
                <ButtonPopup texto="Excluir permanentemente" variante="vermelho"
                    aoPressionar={fecharModal} estilo={{ width: '100%' }} />
                <ButtonPopup texto="Cancelar" variante="branco"
                    aoPressionar={fecharModal} estilo={{ width: '100%' }} />
            </AppModal>
        </ScrollView>
    );
}
>>>>>>> 59ec37659ac8f1bd1b2499ea20c917bb90159d20
