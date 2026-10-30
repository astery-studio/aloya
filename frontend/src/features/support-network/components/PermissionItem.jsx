//Mostra uma permissão individual dentro de um grupo de permissões.
import { memo, useMemo } from 'react';

import SwitchField from '../../../shared/components/forms/SwitchField/SwitchField';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos, criarFundosAtivos } from './PermissionItem.styles';

//Recebe o nome, o estado e a paleta da permissão e devolve o novo estado ao componente pai.
function PermissionItem({
    titulo,
    ativo = false,
    aoAlterar,
    desabilitado = false,
    paleta = 'ciclo'
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const fundosAtivos = useMemo(() => criarFundosAtivos(tema), [tema]);
    const estaAtiva = ativo === true;
    const fundoAtivo = fundosAtivos[paleta] ?? fundosAtivos.ciclo;

    return (
        <SwitchField
            titulo={titulo}
            ativo={estaAtiva}
            aoAlterar={aoAlterar}
            desabilitado={desabilitado}
            estilo={[estilos.container, estaAtiva && fundoAtivo]}
            estiloTitulo={[estilos.titulo, estaAtiva ? estilos.tituloAtivo : estilos.tituloInativo]}
        />
    );
}

export default memo(PermissionItem);
