import DurationStep from './DurationStep';

export default function CycleLengthStep(props) {
    return (
        <DurationStep
            {...props}
            etapa={3}
            titulo="Normalmente quanto tempo dura seu ciclo?"
        />
    );
}
/**
 * Configura DurationStep para coletar a duração habitual do ciclo.
 */
