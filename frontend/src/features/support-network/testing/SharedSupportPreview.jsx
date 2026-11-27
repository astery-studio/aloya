import { useState } from 'react';
import { useFonts } from 'expo-font';
import {
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppThemeRoot } from '../../../app/AppThemeRoot';
import { CalendarScreenContainer } from '../../calendar/screens/CalendarScreenContainer';
import { adicionarDias } from '../../cycles/utils/cyclePresentation';
import { obterHojeLocal } from '../../calendar/utils/cycleCalendar.utils';
import { ContraceptiveTrackingScreen } from '../../contraceptives/screens/ContraceptiveTrackingScreen';
import { normalizarFiltrosDiario } from '../../diary/utils/diaryFilters';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';
import { SharedCycleHistoryScreen } from '../screens/SharedCycleHistoryScreen/SharedCycleHistoryScreen';
import { SharedDiaryScreen } from '../screens/SharedDiaryScreen/SharedDiaryScreen';
import { SharedHomeScreen } from '../screens/SharedSupportFlow/SharedHomeScreen';
import { SharedNavigationPreview } from './SharedNavigationPreview';

const NOME = 'Júlia';
const PERMISSOES_DEMONSTRACAO = [
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(({ permissoes }) => permissoes)
].map(({ id }) => id);
const ANTICONCEPCIONAIS_PREVIA = [
    {
        id: 'yaz',
        nome: 'Yaz',
        tipo: 'pilula',
        intensidadeAlerta: 'moderado',
        horarios: ['08:00', '20:00'],
        statusUltimoUso: 'pendente',
        usosHoje: [
            { id: 'yaz-manha', horario: '08:00', atrasado: true, status: 'pendente' },
            { id: 'yaz-noite', horario: '20:00', status: 'pendente' }
        ],
        historico: [
            { id: 'yaz-06', data: '2026-09-06', horarioProgramado: '08:00', estado: 'confirmado' },
            {
                id: 'yaz-05',
                data: '2026-09-05',
                horarioProgramado: '08:00',
                estado: 'naoConfirmado'
            },
            { id: 'yaz-04', data: '2026-09-04', horarioProgramado: '08:00', estado: 'confirmado' },
            { id: 'yaz-03', data: '2026-09-03', horarioProgramado: '08:00', estado: 'foraDoPrazo' }
        ]
    },
    {
        id: 'evra',
        nome: 'Evra',
        tipo: 'adesivo',
        intensidadeAlerta: 'leve',
        horarios: ['09:30'],
        statusUltimoUso: 'pendente',
        usosHoje: [{ id: 'evra-hoje', horario: '09:30', status: 'pendente' }],
        historico: [
            { id: 'evra-01', data: '2026-09-01', horarioProgramado: '09:30', estado: 'confirmado' }
        ]
    },
    {
        id: 'mirena',
        nome: 'Mirena',
        tipo: 'diu_hormonal',
        intensidadeAlerta: 'leve',
        statusUltimoUso: 'confirmado',
        dataValidade: '2029-03-14',
        validadeRestante: '30 meses restantes'
    }
];
const MACROS_DIARIO = {
    ciclo: 'ciclo_sangramento',
    corpo: 'corpo_sintomas_fisicos',
    emocional: 'emocional',
    energia: 'energia_sono',
    vidaIntima: 'vida_intima_social',
    saude: 'saude_acompanhamento'
};
const CATALOGO_PREVIA = {
    macrocategorias: gruposPermissoes.map(({ id, titulo, permissoes }) => ({
        id: MACROS_DIARIO[id],
        nome: titulo,
        categorias: permissoes.map(({ id: permissao, titulo: nome }) => ({
            id: permissao.split('.')[1],
            nome
        }))
    }))
};
const CENARIOS_CICLO = [
    { id: 'folicular', rotulo: 'Folicular', dia: 9 },
    { id: 'menstrual', rotulo: 'Menstrual', dia: 3 },
    { id: 'ovulatoria', rotulo: 'Ovulatória', dia: 14 },
    { id: 'lutea', rotulo: 'Lútea', dia: 16 },
    { id: 'sem-ciclo', rotulo: 'Sem ciclo' }
];

