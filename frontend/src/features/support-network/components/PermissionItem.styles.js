//Define o visual das permissões individuais exibidas dentro dos grupos.
import { StyleSheet } from 'react-native';
import { fontFamilies } from '../../../shared/theme';
import { temaClaro } from '../../../shared/theme/themePalettes';

function criarEstilos(tema) {
    return StyleSheet.create({
        container: {
            minHeight: 52,
            paddingLeft: 58,
            paddingRight: 16,
            paddingVertical: 6,
            gap: 12,
            backgroundColor: 'transparent',
            borderWidth: 0,
            borderRadius: 0
        },

        titulo: {
            fontSize: 15,
            lineHeight: 22,
            includeFontPadding: false
        },

        tituloAtivo: {
            color: tema.cores.interface.textoPrincipal,
            fontFamily: fontFamilies.medium,
            fontWeight: '500'
        },

        tituloInativo: {
            color: tema.cores.interface.textoSecundario,
            fontFamily: fontFamilies.regular,
            fontWeight: '400'
        }
    });
}

function criarFundosAtivos(tema) {
    const fundoEscuro = tema.cores.interface.destaqueSuave;
    return StyleSheet.create({
        ciclo: {
            backgroundColor: tema.escuro ? fundoEscuro : tema.cores.redeApoio.ciclo.fundoExpandido
        },

        corpo: {
            backgroundColor: tema.escuro ? fundoEscuro : tema.cores.redeApoio.corpo.fundoExpandido
        },

        emocional: {
            backgroundColor: tema.escuro
                ? fundoEscuro
                : tema.cores.redeApoio.emocional.fundoExpandido
        },

        energia: {
            backgroundColor: tema.escuro ? fundoEscuro : tema.cores.redeApoio.energia.fundoExpandido
        },

        vidaIntima: {
            backgroundColor: tema.escuro
                ? fundoEscuro
                : tema.cores.redeApoio.vidaIntima.fundoExpandido
        },

        saude: {
            backgroundColor: tema.escuro ? fundoEscuro : tema.cores.redeApoio.saude.fundoExpandido
        }
    });
}

const estilos = criarEstilos(temaClaro);
const fundosAtivos = criarFundosAtivos(temaClaro);

export { criarEstilos, criarFundosAtivos, estilos, fundosAtivos };
