import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useTheme } from '../../../../shared/hooks/useTheme';
import { LegalSection } from '../LegalSection/LegalSection';
import { LegalSupport } from '../LegalSupport/LegalSupport';
import { criarEstilos } from './LegalDocument.styles';

function LegalDocument({ documento, abertas, onAlterarAbertas, posicao, onRolar, Icone }) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const { secoes, estadoEditorial } = documento;
    const rolagem = useRef(null);
    const [posicaoInicial] = useState(() => ({ x: 0, y: posicao }));
    const restaurar = useRef(posicaoInicial.y > 0);
    const todasAbertas = abertas.size === secoes.length;

    function alternarSecao(id) {
        onAlterarAbertas((anteriores) => {
            const proximas = new Set(anteriores);
            if (proximas.has(id)) proximas.delete(id);
            else proximas.add(id);
            return proximas;
        });
    }

    function alternarTodas() {
        onAlterarAbertas((anteriores) =>
            anteriores.size === secoes.length ? new Set() : new Set(secoes.map(({ id }) => id))
        );
    }

    return (
        <ScrollView
            ref={rolagem}
            contentContainerStyle={estilos.conteudo}
            contentOffset={posicaoInicial}
            contentInsetAdjustmentBehavior="never"
            testID={`documento-${documento.id}`}
            scrollEventThrottle={16}
            onScroll={({ nativeEvent }) => onRolar(nativeEvent.contentOffset.y)}
            onContentSizeChange={() => {
                if (restaurar.current) {
                    restaurar.current = false;
                    rolagem.current?.scrollTo({ ...posicaoInicial, animated: false });
                }
            }}
        >
            <Text style={estilos.corpo}>
                Conheça seus direitos e consulte como o Aloya trata suas informações e quais
                condições se aplicam ao uso.
            </Text>
            <View style={estilos.identificacao}>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    {documento.titulo}
                </Text>
                {estadoEditorial === 'minuta' ? (
                    <Text style={estilos.meta}>
                        Minuta interna · Redação de {documento.dataRedacao}
                    </Text>
                ) : null}
            </View>
            <View style={estilos.resumo}>
                <View style={estilos.linha}>
                    <Icone size={20} color={estilos.tituloResumo.color} accessible={false} />
                    <Text accessibilityRole="header" style={estilos.tituloResumo}>
                        Apresentação
                    </Text>
                </View>
                <Text selectable style={estilos.textoResumo}>
                    {documento.resumo}
                </Text>
            </View>
            <View style={estilos.secoes}>
                <View style={estilos.barraSecoes}>
                    <Text accessibilityRole="header" style={estilos.chamada}>
                        Seções do documento
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={alternarTodas}
                        style={({ pressed }) => [estilos.acao, pressed && estilos.pressionado]}
                    >
                        <Text style={estilos.textoAcao}>
                            {todasAbertas ? 'Recolher tudo' : 'Expandir tudo'}
                        </Text>
                    </Pressable>
                </View>
                {secoes.map((secao, indice) => (
                    <LegalSection
                        key={secao.id}
                        secao={secao}
                        indice={indice}
                        aberta={abertas.has(secao.id)}
                        onAlternar={() => alternarSecao(secao.id)}
                    />
                ))}
            </View>
            <LegalSupport />
        </ScrollView>
    );
}

export { LegalDocument };
