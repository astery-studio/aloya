import { catalogoNotificacoes } from './notificationCatalog';
import dicasPorFase from '../cycles/constants/cycleSelfCareTips.json';

const canais = {
    ciclo: 'ciclo',
    anticoncepcional: 'anticoncepcional',
    redeApoio: 'rede-apoio'
};

const variantes = {
    'ciclo.menstrual.proxima': [
        ['ciclo.menstrual.proxima', 'Próxima menstruação — confiabilidade alta'],
        ['ciclo.menstrual.proxima.media', 'Próxima menstruação — confiabilidade média'],
        ['ciclo.menstrual.proxima.baixa', 'Próxima menstruação — confiabilidade baixa']
    ],
    'redeApoio.convites.respondido': [
        ['redeApoio.convites.respondido.aceito', 'Convite aceito'],
        ['redeApoio.convites.respondido.recusado', 'Convite recusado']
    ],
    'redeApoio.dicas.apoio': [
        ['redeApoio.dicas.apoio.menstrual', 'Dica de apoio na fase menstrual'],
        ['redeApoio.dicas.apoio.folicular', 'Dica de apoio na fase folicular'],
        ['redeApoio.dicas.apoio.ovulatoria', 'Dica de apoio na fase ovulatória'],
        ['redeApoio.dicas.apoio.lutea', 'Dica de apoio na fase lútea']
    ],
    'redeApoio.anticoncepcional.aplicacoesTrocas': [
        ['redeApoio.anticoncepcional.aplicacoesTrocas', 'Aplicação compartilhada'],
        ['redeApoio.anticoncepcional.aplicacoesTrocas.troca', 'Troca compartilhada']
    ]
};

export function listarPreviews() {
    const categorias = Object.entries(catalogoNotificacoes).map(
        ([categoria, { titulo, grupos }]) => ({
            titulo,
            canal: canais[categoria],
            grupos: Object.entries(grupos).map(([grupo, [nome, linhas]]) => ({
                nome,
                tipos: linhas
                    .filter(([, , tipo]) => tipo !== 'antecedencia' && tipo !== 'horario')
                    .flatMap(([id, rotulo]) => {
                        const codigo = `${categoria}.${grupo}.${id}`;
                        if (categoria === 'ciclo' && grupo === 'dicas') {
                            return dicasPorFase[id].map(({ title }, indice) => [
                                `${codigo}.${indice + 1}`,
                                `${rotulo} — ${title}`
                            ]);
                        }
                        return variantes[codigo] ?? [[codigo, rotulo]];
                    })
            }))
        })
    );

    return [
        ...categorias,
        {
            titulo: 'Segurança e Conta',
            canal: 'seguranca',
            grupos: [
                {
                    nome: 'Segurança',
                    tipos: [
                        ['seguranca.dispositivo.novo', 'Novo dispositivo'],
                        ['seguranca.senha.alterada', 'Senha alterada'],
                        ['seguranca.email.alterado', 'E-mail alterado'],
                        ['seguranca.senha.recuperacao', 'Recuperação de senha solicitada'],
                        ['seguranca.senha.redefinida', 'Senha redefinida']
                    ]
                }
            ]
        }
    ];
}
