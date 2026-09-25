/**
 * Configura DurationStep para coletar a duração habitual da menstruação.
 */
import DurationStep from '../DurationStep/DurationStep';

export default function MenstruationLengthStep(props) {
    return (
        <DurationStep
            {...props}
            etapa={4}
            titulo="Normalmente quanto tempo dura sua menstruação?"
        />
    );
}
