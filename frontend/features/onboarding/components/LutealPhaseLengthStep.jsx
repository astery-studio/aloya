import DurationStep from './DurationStep';

export default function LutealPhaseLengthStep(props) {
    return (
        <DurationStep
            {...props}
            etapa={5}
            titulo="Normalmente quanto tempo dura sua fase lútea?"
        />
    );
}
/**
 * Configura DurationStep para coletar a duração da fase lútea.
 */
