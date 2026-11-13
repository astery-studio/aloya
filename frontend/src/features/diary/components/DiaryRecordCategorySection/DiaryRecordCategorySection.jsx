import { Text, View } from 'react-native';

import { DiaryRecordValueChip } from '../DiaryRecordValueChip/DiaryRecordValueChip';

function formatarDuracao(minutos) {
    if (!Number.isSafeInteger(minutos) || minutos <= 0) return null;
    const horas = Math.floor(minutos / 60);
    const restante = minutos % 60;
    const textoMinutos = `${restante} ${restante === 1 ? 'minuto' : 'minutos'}`;
    if (!horas) return textoMinutos;
    if (!restante) return horas === 1 ? '1 hora' : `${horas} horas`;
    return `${horas} ${horas === 1 ? 'hora' : 'horas'} e ${textoMinutos}`;
}

function valorEscalado(categoria) {
    if (typeof categoria?.valor !== 'string' || !categoria.valor.trim()) return null;
    const unidades = { temperatura_basal: '°C', peso: 'kg' };
    const unidade = unidades[categoria.id];
    return unidade ? `${categoria.valor.trim()} ${unidade}` : categoria.valor.trim();
}

function obterCoresCategoria(categoriaId, corPadrao, macrocategoria = '') {
    const macroNormalizada = macrocategoria
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    if (macroNormalizada.includes('ciclo'))
        return { fundo: 'rgba(200, 90, 68, 0.1)', texto: '#C85A44' };
    if (macroNormalizada.includes('corpo'))
        return { fundo: 'rgba(44, 76, 59, 0.1)', texto: '#2C4C3B' };
    if (macroNormalizada.includes('emocional'))
        return { fundo: 'rgba(123, 94, 167, 0.1)', texto: '#7B5EA7' };
    if (macroNormalizada.includes('energia'))
        return { fundo: 'rgba(176, 125, 42, 0.1)', texto: '#B07D2A' };
    if (macroNormalizada.includes('intima'))
        return { fundo: 'rgba(176, 74, 112, 0.1)', texto: '#B04A70' };
    if (macroNormalizada.includes('saude'))
        return { fundo: 'rgba(74, 88, 153, 0.1)', texto: '#4A5899' };
    if (categoriaId === 'sintomas_pre_menstruais') return { fundo: '#F1EAF8', texto: '#8761A8' };
    if (['vida_social', 'atividade_sexual', 'desejo_libido'].includes(categoriaId))
        return { fundo: '#F8E8EE', texto: '#B44F78' };
    return { fundo: '#E8EFEB', texto: corPadrao };
}

function DiaryRecordCategorySection({ categoria, estilos, cor }) {
    const anotacao = categoria.id === 'anotacao_livre' ? categoria.texto : null;
    const duracao = formatarDuracao(categoria.duracaoMinutos);
    const valor = valorEscalado(categoria);
    const opcoes = Array.isArray(categoria.opcoes)
        ? categoria.opcoes.filter((opcao) => opcao && typeof opcao.nome === 'string')
        : [];
    const cores = obterCoresCategoria(categoria.id, cor, categoria.macrocategoria);

    if (!anotacao && !duracao && !valor && opcoes.length === 0) return null;

    return (
        <View style={estilos.categoria}>
            <View style={estilos.tituloCategoriaLinha}>
                <View style={estilos.separador} />
                <Text accessibilityRole="header" style={estilos.tituloCategoria}>
                    {categoria.nome.toUpperCase()}
                </Text>
                <View style={estilos.separador} />
            </View>
            {opcoes.length ? (
                <View style={estilos.chips}>
                    {opcoes.map((opcao, indice) => (
                        <DiaryRecordValueChip
                            key={`${opcao.id ?? opcao.nome}-${indice}`}
                            categoriaId={categoria.id}
                            opcao={opcao}
                            estilos={estilos}
                            cores={cores}
                        />
                    ))}
                </View>
            ) : null}
            {duracao || valor ? (
                <View style={estilos.chips}>
                    <DiaryRecordValueChip
                        rotulo={duracao ?? valor}
                        estilos={estilos}
                        cores={cores}
                    />
                </View>
            ) : null}
            {anotacao ? (
                <Text accessibilityLabel={`Anotação do dia: ${anotacao}`} style={estilos.anotacao}>
                    {anotacao}
                </Text>
            ) : null}
        </View>
    );
}

export { DiaryRecordCategorySection, formatarDuracao, obterCoresCategoria, valorEscalado };
