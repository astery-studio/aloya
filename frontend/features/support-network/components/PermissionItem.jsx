//Mostra uma permissão individual dentro de um grupo de permissões.
import {memo} from 'react'

import SwitchField from '../../../components/forms/SwitchField/SwitchField'
import {estilos, fundosAtivos} from './PermissionItem.styles'

//Recebe o nome, o estado e a paleta da permissão e devolve o novo estado ao componente pai.
function PermissionItem({titulo, ativo = false, aoAlterar, desabilitado = false, paleta = 'ciclo'}) {
    const estaAtiva = ativo === true
    const fundoAtivo = fundosAtivos[paleta] ?? fundosAtivos.ciclo

    return (
        <SwitchField
            titulo={titulo}
            ativo={estaAtiva}
            aoAlterar={aoAlterar}
            desabilitado={desabilitado}
            estilo={[
                estilos.container,
                estaAtiva && fundoAtivo
            ]}
            estiloTitulo={[
                estilos.titulo,
                estaAtiva ? estilos.tituloAtivo : estilos.tituloInativo
            ]}
        />
    )
}

export default memo(PermissionItem)