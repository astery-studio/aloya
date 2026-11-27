import { gruposNotificacao, valoresIniciais } from './notificationPreferenceFields.js';

const nomesCategorias = {
    ciclo: 'Ciclo e Previsões',
    anticoncepcional: 'Anticoncepcional',
    redeApoio: 'Rede de Apoio',
    seguranca: 'Segurança e Conta'
};

const obrigatorias = [
    'seguranca.dispositivo.novo',
    'seguranca.senha.alterada',
    'seguranca.email.alterado',
    'seguranca.senha.recuperacao',
    'seguranca.senha.redefinida'
];

const catalogo = {
    categorias: Object.entries(nomesCategorias).map(([codigo, nome], ordem) => ({
        codigo,
        nome,
        ordem
    })),
    grupos: Object.entries(gruposNotificacao).map(([codigo, sufixos], ordem) => ({
        codigo,
        ordem,
        categoria: codigo.split('.')[0],
        tipos: sufixos
            .split(' ')
            .map((sufixo) => `${codigo}.${sufixo}`)
            .concat(codigo === 'ciclo.diario' ? ['ciclo.diario.lembrete'] : [])
    })),
    obrigatorias,
    canal: 'push',
    idioma: 'pt-BR',
    preferencias: valoresIniciais
};

export async function inicializarCatalogoNotificacao(prisma) {
    const { dados } = await prisma.catalogoNotificacao.upsert({
        where: { versao: 1 },
        create: { versao: 1, dados: catalogo },
        update: {}
    });
    return dados;
}
