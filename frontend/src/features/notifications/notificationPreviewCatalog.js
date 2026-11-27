import { catalogoNotificacoes } from './notificationCatalog';

const canais = {
    ciclo: 'ciclo',
    anticoncepcional: 'anticoncepcional',
    redeApoio: 'rede-apoio'
};

const variantes = {
    'ciclo.menstrual.proxima': [
        ['ciclo.menstrual.proxima', 'Próxima menstruação — confiabilidade alta'],
        ['ciclo.menstrual.proxima.mediaBaixa', 'Próxima menstruação — confiabilidade média/baixa']
    ],
    'redeApoio.convites.respondido': [
        ['redeApoio.convites.respondido.aceito', 'Convite aceito'],
        ['redeApoio.convites.respondido.recusado', 'Convite recusado']
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
