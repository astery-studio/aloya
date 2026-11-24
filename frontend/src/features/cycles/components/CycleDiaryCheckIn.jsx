import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { useDiaryCatalog } from '../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../diary/hooks/useDiaryEntryForm';
import { useDiaryOverview } from '../../diary/hooks/useDiaryOverview';
import { obterHojeDiario } from '../../diary/utils/diaryDate';
import { prepararFormularioDiario } from '../../diary/utils/diaryForm';
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
    const [saved, setSaved] = useState(false);
    const catalog = useDiaryCatalog({
        ativo: Boolean(service),
        service,
        onSessaoExpirada: onSessionExpired
    });
    const overview = useDiaryOverview({ fase, service, onSessaoExpirada: onSessionExpired });
    const form = useDiaryEntryForm({
        ativo: Boolean(catalog.catalogo),
        catalogo: catalog.catalogo,
        service,
        dataInicial: date,
        onCriado: () => setSaved(true),
        onSessaoExpirada: onSessionExpired
    });
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
                    {catalog.carregando ? <Text>Carregando seu check-in...</Text> : null}
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
                    {catalog.catalogo && !saved ? (
                        <>
                            <CompactDiaryOptions
                                catalogo={catalog.catalogo}
                                fase={fase}
                                destaques={overview.resumo?.sugestoesCheckIn ?? []}
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
                                desativado={!valid}
                                estilo={estilos.botao}
                                estiloTexto={estilos.textoBotao}
                            />
                        </>
                    ) : null}
                </View>
            </View>
        </View>
    );
}

export { CycleDiaryCheckIn };
