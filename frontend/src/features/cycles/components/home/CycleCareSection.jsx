import { Pressable, Text, View } from 'react-native';
import {
    CaretRightIcon,
    FlowerLotusIcon,
    HeartIcon,
    NotebookIcon
} from '../../../../shared/components/icons/AppIcons';
import { CONTEUDO_POR_FASE } from '../sheets/CyclePhaseEducationSheet.content';
import { estilos } from './CycleCareSection.styles';

const CUIDADOS = Object.freeze([
    {
        id: 'respiracao',
        categoria: '2 minutos',
        titulo: 'Um respiro para você',
        descricao: 'Exercício guiado',
        Icone: FlowerLotusIcon,
        cor: '#7B5EA7',
        fundo: 'rgba(123, 94, 167, 0.1)'
    },
    {
        id: 'reflexao',
        categoria: 'Reflexão',
        titulo: 'Uma pergunta para hoje',
        descricao: 'Registre no Diário',
        Icone: HeartIcon,
        cor: '#B04A70',
        fundo: 'rgba(176, 74, 112, 0.1)'
    },
    {
        id: 'educacao',
        categoria: 'Conheça seu ciclo',
        titulo: 'O que acontece agora?',
        descricao: 'Leitura de 1 minuto',
        Icone: NotebookIcon,
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)'
    }
]);

function CycleCareSection({
    fase,
    corDestaque = '#C85A44',
    aoAbrirRespiracao,
    aoAbrirReflexao,
    aoAbrirEducacao
}) {
    const visualEducativo = CONTEUDO_POR_FASE[fase] ?? {
        Icone: NotebookIcon,
        cor: '#C85A44',
        fundo: 'rgba(200, 90, 68, 0.1)',
        weight: 'regular'
    };
    const callbacks = {
        respiracao: aoAbrirRespiracao,
        reflexao: aoAbrirReflexao,
        educacao: aoAbrirEducacao
    };
    return (
        <View style={estilos.secao}>
            <Text style={[estilos.etiqueta, { color: corDestaque }]}>Para o seu momento</Text>
            <Text accessibilityRole="header" style={estilos.tituloSecao}>
                Cuidados para hoje
            </Text>
            <View style={estilos.lista}>
                {CUIDADOS.map((cuidado) => {
                    const visual = cuidado.id === 'educacao' ? visualEducativo : cuidado;
                    const { id, categoria, titulo, descricao } = cuidado;
                    const { Icone } = visual;
                    return (
                        <Pressable
                            key={id}
                            accessibilityLabel={`${categoria}. ${titulo}. ${descricao}. Abrir para a fase ${fase}.`}
                            accessibilityRole="button"
                            onPress={callbacks[id]}
                            style={estilos.card}
                        >
                            <View style={[estilos.caixaIcone, { backgroundColor: visual.fundo }]}>
                                <Icone size={24} color={visual.cor} weight={visual.weight} />
                            </View>
                            <View style={estilos.textos}>
                                <Text style={estilos.categoria}>{categoria}</Text>
                                <Text style={estilos.titulo}>{titulo}</Text>
                                <Text style={estilos.descricao}>{descricao}</Text>
                            </View>
                            <CaretRightIcon size={20} color="#222222" />
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export { CUIDADOS, CycleCareSection };
