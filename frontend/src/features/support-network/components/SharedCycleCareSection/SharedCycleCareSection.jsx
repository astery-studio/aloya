import { ChatsCircleIcon } from 'phosphor-react-native/src/icons/ChatsCircle';
import { HandHeartIcon } from 'phosphor-react-native/src/icons/HandHeart';
import { Text, View } from 'react-native';
import { HandshakeIcon } from '../../../../shared/components/icons/AppIcons';
import { CycleHomeCard } from '../../../cycles/components/home/CycleHomeCard';
import { estilos } from './SharedCycleCareSection.styles';

function SharedCycleCareSection({ nomeTitular }) {
    const orientacoes = [
        {
            titulo: `Pergunte como ${nomeTitular} está`,
            texto: 'Cada menstruação é diferente. Perguntar como a pessoa está se sentindo é uma boa forma de entender se ela precisa de alguma coisa.',
            Icone: ChatsCircleIcon,
            cor: '#C85A44',
            fundo: 'rgba(200, 90, 68, 0.10)'
        },
        {
            titulo: 'Ofereça ajuda prática',
            texto: 'Se houver desconforto ou cansaço, ofereça ajuda com pequenas tarefas.',
            Icone: HandshakeIcon,
            cor: '#7B5EA7',
            fundo: 'rgba(123, 94, 167, 0.10)'
        },
        {
            titulo: 'Respeite o ritmo',
            texto: 'Algumas pessoas preferem descansar, outras mantêm sua rotina normalmente. O mais importante é respeitar suas escolhas.',
            Icone: HandHeartIcon,
            cor: '#4A758E',
            fundo: 'rgba(74, 117, 142, 0.10)'
        }
    ];

    return (
        <View style={estilos.area}>
            <View style={estilos.secao}>
                <Text style={estilos.rotulo}>Cuidado respeitoso</Text>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Como oferecer apoio hoje?
                </Text>
                <Text style={estilos.descricao}>
                    Pequenos gestos podem fazer diferença. Descubra sugestões para cuidar com
                    respeito, atenção e gentileza.
                </Text>
                <View style={estilos.lista}>
                    {orientacoes.map(({ titulo, texto, Icone, cor, fundo }) => (
                        <CycleHomeCard
                            key={titulo}
                            titulo={titulo}
                            descricao="Toque para explorar"
                            estilosOpcao={estilosOpcao}
                            icone={
                                <View style={[estilos.caixaIcone, { backgroundColor: fundo }]}>
                                    <View style={estilos.areaIcone}>
                                        <Icone size={22} color={cor} weight="regular" />
                                    </View>
                                </View>
                            }
                        >
                            <Text style={estilos.textoExpandido}>{texto}</Text>
                        </CycleHomeCard>
                    ))}
                </View>
            </View>
        </View>
    );
}

const estilosOpcao = {
    card: estilos.opcao,
    linha: estilos.linhaOpcao,
    titulo: estilos.tituloOpcao,
    descricao: estilos.descricaoOpcao
};

export { SharedCycleCareSection };
