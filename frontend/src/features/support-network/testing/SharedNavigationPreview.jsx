import { useMemo, useState } from 'react';

import { SettingsScreen } from '../../settings/screens/SettingsScreen';
import { ReceivedContactsScreen } from '../screens/ReceivedContactsScreen/ReceivedContactsScreen';
import { SharedSupportFlow } from '../screens/SharedSupportFlow/SharedSupportFlow';

const CONTATOS = ['Júlia', 'Maria'].map((identificacao, indice) => ({
    id: indice + 1,
    identificacao,
    email: `contato-${indice + 1}@example.com`,
    status: 'ativo',
    iconeId: indice === 0 ? 'sol' : 'coracao',
    corId: indice === 0 ? 'laranja' : 'coral',
    dataAtivacao: '2026-10-30T00:00:00.000Z',
    vinculo: { tipo: 'individual', permissoes: ['geral.fase_atual'] }
}));

function criarServicosDaPrevia(revogado) {
    const contatos = revogado ? CONTATOS.slice(1) : CONTATOS;

    return {
        recebidos: {
            listarRecebidos: async () => ({
                contatos,
                resumo: { total: contatos.length, pendentes: 0, ativos: contatos.length }
            }),
            responderConvite: async () => {}
        },
        compartilhados: {
            async consultar(id, recurso) {
                const contato = contatos.find((item) => item.id === id);
                if (!contato) throw Object.assign(new Error('Vínculo revogado'), { status: 403 });
                return {
                    permissoes: contato.vinculo.permissoes,
                    dados:
                        recurso === '/fase'
                            ? { faseAtual: id === 1 ? 'FOLICULAR' : 'LUTEA' }
                            : { nomeTitular: contato.identificacao }
                };
            }
        }
    };
}

function SharedNavigationPreview({ revogado = false }) {
    const [vinculoId, setVinculoId] = useState(revogado ? 1 : null);
    const [tela, setTela] = useState(revogado ? 'inicio' : 'membros');
    const servicos = useMemo(() => criarServicosDaPrevia(revogado), [revogado]);

    if (tela === 'membros') {
        return (
            <ReceivedContactsScreen
                service={servicos.recebidos}
                vinculoVisualizadoId={vinculoId}
                onSelecionarAba={setTela}
                onVisualizarContato={(contato) => {
                    setVinculoId(contato?.id ?? null);
                    if (contato) setTela('inicio');
                }}
            />
        );
    }

    if (tela === 'configuracoes') {
        return <SettingsScreen emAcompanhamento onSelecionarAba={setTela} />;
    }

    return (
        <SharedSupportFlow
            key={vinculoId}
            tela={tela}
            vinculoId={vinculoId}
            service={servicos.compartilhados}
            onSelecionarAba={setTela}
        />
    );
}

export { SharedNavigationPreview };