function criarCicloPrevia({ id, dia }) {
    const hoje = obterHojeLocal();
    if (!dia) return { possuiCiclos: false, dataReferencia: hoje };
    const inicio = adicionarDias(hoje, 1 - dia);
    const data = (diaCiclo) => adicionarDias(inicio, diaCiclo - 1);
    const intervalo = (primeiro, ultimo) => ({ inicio: data(primeiro), fim: data(ultimo) });
    return {
        possuiCiclos: true,
        dataReferencia: hoje,
        faseAtual: id,
        diaDoCiclo: dia,
        previsao: {
            confiabilidadeMenstrual: { nivel: 'MEDIA' },
            duracaoCicloEstimada: 28,
            fasesEstimadas: {
                menstrual: intervalo(1, 5),
                folicularPosMenstrual: intervalo(6, 13),
                ovulatoria: { data: data(14) },
                lutea: intervalo(15, 28)
            },
            proximoInicioEstimado: data(29),
            dataOvulacaoEstimada: data(14),
            janelaFertilEstimada: intervalo(9, 15)
        }
    };
}

const CICLOS = [
    {
        id: '5',
        numero: 5,
        periodo: '04 Setembro até hoje',
        diasMenstruais: 4,
        status: 'emAndamento'
    },
    {
        id: '4',
        numero: 4,
        periodo: '07 Agosto até 03 Setembro',
        diasMenstruais: 5,
        duracaoDias: 27,
        status: 'concluido'
    },
    {
        id: '3',
        numero: 3,
        periodo: '08 Julho até 06 Agosto',
        diasMenstruais: 6,
        duracaoDias: 29,
        status: 'incerto'
    }
];

function criarServicoHistoricoPrevia(cenario) {
    let falharNaPrimeiraConsulta = cenario === 'erro';
    const ciclos = cenario === 'vazio' ? [] : CICLOS;
    const resumo = {
        cicloMedioDias: 28,
        menstruacaoMediaDias: 5,
        quantidadeCiclos: ciclos.length
    };

    return {
        async listarPagina({ cursor }) {
            if (falharNaPrimeiraConsulta) {
                falharNaPrimeiraConsulta = false;
                throw new Error('Falha simulada na prévia');
            }

            const temMais = !cursor && ciclos.length > 2;

            return {
                ciclos: cursor ? ciclos.slice(2) : ciclos.slice(0, 2),
                resumo,
                quantidadeCiclos: ciclos.length,
                paginacao: { temMais, proximoCursor: temMais ? '2' : null }
            };
        }
    };
}

const ABAS_CALENDARIO_PREVIA = ['calendario', 'inicio', 'diario'];

function criarServicoCalendarioPrevia(cenario) {
    let falharNaPrimeiraConsulta = cenario === 'erro';
    const hoje = obterHojeLocal();

    return {
        async buscarMes({ mes }) {
            if (falharNaPrimeiraConsulta) {
                falharNaPrimeiraConsulta = false;
                throw new Error('Falha simulada na prévia');
            }

            const possuiCiclos = cenario !== 'vazio';
            const permitePrevisoes = cenario !== 'historico';
            const previsto = mes > hoje.slice(0, 7);
            const data = (dia) => `${mes}-${String(dia).padStart(2, '0')}`;
            const intervalo = (inicio, fim) => ({ inicio: data(inicio), fim: data(fim) });
            const diasMenstruacao = possuiCiclos
                ? [4, 5, 6, 7, 8].map(data).filter((dia) => dia <= hoje)
                : [];
            const previsao =
                permitePrevisoes && possuiCiclos
                    ? {
                          periodos: [
                              {
                                  previsto,
                                  faseMenstrual: intervalo(4, 8),
                                  faseFolicular: intervalo(9, 17),
                                  ovulacao: data(18),
                                  janelaFertil: intervalo(13, 19),
                                  faseLutea: intervalo(19, 28)
                              }
                          ]
                      }
                    : null;

            return { mes, possuiCiclos, diasMenstruacao, permitePrevisoes, previsao };
        }
    };
}

