import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppPrincipal from './src/App';
import { CycleTodayScreen } from './src/features/cycles/screens/CycleTodayScreen';

const previsaoDeDemonstracao = Object.freeze({
    status: 'DISPONIVEL',
    dataReferencia: '2026-10-05',
    proximoInicioEstimado: '2026-10-29',
    dataOvulacaoEstimada: '2026-10-14',
    janelaFertilEstimada: { inicio: '2026-10-09', fim: '2026-10-14' },
    confiabilidadeMenstrual: { nivel: 'BAIXA' },
    fasesEstimadas: {
        menstrual: { inicio: '2026-10-01', fim: '2026-10-05' },
        folicularPosMenstrual: { inicio: '2026-10-06', fim: '2026-10-13' },
        ovulatoria: { data: '2026-10-14' },
        lutea: { inicio: '2026-10-15', fim: '2026-10-28' }
    }
});

function AppDemonstracaoHu013() {
    const [dataSelecionada, setDataSelecionada] = useState(
        previsaoDeDemonstracao.dataReferencia
    );

    return <CycleTodayScreen
        previsao={previsaoDeDemonstracao}
        dataSelecionada={dataSelecionada}
        aoSelecionarData={setDataSelecionada}
        aoCadastrarMenstruacao={() => {}}
        aoAbrirDiario={() => {}}
        aoAbrirCalendario={() => {}}
    />;
}

export default function App() {
    const demonstrarHu013 = process.env.EXPO_PUBLIC_PREVIEW_HU013 === 'true';
    return (
        <SafeAreaProvider>
            {demonstrarHu013 ? <AppDemonstracaoHu013 /> : <AppPrincipal />}
        </SafeAreaProvider>
    );
}
