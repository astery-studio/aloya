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
import { ContraceptiveUsageCard } from '../../contraceptives/components/ContraceptiveUsageCard';
import { CycleEducationSection } from '../../cycles/components/CycleEducationSection';
import { DiaryActiveFilters } from '../../diary/components/DiaryActiveFilters/DiaryActiveFilters';
import { DiaryFiltersSheet } from '../../diary/components/DiaryFiltersSheet/DiaryFiltersSheet';
import { DiaryTimelineDivider } from '../../diary/components/DiaryHistoryHeader/DiaryHistoryHeader';
import { DiaryOverviewCard } from '../../diary/components/DiaryOverviewCard/DiaryOverviewCard';
import { DiaryRecordDetailsModal } from '../../diary/components/DiaryRecordDetailsModal/DiaryRecordDetailsModal';
import { DiaryTimeline } from '../../diary/components/DiaryTimeline/DiaryTimeline';
import { criarEstilos as criarEstilosDiario } from '../../diary/screens/DiaryScreen.styles';
import {
    FILTROS_DIARIO_VAZIOS,
    normalizarFiltrosDiario,
    possuiFiltrosDiario
} from '../../diary/utils/diaryFilters';
import { obterRegistrosAdjacentes } from '../../diary/utils/diaryRecordNavigation';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { IconButton } from '../../../shared/components/common/IconButton/IconButton';
import { FunnelIcon } from '../../../shared/components/icons/AppIcons';
import { useTheme } from '../../../shared/hooks/useTheme';
import { MainLayout } from '../../../shared/layouts/MainLayout/MainLayout';
import { SharedPermissionGate } from '../components/SharedPermissionGate/SharedPermissionGate';
import { SupportedCycleHero } from '../components/SupportedCycleHero/SupportedCycleHero';
import { SupportedPersonIndicator } from '../components/SupportedPersonIndicator/SupportedPersonIndicator';
import { gruposPermissoes, permissoesGerais } from '../constants/permissionOptions';
import { SharedCycleHistoryScreen } from '../screens/SharedCycleHistoryScreen/SharedCycleHistoryScreen';

