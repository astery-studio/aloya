import { StyleSheet } from 'react-native';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            width: '100%',
            gap: 40
        },

        campoSenha: tema.escuro
            ? {
                  borderRadius: 12,
                  borderWidth: 0.705,
                  borderColor: '#2C2C2C',
                  backgroundColor: '#1E1E1E'
              }
            : {},
        textoSenha: tema.escuro ? { color: '#E3E3E3' } : {},
        labelSenha: tema.escuro ? { color: '#999999' } : {},
        campos: {
            width: '100%',
            gap: tema.espacamentos.medio
        }
    });
}

const estilos = criarEstilos(temaClaro);

export { criarEstilos, estilos };
