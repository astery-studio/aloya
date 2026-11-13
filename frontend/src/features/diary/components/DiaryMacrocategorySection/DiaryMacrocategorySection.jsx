import { memo } from 'react';

import { DiaryMacrocategoryAccordion } from '../DiaryMacrocategoryAccordion/DiaryMacrocategoryAccordion';

function DiaryMacrocategorySection({
    titulo,
    icone: Icone,
    iconeProps,
    paleta = 'ciclo',
    expandido,
    aoAlternar,
    acessorioCabecalho,
    desabilitado = false,
    children
}) {
    return (
        <DiaryMacrocategoryAccordion
            titulo={titulo}
            icone={Icone}
            iconeProps={iconeProps}
            paleta={paleta}
            expandido={expandido}
            aoAlternar={aoAlternar}
            acessorio={acessorioCabecalho}
            rotuloAcao={titulo}
            desabilitado={desabilitado}
            variante="formulario"
        >
            {children}
        </DiaryMacrocategoryAccordion>
    );
}

export default memo(DiaryMacrocategorySection);
