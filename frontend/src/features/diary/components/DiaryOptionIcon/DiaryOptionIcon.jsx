import { SvgXml } from 'react-native-svg';

import { diaryIcons } from '../../../../shared/components/icons/DiaryIcons';

function colorirSvg(xml, cor, selecionado) {
    let colorido = xml.replaceAll('currentColor', cor);
    if (selecionado) {
        colorido = colorido.replace(/(fill|stroke)="(?!none|currentColor)[^"]+"/gu, `$1="${cor}"`);
    }
    return colorido.replace(/<svg\b(?![^>]*\bfill=)/u, `<svg fill="${cor}"`);
}

function DiaryOptionIcon({
    iconeId,
    tamanho = 18,
    cor,
    color,
    weight = 'regular',
    selecionado = false
}) {
    const icone = diaryIcons[iconeId];
    const corResolvida = color ?? cor;

    if (!icone) {
        throw new Error(`Ícone do Diário não encontrado: ${iconeId}`);
    }

    if (typeof icone === 'string') {
        const xml = colorirSvg(icone, corResolvida, selecionado);
        return (
            <SvgXml
                accessible={false}
                xml={xml}
                width={tamanho}
                height={tamanho}
                color={corResolvida}
            />
        );
    }

    const Icone = icone;
    return <Icone accessible={false} size={tamanho} color={corResolvida} weight={weight} />;
}

export { DiaryOptionIcon };
