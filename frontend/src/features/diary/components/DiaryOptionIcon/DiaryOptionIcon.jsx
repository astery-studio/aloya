import { SvgXml } from 'react-native-svg';

import { diaryIcons } from '../../../../shared/components/icons/DiaryIcons';

function DiaryOptionIcon({ iconeId, tamanho = 18, cor, weight = 'regular' }) {
    const icone = diaryIcons[iconeId];

    if (!icone) {
        throw new Error(`Ícone do Diário não encontrado: ${iconeId}`);
    }

    if (typeof icone === 'string') {
        return (
            <SvgXml
                accessible={false}
                xml={icone}
                width={tamanho}
                height={tamanho}
                color={cor}
            />
        );
    }

    const Icone = icone;
    return <Icone accessible={false} size={tamanho} color={cor} weight={weight} />;
}

export { DiaryOptionIcon };
