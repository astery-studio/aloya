/**
 * Define posicionamento do cabeçalho e conteúdo das etapas do cadastro.
 */
import { StyleSheet } from 'react-native';
import { espacamentos, typography } from '../../../../shared/theme';

function criarEstilos(tema) {
    return StyleSheet.create({
        navegacao: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            minHeight: 48,
            paddingHorizontal: espacamentos.grande
        },
        pular: {
            ...typography.caption,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal
        },
        conteudo: {
            alignItems: 'center',
            gap: 40,
            width: '100%'
        },
        textos: {
            alignItems: 'center',
            gap: 12,
            maxWidth: 304
        },
        textosFixos: {
            alignSelf: 'center',
            marginTop: espacamentos.extraGrande,
            paddingHorizontal: espacamentos.pequeno
        },
        titulo: {
            ...typography.h1,
            color: tema.escuro ? '#E3E3E3' : tema.cores.interface.textoPrincipal,
            textAlign: 'center'
        },
        descricao: {
            ...typography.bodyDefault,
            color: tema.escuro ? '#999999' : tema.cores.interface.textoSecundario,
            textAlign: 'center'
        },
        campo: { gap: espacamentos.pequeno, width: '100%' },
        acoes: {
            gap: espacamentos.pequeno,
            width: '100%'
        },
        acaoSecundaria: tema.escuro ? { borderColor: '#C26E5F' } : {},
        textoAcaoSecundaria: tema.escuro ? { color: '#C26E5F' } : {},
        erro: {
            ...typography.caption,
            color: tema.escuro ? '#EF9A9A' : tema.cores.feedback.erro,
            textAlign: 'center'
        }
    });
}

export { criarEstilos };