const REGISTROS_DIARIO = [
    {
        id: 1,
        data: '2026-11-04',
        fase: 'menstrual',
        diaCiclo: 1,
        principais: [
            {
                categoriaId: 'banheiro',
                valor: 'Intestino',
                macrocategoriaId: 'corpo_sintomas_fisicos'
            },
            {
                categoriaId: 'sangramento_escape',
                valor: 'Sangramento de Escape',
                macrocategoriaId: 'ciclo_sangramento'
            },
            { categoriaId: 'tempo_sono', valor: 'Tempo de Sono', macrocategoriaId: 'energia_sono' }
        ],
        maisQuantidade: 2
    },
    {
        id: 2,
        data: '2026-10-28',
        fase: 'lutea',
        diaCiclo: 21,
        principais: [
            { categoriaId: 'pele', valor: 'Pele', macrocategoriaId: 'corpo_sintomas_fisicos' },
            {
                categoriaId: 'sintomas_pre_menstruais',
                valor: 'Sintomas pré-menstruais',
                macrocategoriaId: 'emocional'
            },
            {
                categoriaId: 'vida_social',
                valor: 'Vida social',
                macrocategoriaId: 'vida_intima_social'
            }
        ],
        maisQuantidade: 2,
        trechoAnotacao: 'Hoje tirei um tempo para descansar.'
    }
];

const DETALHES_DIARIO = {
    1: {
        ciclo: { dia: 1, numero: 4 },
        categorias: [
            {
                id: 'banheiro',
                nome: 'Intestino',
                macrocategoria: 'Corpo e Sintomas Físicos',
                opcoes: [{ grupo: 'intestino', nome: 'Dificuldade para evacuar' }]
            },
            {
                id: 'sangramento_escape',
                nome: 'Sangramento de escape',
                macrocategoria: 'Ciclo e Sangramento',
                opcoes: [
                    { grupo: 'cor', nome: 'Vermelho escuro' },
                    { grupo: 'intensidade', nome: 'Moderado' }
                ]
            },
            {
                id: 'tempo_sono',
                nome: 'Tempo de sono',
                macrocategoria: 'Energia e Sono',
                duracaoMinutos: 740
            },
            {
                id: 'atividade_sexual',
                nome: 'Atividade sexual (com parceiro/a)',
                macrocategoria: 'Vida Íntima e Social',
                opcoes: [
                    { grupo: 'tipo', nome: 'Penetração vaginal' },
                    { grupo: 'contracepcao', nome: 'Preservativo externo' },
                    { grupo: 'contracepcao', nome: 'Lubrificante' }
                ]
            },
            {
                id: 'desejo_libido',
                nome: 'Desejo/Libido',
                macrocategoria: 'Vida Íntima e Social',
                opcoes: [{ grupo: 'resposta_sexual', nome: 'Orgasmo' }]
            }
        ]
    },
    2: {
        ciclo: { dia: 21, numero: 3 },
        categorias: [
            {
                id: 'pele',
                nome: 'Pele',
                macrocategoria: 'Corpo e Sintomas Físicos',
                opcoes: [{ grupo: 'caracteristicas', nome: 'Espinhas' }]
            },
            {
                id: 'sintomas_pre_menstruais',
                nome: 'Sintomas pré-menstruais',
                macrocategoria: 'Emocional',
                opcoes: [
                    { grupo: 'sintomas', nome: 'Sensibilidade emocional' },
                    { grupo: 'sintomas', nome: 'Oscilações de humor' }
                ]
            },
            {
                id: 'vida_social',
                nome: 'Vida social',
                macrocategoria: 'Vida Íntima e Social',
                opcoes: [
                    { grupo: 'relacionamentos', nome: 'Aproximação' },
                    { grupo: 'relacionamentos', nome: 'Saudade' }
                ]
            },
            {
                id: 'atividade_sexual',
                nome: 'Atividade sexual (com parceiro/a)',
                macrocategoria: 'Vida Íntima e Social',
                opcoes: [
                    { grupo: 'tipo', nome: 'Sexo oral' },
                    { grupo: 'tipo', nome: 'Fricção entre corpos' }
                ]
            },
            {
                id: 'desejo_libido',
                nome: 'Desejo/Libido',
                macrocategoria: 'Vida Íntima e Social',
                opcoes: [
                    { grupo: 'desejo', nome: 'Desejo espontâneo' },
                    { grupo: 'desejo', nome: 'Fantasias' }
                ]
            },
            {
                id: 'anotacao_livre',
                nome: 'Anotação do dia',
                macrocategoria: 'Saúde e Acompanhamento',
                texto: 'Hoje tirei um tempo para descansar. Pela manhã, me senti mais cansada e decidi respeitar o meu ritmo. À tarde, fiz uma caminhada leve e terminei o dia mais tranquila.'
            }
        ]
    }
};

