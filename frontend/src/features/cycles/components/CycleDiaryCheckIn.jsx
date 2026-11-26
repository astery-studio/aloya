import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useDiaryCatalog } from '../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../diary/hooks/useDiaryEntryForm';
import { useDiaryOverview } from '../../diary/hooks/useDiaryOverview';
import { obterHojeDiario } from '../../diary/utils/diaryDate';
import { criarValoresIniciaisEdicao } from '../../diary/utils/diaryEditForm';
import { prepararFormularioDiario } from '../../diary/utils/diaryForm';
import { useDiaryRecordForDate } from '../hooks/useDiaryRecordForDate';
import { CompactDiaryOptions } from './home/CompactDiaryOptions';
import { estilos } from './CycleDiaryCheckIn.styles';

function CycleDiaryCheckIn({
    date,
    fase,
    service,
    onOpenDiary,
    onSessionExpired,
    corDestaque = '#C85A44'
}) {
    const tema = useTheme();
    const [saved, setSaved] = useState(false);
    const catalog = useDiaryCatalog({
        ativo: Boolean(service),
        service,
        onSessaoExpirada: onSessionExpired
    });
    const overview = useDiaryOverview({ fase, service, onSessaoExpirada: onSessionExpired });
    const existing = useDiaryRecordForDate({ date, service, onSessionExpired });
    const form = useDiaryEntryForm({
        ativo: Boolean(catalog.catalogo),
        catalogo: catalog.catalogo,
        service,
        modo: existing.record ? 'editar' : 'criar',
        dataInicial: date,
        registroInicial: existing.record,
        onCriado: () => setSaved(true),
        onSalvo: () => setSaved(true),
        onSessaoExpirada: onSessionExpired
    });
    const registeredIds = useMemo(
        () =>
            Object.values(criarValoresIniciaisEdicao(existing.record)).flatMap((value) =>
                Array.isArray(value) ? value : []
            ),
        [existing.record]
    );
    useEffect(() => setSaved(false), [date]);
    if (!service) return null;
    const valid = catalog.catalogo
        ? prepararFormularioDiario({
              catalogo: catalog.catalogo,
              valores: form.valores,
              data: form.data,
              hoje: obterHojeDiario()
          }).valido
        : false;

    const salvarDesativado = !valid || Boolean(existing.record && !form.alterado);
    const aplicarVisualDesativado = salvarDesativado && !tema.escuro;

    return (
        <View style={estilos.margem}>
            <View style={estilos.cartao}>
                <Text style={[estilos.rotulo, { color: corDestaque }]}>Check-in gentil</Text>
                <Text accessibilityRole="header" style={estilos.titulo}>
                    Como você está se sentindo hoje?
                </Text>
                <Text style={estilos.descricao}>
                    Escolha quantos itens fizerem sentido para você.
                </Text>
                <View style={estilos.conteudo}>
                    {catalog.carregando || existing.loading ? (
                        <Text>Carregando seu check-in...</Text>
                    ) : null}
                    {catalog.erro ? (
                        <>
                            <Text accessibilityRole="alert">{catalog.erro}</Text>
                            <ButtonScreen
                                texto="Tentar novamente"
                                aoPressionar={catalog.recarregar}
                            />
                        </>
                    ) : null}
                    {saved ? (
                        <>
                            <Text>Check-in registrado no Diário.</Text>
                            <ButtonScreen texto="Adicionar detalhes" aoPressionar={onOpenDiary} />
                        </>
                    ) : null}
                    {catalog.catalogo && !existing.loading && !saved ? (
                        <>
                            <CompactDiaryOptions
                                catalogo={catalog.catalogo}
                                fase={fase}
                                destaques={overview.resumo?.sugestoesCheckIn ?? []}
                                idsExcluidos={registeredIds}
                                valores={form.valores}
                                aoAlterar={form.alterarValor}
                                desabilitado={form.salvando}
                            />
                            {form.erroSalvamento ? (
                                <Text accessibilityRole="alert">{form.erroSalvamento}</Text>
                            ) : null}
                            <ButtonScreen
                                texto="Salvar no Diário"
                                aoPressionar={form.salvar}
                                carregando={form.salvando}
                                desativado={salvarDesativado}
                                estilo={[
                                    estilos.botao,
                                    aplicarVisualDesativado && estilos.botaoDesativado
                                ]}
                                estiloTexto={[
                                    estilos.textoBotao,
                                    aplicarVisualDesativado && estilos.textoBotaoDesativado
                                ]}
                            />
                        </>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

export { CycleDiaryCheckIn };
