import { ScrollView, StyleSheet } from 'react-native';

import ButtonScreen from '../../../../shared/components/common/Button/ButtonScreen';
import { MainLayout } from '../../../../shared/layouts/MainLayout/MainLayout';
import { CalendarScreenContainer } from '../../../calendar/screens/CalendarScreenContainer';
import { obterHojeLocal } from '../../../calendar/utils/cycleCalendar.utils';
import { ContraceptiveTrackingScreen } from '../../../contraceptives/screens/ContraceptiveTrackingScreen';
import { CycleEducationSection } from '../../../cycles/components/CycleEducationSection';
import { formatarDataCabecalho } from '../../../cycles/utils/cyclePresentation';
import { SharedContentState } from '../../components/SharedContentState/SharedContentState';
import { SupportedCycleHero } from '../../components/SupportedCycleHero/SupportedCycleHero';
import { SupportedPersonIndicator } from '../../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { useSharedContent } from '../../hooks/useSharedContent';
import { useSharedSupportAccess } from '../../hooks/useSharedSupportAccess';
import { SharedCycleHistoryScreen } from '../SharedCycleHistoryScreen/SharedCycleHistoryScreen';
import { SharedDiaryScreen } from '../SharedDiaryScreen/SharedDiaryScreen';
import { SharedHomeWithoutContact } from './SharedHomeWithoutContact';

const TITULOS = {
    inicio: 'Início',
    calendario: 'Calendário',
    diario: 'Diário',
    ciclos: 'Histórico de Ciclos',
    anticoncepcionais: 'Anticoncepcionais'
};

const PERMISSAO_FASE = 'geral.fase_atual';
const PERMISSAO_HISTORICO = 'geral.historico_ciclo';
const PERMISSAO_ANTICONCEPCIONAIS = 'geral.anticoncepcionais';
const PERMISSAO_DICAS = 'geral.dicas';

function temDiario(permissoes) {
    return permissoes.some((id) => !id.startsWith('geral.'));
}

function InicioCompartilhado({ acesso, consultas, onSelecionarAba }) {
    const { nomeTitular, permissoes } = acesso;
    const verFase = permissoes.includes(PERMISSAO_FASE);
    const verDicas = permissoes.includes(PERMISSAO_DICAS);
    const estadoFase = useSharedContent(verFase ? consultas.fase : null);
    const fase = estadoFase.dados?.faseAtual?.toLowerCase();

    return (
        <ScrollView contentContainerStyle={estilos.conteudo}>
            <SupportedPersonIndicator nome={nomeTitular} />
            {verFase && estadoFase.status !== 'disponivel' ? (
                <SharedContentState
                    status={estadoFase.status}
                    aoTentarNovamente={estadoFase.recarregar}
                />
            ) : (
                <SupportedCycleHero
                    nomeTitular={nomeTitular}
                    fase={fase}
                    possuiDadosCiclo={Boolean(fase)}
                    exibirFase={verFase}
                />
            )}
            {permissoes.includes(PERMISSAO_ANTICONCEPCIONAIS) ? (
                <ButtonScreen
                    texto="Ver Anticoncepcionais"
                    aoPressionar={() => onSelecionarAba('anticoncepcionais')}
                />
            ) : null}
            {permissoes.includes(PERMISSAO_HISTORICO) ? (
                <ButtonScreen
                    texto="Ver Histórico de Ciclos"
                    aoPressionar={() => onSelecionarAba('ciclos')}
                />
            ) : null}
            {verDicas ? <CycleEducationSection perspectiva="contato" /> : null}
            {!permissoes.some((id) =>
                [
                    PERMISSAO_FASE,
                    PERMISSAO_ANTICONCEPCIONAIS,
                    PERMISSAO_HISTORICO,
                    PERMISSAO_DICAS
                ].includes(id)
            ) ? (
                <SharedContentState />
            ) : null}
        </ScrollView>
    );
}

function AnticoncepcionaisCompartilhados({ consultar, aoVoltar }) {
    const estado = useSharedContent(consultar);

    return (
        <ContraceptiveTrackingScreen
            somenteLeitura
            anticoncepcionais={estado.dados}
            carregando={estado.status === 'carregando'}
            erro={estado.status === 'erro'}
            aoTentarNovamente={estado.recarregar}
            aoVoltar={aoVoltar}
        />
    );
}

function SharedSupportFlow({ tela, vinculoId, service, onSelecionarAba, onSessaoExpirada }) {
    const { acesso, consultas, recarregar } = useSharedSupportAccess({
        service,
        vinculoId,
        onSessaoExpirada
    });
    const permissoes = acesso.permissoes ?? [];
    const historicoPermitido = permissoes.includes(PERMISSAO_HISTORICO);
    const diarioPermitido = temDiario(permissoes);
    const homeSemContato = tela === 'inicio' && vinculoId == null;
    const titulo = homeSemContato
        ? formatarDataCabecalho(obterHojeLocal()).replace(/ - (\d) de /u, ' - 0$1 de ')
        : TITULOS[tela];
    const voltar = () => onSelecionarAba('inicio');
    const subtela = tela === 'ciclos' || tela === 'anticoncepcionais';

    if (acesso.status === 'disponivel') {
        if (tela === 'anticoncepcionais' && permissoes.includes(PERMISSAO_ANTICONCEPCIONAIS)) {
            return (
                <AnticoncepcionaisCompartilhados
                    key={acesso.assinatura}
                    consultar={consultas.anticoncepcionais}
                    aoVoltar={voltar}
                />
            );
        }
        if (tela === 'calendario' && historicoPermitido) {
            return (
                <CalendarScreenContainer
                    key={acesso.assinatura}
                    somenteLeitura
                    service={consultas.calendario}
                    onSelecionarAba={onSelecionarAba}
                />
            );
        }
        if (tela === 'ciclos' && historicoPermitido) {
            return (
                <SharedCycleHistoryScreen
                    key={acesso.assinatura}
                    nomeTitular={acesso.nomeTitular}
                    service={consultas.historico}
                    onVoltar={voltar}
                />
            );
        }
        if (tela === 'diario' && diarioPermitido) {
            return (
                <SharedDiaryScreen
                    key={acesso.assinatura}
                    nomeTitular={acesso.nomeTitular}
                    permissoes={permissoes}
                    service={consultas.diario}
                    onSelecionarAba={onSelecionarAba}
                />
            );
        }
    }

    const conteudoDisponivel = acesso.status === 'disponivel';

    return (
        <MainLayout
            titulo={titulo}
            varianteHeader={subtela ? 'comVoltar' : homeSemContato ? 'inicio' : 'padrao'}
            abaAtiva={tela}
            onVoltar={subtela ? voltar : undefined}
            exibirNavegacaoInferior={!subtela}
            onSelecionarAba={onSelecionarAba}
        >
            {homeSemContato ? (
                <SharedHomeWithoutContact />
            ) : conteudoDisponivel && tela === 'inicio' ? (
                <InicioCompartilhado
                    key={acesso.assinatura}
                    acesso={acesso}
                    consultas={consultas}
                    onSelecionarAba={onSelecionarAba}
                />
            ) : (
                <SharedContentState
                    status={conteudoDisponivel ? 'vazio' : acesso.status}
                    aoTentarNovamente={recarregar}
                />
            )}
        </MainLayout>
    );
}

const estilos = StyleSheet.create({
    conteudo: { flexGrow: 1, gap: 16, paddingHorizontal: 16, paddingBottom: 24 }
});

export { SharedSupportFlow };
