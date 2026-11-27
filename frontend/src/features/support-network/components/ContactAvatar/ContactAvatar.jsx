//Apresenta a identificação visual persistida de um contato da Rede de Apoio.
import { View } from 'react-native';

import {
    FlowerLotusIcon,
    FlowerTulipIcon,
    HandshakeIcon,
    HeartIcon,
    RainbowCloudIcon,
    ShieldCheckIcon,
    SmileyWinkIcon,
    SparkleIcon,
    SunIcon,
    UserIcon
} from '../../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../../shared/hooks/useTheme';
import { coresNoturnasConteudo } from '../../../../shared/theme/coresNoturnasConteudo';
import {
    corContatoEhValida,
    iconeContatoEhValido,
    obterOpcaoCorContato
} from '../../constants/contactAppearanceOptions';
import { estilos } from './ContactAvatar.styles';

const ICONES_POR_ID = Object.freeze({
    pessoa: UserIcon,
    coracao: HeartIcon,
    sol: SunIcon,
    escudo: ShieldCheckIcon,
    tulipa: FlowerTulipIcon,
    aperto_maos: HandshakeIcon,
    lotus: FlowerLotusIcon,
    brilho: SparkleIcon,
    arco_iris: RainbowCloudIcon,
    sorriso: SmileyWinkIcon
});

const TAMANHOS = Object.freeze({
    pequeno: Object.freeze({
        estilo: estilos.pequeno,
        tamanhoIcone: 16
    }),
    medio: Object.freeze({
        estilo: estilos.medio,
        tamanhoIcone: 24
    })
});

const APARENCIA_ESCURA = Object.freeze({
    coral: {
        cor: coresNoturnasConteudo.coral,
        fundo: 'rgba(194, 110, 95, 0.14)',
        borda: 'rgba(194, 110, 95, 0.72)'
    },
    verde: {
        cor: coresNoturnasConteudo.verde,
        fundo: 'rgba(165, 214, 167, 0.14)',
        borda: 'rgba(165, 214, 167, 0.72)'
    },
    azul: {
        cor: coresNoturnasConteudo.azul,
        fundo: 'rgba(144, 202, 249, 0.14)',
        borda: 'rgba(144, 202, 249, 0.72)'
    }
});

function normalizarTamanho(tamanho) {
    return Object.hasOwn(TAMANHOS, tamanho) ? tamanho : 'medio';
}

function ContactAvatar({ iconeId, corId, tamanho = 'medio', tamanhoIcone, rotuloAcessibilidade }) {
    const { escuro } = useTheme();
    const iconeSeguro = iconeContatoEhValido(iconeId) ? iconeId : 'pessoa';
    const corSegura = corContatoEhValida(corId) ? corId : 'branco';
    const tamanhoSeguro = normalizarTamanho(tamanho);

    const Icone = ICONES_POR_ID[iconeSeguro];
    const opcaoCor = obterOpcaoCorContato(corSegura);
    const corEscura = escuro ? APARENCIA_ESCURA[corSegura] : undefined;
    const cor = corEscura?.cor ?? opcaoCor.cor;
    const configuracaoTamanho = TAMANHOS[tamanhoSeguro];
    const tamanhoIconeSeguro =
        Number.isFinite(tamanhoIcone) && tamanhoIcone > 0
            ? tamanhoIcone
            : configuracaoTamanho.tamanhoIcone;
    const corPequena =
        tamanhoSeguro === 'pequeno' && corSegura !== 'branco'
            ? {
                  backgroundColor: `${cor}33`,
                  borderColor: cor
              }
            : null;

    const rotulo =
        typeof rotuloAcessibilidade === 'string' && rotuloAcessibilidade.trim().length > 0
            ? rotuloAcessibilidade.trim()
            : null;

    return (
        <View
            testID="contact-avatar"
            accessible={Boolean(rotulo)}
            accessibilityRole={rotulo ? 'image' : undefined}
            accessibilityLabel={rotulo ?? undefined}
            accessibilityElementsHidden={!rotulo}
            importantForAccessibility={rotulo ? 'yes' : 'no-hide-descendants'}
            style={[
                estilos.base,
                configuracaoTamanho.estilo,
                {
                    backgroundColor: corEscura?.fundo ?? opcaoCor.fundo,
                    borderColor: corEscura?.borda ?? opcaoCor.borda
                },
                corPequena
            ]}
        >
            <Icone
                testID={`contact-avatar-icon-${iconeSeguro}`}
                accessibilityLabel={undefined}
                size={tamanhoIconeSeguro}
                color={cor}
                weight="regular"
            />
        </View>
    );
}

export { ContactAvatar, ICONES_POR_ID, normalizarTamanho };