const NOME = 'Júlia';
const PERMISSOES_DEMONSTRACAO = [
    ...permissoesGerais,
    ...gruposPermissoes.flatMap(({ permissoes }) => permissoes)
].map(({ id }) => id);
const TITULOS = {
    inicio: 'Início',
    diario: 'Diário',
    anticoncepcionais: 'Anticoncepcionais'
};
const ANTICONCEPCIONAIS_PREVIA = [
    {
        id: 'yaz',
        nome: 'Yaz',
        tipo: 'pilula',
        horarios: ['08:00', '20:00'],
        statusUltimoUso: 'pendente',
        usosHoje: [{ id: 'yaz-manha', horario: '08:00', atrasado: true, status: 'pendente' }],
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
        horarios: ['09:30'],
        statusUltimoUso: 'pendente',
        historico: [
            { id: 'evra-01', data: '2026-09-01', horarioProgramado: '09:30', estado: 'confirmado' }
        ]
    },
    {
        id: 'mirena',
        nome: 'Mirena',
        tipo: 'diu_hormonal',
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
const SERVICO_FILTROS_PREVIA = { buscarCatalogo: async () => CATALOGO_PREVIA };
const ROTULOS_CATEGORIAS = Object.fromEntries(
    CATALOGO_PREVIA.macrocategorias.flatMap(({ categorias }) =>
        categorias.map(({ id, nome }) => [id, nome])
    )
);
const CENARIOS_CICLO = [
    { id: 'folicular', rotulo: 'Folicular', dia: 9 },
    { id: 'menstrual', rotulo: 'Menstrual', dia: 3 },
    { id: 'ovulatoria', rotulo: 'Ovulatória', dia: 14 },
    { id: 'lutea', rotulo: 'Lútea', dia: 16 },
    { id: 'sem-ciclo', rotulo: 'Sem ciclo' }
];
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

function DiarioPrevia({ permissoes, aviso, filtroAberto, aoFecharFiltro, aoVoltar }) {
    const tema = useTheme();
    const [registroAberto, setRegistroAberto] = useState(null);
    const [filtros, setFiltros] = useState(FILTROS_DIARIO_VAZIOS);
    const estilosDiario = criarEstilosDiario(tema);
    const filtrosAtivos = possuiFiltrosDiario(filtros);
    const registros = REGISTROS_DIARIO.filter(
        ({ id, data, fase }) =>
            (!filtros.dataInicio || data >= filtros.dataInicio) &&
            (!filtros.dataFim || data <= filtros.dataFim) &&
            (!filtros.fases.length || filtros.fases.includes(fase)) &&
            (!filtros.categorias.length ||
                DETALHES_DIARIO[id].categorias.some((categoria) =>
                    filtros.categorias.includes(categoria.id)
                ))
    );
    const adjacentes = obterRegistrosAdjacentes(registros, registroAberto?.id);
    const detalhe = registroAberto
        ? { ...registroAberto, ...DETALHES_DIARIO[registroAberto.id] }
        : null;

    function removerFiltro(id) {
        const [tipo, valor] = id.split(':');
        if (tipo === 'categoria') {
            setFiltros((atuais) => ({
                ...atuais,
                categorias: atuais.categorias.filter((item) => item !== valor)
            }));
        } else if (tipo === 'fase') {
            setFiltros((atuais) => ({
                ...atuais,
                fases: atuais.fases.filter((item) => item !== valor)
            }));
        } else if (tipo === 'dataInicio' || tipo === 'dataFim') {
            setFiltros((atuais) => ({ ...atuais, [tipo]: null }));
        }
    }

    return (
        <>
            <DiaryTimeline
                registros={registros}
                somenteLeitura
                aoAbrir={setRegistroAberto}
                contentContainerStyle={estilos.inset}
                ListHeaderComponent={
                    <View style={estilos.lista}>
                        {aviso}
                        <Pressable accessibilityRole="button" onPress={aoVoltar}>
                            <Text style={{ color: tema.cores.interface.destaque }}>
                                Voltar à prévia do Início
                            </Text>
                        </Pressable>
                        {filtrosAtivos ? (
                            <DiaryActiveFilters
                                filtros={filtros}
                                rotulosCategorias={ROTULOS_CATEGORIAS}
                                quantidadeResultados={registros.length}
                                aoLimpar={() => setFiltros(FILTROS_DIARIO_VAZIOS)}
                                aoRemover={removerFiltro}
                            />
                        ) : (
                            <DiaryOverviewCard
                                nomeTitular={NOME}
                                fase="folicular"
                                tituloFase="Fase Folicular"
                                descricao="Júlia costuma registrar aumento de energia, secreção clara de ovo e humor motivado."
                                diasRegistrados={4}
                                exibirFase={permissoes.includes('geral.fase_atual')}
                            />
                        )}
                        {filtrosAtivos ? null : <DiaryTimelineDivider estilos={estilosDiario} />}
                        {filtrosAtivos && !registros.length ? (
                            <Text
                                accessibilityLiveRegion="polite"
                                style={estilosDiario.mensagemFiltroVazio}
                            >
                                Nenhum registro encontrado para os filtros aplicados.
                            </Text>
                        ) : null}
                    </View>
                }
            />
            <DiaryFiltersSheet
                visivel={filtroAberto}
                filtros={filtros}
                service={SERVICO_FILTROS_PREVIA}
                categoriasPermitidas={permissoes
                    .filter((id) => !id.startsWith('geral.'))
                    .map((id) => id.split('.')[1])}
                exibirFiltroFases={
                    permissoes.includes('geral.fase_atual') &&
                    permissoes.includes('geral.historico_ciclo')
                }
                onFechar={aoFecharFiltro}
                onAplicar={(aplicados) => {
                    setFiltros(normalizarFiltrosDiario(aplicados));
                    aoFecharFiltro();
                }}
            />
            <DiaryRecordDetailsModal
                visivel={Boolean(detalhe)}
                registro={detalhe}
                nomeTitular={NOME}
                somenteLeitura
                aoAnterior={
                    adjacentes.anterior ? () => setRegistroAberto(adjacentes.anterior) : undefined
                }
                aoProximo={
                    adjacentes.proximo ? () => setRegistroAberto(adjacentes.proximo) : undefined
                }
                aoFechar={() => setRegistroAberto(null)}
            />
        </>
    );
}

function ConteudoPrevia() {
    const [tela, setTela] = useState('inicio');
    const [servicoHistorico, setServicoHistorico] = useState(null);
    const [filtroAberto, setFiltroAberto] = useState(false);
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

    if (tela === 'historico') {
        return (
            <SharedCycleHistoryScreen
                nomeTitular={NOME}
                service={servicoHistorico}
                onVoltar={() => setTela('inicio')}
            />
        );
    }

    return (
        <MainLayout
            titulo={TITULOS[tela]}
            varianteHeader={tela === 'anticoncepcionais' ? 'comVoltar' : 'padrao'}
            onVoltar={tela === 'anticoncepcionais' ? () => setTela('inicio') : undefined}
            acoesHeader={
                tela === 'diario' ? (
                    <IconButton
                        icone={FunnelIcon}
                        variante="redeApoio"
                        corIcone={tema.cores.interface.destaque}
                        rotuloAcessibilidade="Filtrar histórico do Diário"
                        aoPressionar={() => setFiltroAberto(true)}
                    />
                ) : null
            }
            exibirNavegacaoInferior={false}
        >
            {tela === 'diario' ? (
                <DiarioPrevia
                    permissoes={permissoes}
                    aviso={aviso}
                    filtroAberto={filtroAberto}
                    aoFecharFiltro={() => setFiltroAberto(false)}
                    aoVoltar={() => setTela('inicio')}
                />
            ) : (
                <ScrollView contentContainerStyle={estilos.conteudo}>
                    {aviso}
                    {tela === 'inicio' ? (
                        <>
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
                                                    backgroundColor: selecionado
                                                        ? destaque
                                                        : superficie
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={{
                                                    color: selecionado
                                                        ? textoSobreDestaque
                                                        : textoPrincipal
                                                }}
                                            >
                                                {opcao.rotulo}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                            <SupportedPersonIndicator nome={NOME} />
                            <SupportedCycleHero
                                nomeTitular={NOME}
                                fase={cenario.id}
                                possuiDadosCiclo={Boolean(cenario.dia)}
                                diaCiclo={cenario.dia}
                                duracaoCiclo={28}
                                exibirFase={permissoes.includes('geral.fase_atual')}
                            />
                            <SharedPermissionGate
                                permissoes={permissoes}
                                permissao="geral.anticoncepcionais"
                            >
                                <View style={estilos.inset}>
                                    <ButtonScreen
                                        texto="Ver Anticoncepcionais"
                                        variante="verde"
                                        aoPressionar={() => setTela('anticoncepcionais')}
                                    />
                                </View>
                            </SharedPermissionGate>
                            <SharedPermissionGate
                                permissoes={permissoes}
                                permissao="geral.historico_ciclo"
                            >
                                <View style={estilos.inset}>
                                    <ButtonScreen
                                        texto="Ver Histórico de Ciclos"
                                        aoPressionar={() => abrirHistorico('preenchido')}
                                    />
                                    <View style={[estilos.cenarios, estilos.cenariosHistorico]}>
                                        <ButtonScreen
                                            texto="Histórico vazio"
                                            aoPressionar={() => abrirHistorico('vazio')}
                                        />
                                        <ButtonScreen
                                            texto="Erro no histórico"
                                            aoPressionar={() => abrirHistorico('erro')}
                                        />
                                    </View>
                                </View>
                            </SharedPermissionGate>
                            <SharedPermissionGate permissoes={permissoes} permissao="corpo.pele">
                                <View style={estilos.inset}>
                                    <ButtonScreen
                                        texto="Ver Diário"
                                        aoPressionar={() => setTela('diario')}
                                    />
                                </View>
                            </SharedPermissionGate>
                            <SharedPermissionGate permissoes={permissoes} permissao="geral.dicas">
                                <CycleEducationSection perspectiva="contato" />
                            </SharedPermissionGate>
                        </>
                    ) : null}
                    {tela === 'anticoncepcionais' ? (
                        <View style={[estilos.inset, estilos.lista]}>
                            <Text
                                accessibilityRole="header"
                                style={[
                                    estilos.aviso,
                                    { color: tema.cores.interface.textoSecundario }
                                ]}
                            >
                                NÃO USADOS
                            </Text>
                            {ANTICONCEPCIONAIS_PREVIA.filter(
                                (item) => item.statusUltimoUso === 'pendente'
                            ).map((item) => (
                                <ContraceptiveUsageCard
                                    key={item.id}
                                    anticoncepcional={item}
                                    somenteLeitura
                                />
                            ))}
                            <Text
                                accessibilityRole="header"
                                style={[
                                    estilos.aviso,
                                    { color: tema.cores.interface.textoSecundario }
                                ]}
                            >
                                USADOS
                            </Text>
                            {ANTICONCEPCIONAIS_PREVIA.filter(
                                (item) => item.statusUltimoUso !== 'pendente'
                            ).map((item) => (
                                <ContraceptiveUsageCard
                                    key={item.id}
                                    anticoncepcional={item}
                                    somenteLeitura
                                />
                            ))}
                        </View>
                    ) : null}
                </ScrollView>
            )}
        </MainLayout>
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
    conteudo: { gap: 16, paddingBottom: 24 },
    aviso: { textAlign: 'center', paddingHorizontal: 16 },
    inset: { paddingHorizontal: 16 },
    cenarios: { gap: 8 },
    cenariosHistorico: { marginTop: 8 },
    cenario: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
    lista: { gap: 12 }
});

export { SharedSupportPreview };