const SERVICO_DIARIO_PREVIA = {
    buscarCatalogo: async () => CATALOGO_PREVIA,
    buscarResumo: async () => ({
        fase: 'folicular',
        diasRegistrados: 4,
        informacoesSuficientes: true,
        destaques: [
            { categoriaId: 'energia', valor: 'Aumento de energia' },
            { categoriaId: 'secrecao_corrimento', grupo: 'cor', valor: 'Clara de ovo' },
            { categoriaId: 'sintomas_emocionais', valor: 'Motivado' }
        ]
    }),
    buscarDetalhe: async (id) => ({
        ...REGISTROS_DIARIO.find((registro) => registro.id === id),
        ...DETALHES_DIARIO[id]
    }),
    async listarHistorico({ filtros }) {
        const { dataInicio, dataFim, categorias, fases } = normalizarFiltrosDiario(filtros);
        const itens = REGISTROS_DIARIO.filter(
            ({ id, data, fase }) =>
                (!dataInicio || data >= dataInicio) &&
                (!dataFim || data <= dataFim) &&
                (!fases.length || fases.includes(fase)) &&
                (!categorias.length ||
                    DETALHES_DIARIO[id].categorias.some(({ id }) => categorias.includes(id)))
        );
        return { itens, proximoCursor: null };
    }
};

