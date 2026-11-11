import { SvgXml } from 'react-native-svg';

import { diaryIcons } from '../../../../shared/components/icons/DiaryIcons';

function colorirSvg(xml, cor) {
    return xml
        .replace(/(fill|stroke)="(?!none|currentColor)[^"]+"/gu, `$1="${cor}"`)
        .replaceAll('currentColor', cor);
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
        const xml = selecionado ? colorirSvg(icone, corResolvida) : icone;
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
