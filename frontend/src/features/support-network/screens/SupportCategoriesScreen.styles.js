//Define a estrutura visual da tela de categorias de permissão.
import {StyleSheet} from 'react-native'

import {tema} from '../../../shared/theme'

const estilos = StyleSheet.create({
    tela: {
        flex: 1,
        width: '100%',
        backgroundColor:
            tema.cores.neutras.fundoClaro
    }
})

export {estilos}