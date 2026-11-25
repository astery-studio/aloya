import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CycleEducationSection } from '../CycleEducationSection';
import { NoCycleDiarySection } from './NoCycleDiarySection';
import { NoCycleStartSection } from './NoCycleStartSection';
import { NoCycleTrackingSection } from './NoCycleTrackingSection';

const estilos = StyleSheet.create({
    conteudo: { flexShrink: 0, paddingTop: 24, paddingBottom: 16 }
});

function NoCycleHomeContent(props) {
    const [idsExpandidos, setIdsExpandidos] = useState(new Set());
    const alternar = (id) =>
        setIdsExpandidos((atuais) => {
            const proximos = new Set(atuais);
            if (proximos.has(id)) proximos.delete(id);
            else proximos.add(id);
            return proximos;
        });
    return (
        <View style={estilos.conteudo}>
            <NoCycleStartSection {...props} />
            <CycleEducationSection />
            <NoCycleTrackingSection
                idsExpandidos={idsExpandidos}
                aoAlternar={alternar}
                aoAbrirAnticoncepcional={props.aoAbrirAnticoncepcional}
            />
            <NoCycleDiarySection
                aoAbrirDiario={props.aoAbrirDiario}
                aoAbrirReflexao={props.aoAbrirReflexao}
            />
        </View>
    );
}

export { NoCycleHomeContent };
