/**
 * Configura DurationStep para coletar a duração habitual do ciclo.
 */
import DurationStep from '../DurationStep/DurationStep';

export default function CycleLengthStep(props) {
    return (
        <DurationStep
            {...props}
            etapa={3}
            titulo="Normalmente quanto tempo dura seu ciclo?"
        />
    );
}