function ConteudoPrevia() {
    const [tela, setTela] = useState('inicio');
    const [servicoCalendario, setServicoCalendario] = useState(null);
    const [servicoHistorico, setServicoHistorico] = useState(null);
    const [cenario, setCenario] = useState(CENARIOS_CICLO[0]);
    const tema = useTheme();
    const permissoes = PERMISSOES_DEMONSTRACAO;
    const aviso = (
        <Text style={[estilos.aviso, { color: tema.cores.interface.textoSecundario }]}>
            Prévia HU-032 · Dados fictícios · {permissoes.length} permissões simuladas
        </Text>
    );

    function abrirHistorico(cenarioHistorico) {
        setServicoHistorico(criarServicoHistoricoPrevia(cenarioHistorico));
        setTela('historico');
    }

    function abrirCalendario(cenarioCalendario) {
        setServicoCalendario(criarServicoCalendarioPrevia(cenarioCalendario));
        setTela('calendario');
    }

    if (tela === 'trocarContato' || tela === 'acessoRevogado') {
        return <SharedNavigationPreview revogado={tela === 'acessoRevogado'} />;
    }

    if (tela === 'calendario') {
        return (
            <CalendarScreenContainer
                service={servicoCalendario}
                somenteLeitura
                abasDisponiveis={ABAS_CALENDARIO_PREVIA}
                onSelecionarAba={setTela}
            />
        );
    }

    if (tela === 'diario') {
        return (
            <SharedDiaryScreen
                nomeTitular={NOME}
                permissoes={permissoes}
                service={SERVICO_DIARIO_PREVIA}
                onSelecionarAba={(aba) => {
                    if (aba === 'inicio') setTela('inicio');
                    if (aba === 'calendario') abrirCalendario('preenchido');
                }}
            />
        );
    }

    if (tela === 'historico') {
        return (
            <SharedCycleHistoryScreen
                nomeTitular={NOME}
                service={servicoHistorico}
                onVoltar={() => setTela('inicio')}
            />
        );
    }

    if (tela === 'anticoncepcionais') {
        return (
            <ContraceptiveTrackingScreen
                somenteLeitura
                anticoncepcionais={ANTICONCEPCIONAIS_PREVIA}
                aoVoltar={() => setTela('inicio')}
            />
        );
    }

    return (
        <SharedHomeScreen
            key={cenario.id}
            nomeTitular={NOME}
            permissoes={permissoes}
            ciclo={criarCicloPrevia(cenario)}
            status="disponivel"
            onSelecionarAba={(aba) => {
                if (aba === 'ciclos') abrirHistorico('preenchido');
                if (aba === 'calendario') abrirCalendario('preenchido');
                if (aba === 'diario' || aba === 'anticoncepcionais') setTela(aba);
                if (aba === 'membros') setTela('trocarContato');
            }}
            ferramentasPrevia={
                <View style={[estilos.inset, estilos.cenarios]}>
                    {aviso}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[estilos.inset, estilos.cenarios]}
                    >
                        {CENARIOS_CICLO.map((opcao) => {
                            const selecionado = opcao.id === cenario.id;
                            const {
                                destaque,
                                superficie,
                                borda,
                                textoSobreDestaque,
                                textoPrincipal
                            } = tema.cores.interface;
                            return (
                                <Pressable
                                    key={opcao.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Prévia da arte: ${opcao.rotulo}`}
                                    accessibilityState={{ selected: selecionado }}
                                    onPress={() => setCenario(opcao)}
                                    style={[
                                        estilos.cenario,
                                        {
                                            borderColor: borda,
                                            backgroundColor: selecionado ? destaque : superficie
                                        }
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color: selecionado ? textoSobreDestaque : textoPrincipal
                                        }}
                                    >
                                        {opcao.rotulo}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                    <View style={[estilos.inset, estilos.cenarios]}>
                        <ButtonScreen
                            texto="Testar troca de pessoa"
                            aoPressionar={() => setTela('trocarContato')}
                        />
                        <ButtonScreen
                            texto="Testar acesso revogado"
                            aoPressionar={() => setTela('acessoRevogado')}
                        />
                    </View>
                    <ButtonScreen
                        texto="Histórico vazio"
                        aoPressionar={() => abrirHistorico('vazio')}
                    />
                    <ButtonScreen
                        texto="Erro no histórico"
                        aoPressionar={() => abrirHistorico('erro')}
                    />
                    <ButtonScreen
                        texto="Ver Calendário"
                        aoPressionar={() => abrirCalendario('preenchido')}
                    />
                    <ButtonScreen
                        texto="Calendário sem previsões"
                        aoPressionar={() => abrirCalendario('historico')}
                    />
                    <ButtonScreen
                        texto="Calendário vazio"
                        aoPressionar={() => abrirCalendario('vazio')}
                    />
                    <ButtonScreen
                        texto="Erro no calendário"
                        aoPressionar={() => abrirCalendario('erro')}
                    />
                    <ButtonScreen texto="Ver Diário" aoPressionar={() => setTela('diario')} />
                </View>
            }
        />
    );
}

function SharedSupportPreview() {
    const [fontes, erroFontes] = useFonts({
        DMSans_400Regular,
        DMSans_500Medium,
        DMSans_600SemiBold,
        DMSans_700Bold
    });

    return (
        <AppThemeRoot>
            {fontes || erroFontes ? <ConteudoPrevia /> : <ActivityIndicator />}
        </AppThemeRoot>
    );
}

const estilos = StyleSheet.create({
    aviso: { textAlign: 'center', paddingHorizontal: 16 },
    inset: { paddingHorizontal: 16 },
    cenarios: { gap: 8 },
    cenario: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 }
});

export { SharedSupportPreview };
