import { memo } from 'react';
import { SvgXml } from 'react-native-svg';

import { diaryIcons } from '../../../../shared/components/icons/DiaryIcons';

const COR_ICONE_SELECIONADO = '#FFFFFF';

function colorirSvg(xml, cor) {
    if (!cor) return xml;
    let colorido = xml.replaceAll('currentColor', cor);
    colorido = colorido.replace(/(fill|stroke)="(?!none|currentColor)[^"]+"/gu, `$1="${cor}"`);
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
    const corResolvida = selecionado ? COR_ICONE_SELECIONADO : (color ?? cor);

    if (!icone) {
        throw new Error(`Ícone do Diário não encontrado: ${iconeId}`);
    }

    if (typeof icone === 'string') {
        const xml = colorirSvg(icone, corResolvida);
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

const MemoizedDiaryOptionIcon = memo(DiaryOptionIcon);

export { MemoizedDiaryOptionIcon as DiaryOptionIcon };
