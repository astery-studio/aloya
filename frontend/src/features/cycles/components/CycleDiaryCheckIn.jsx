import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen/ButtonScreen';
import { DiaryMacrocategoryList } from '../../diary/components/DiaryMacrocategoryList/DiaryMacrocategoryList';
import { useDiaryCatalog } from '../../diary/hooks/useDiaryCatalog';
import { useDiaryEntryForm } from '../../diary/hooks/useDiaryEntryForm';
import { obterHojeDiario } from '../../diary/utils/diaryDate';
import { listarMacrocategoriasAtivas, prepararFormularioDiario } from '../../diary/utils/diaryForm';

function CycleDiaryCheckIn({ date, service, onOpenDiary, onSessionExpired }) {
    const [saved, setSaved] = useState(false);
    const catalog = useDiaryCatalog({
        ativo: Boolean(service),
        service,
        onSessaoExpirada: onSessionExpired
    });
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
        <View style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 12 }}>
            <Text accessibilityRole="header" style={{ fontFamily: 'DMSans_700Bold', fontSize: 20 }}>
                Como você está hoje?
            </Text>
            {catalog.carregando ? <Text>Carregando seu check-in...</Text> : null}
            {catalog.erro ? (
                <>
                    <Text accessibilityRole="alert">{catalog.erro}</Text>
                    <ButtonScreen texto="Tentar novamente" aoPressionar={catalog.recarregar} />
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
                    <DiaryMacrocategoryList
                        macrocategorias={listarMacrocategoriasAtivas(catalog.catalogo)}
                        valores={form.valores}
                        erros={form.erros}
                        aoAlterar={form.alterarValor}
                        desabilitado={form.salvando}
                    />
                    {form.erroSalvamento ? (
                        <Text accessibilityRole="alert">{form.erroSalvamento}</Text>
                    ) : null}
                    <ButtonScreen
                        texto="Salvar check-in"
                        aoPressionar={form.salvar}
                        carregando={form.salvando}
                        desativado={!valid}
                    />
                </>
            ) : null}
        </View>
    );
}

export { CycleDiaryCheckIn };
