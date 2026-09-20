import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Plus } from 'phosphor-react-native';
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
import ButtonPopup from './components/common/ButtonPopup/ButtonPopup';
import TextInput from './components/forms/TextInput';
import EmailInput from './components/forms/EmailInput';
import PasswordInput from './components/forms/PasswordInput';

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

export default function App() {
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
        </ScrollView>
    );
}
