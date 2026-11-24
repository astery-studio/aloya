import { useState } from 'react';
import { View } from 'react-native';
import { CycleEducationSection } from '../CycleEducationSection';
import { NoCycleStartSection } from './NoCycleStartSection';
import { NoCycleTrackingSection } from './NoCycleTrackingSection';

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
        <View style={{ paddingTop: 24, paddingBottom: 40 }}>
            <NoCycleStartSection {...props} />
            <CycleEducationSection />
            <NoCycleTrackingSection
                idsExpandidos={idsExpandidos}
                aoAlternar={alternar}
                aoAbrirAnticoncepcional={props.aoAbrirAnticoncepcional}
            />
        </View>
    );
}

export { NoCycleHomeContent };
