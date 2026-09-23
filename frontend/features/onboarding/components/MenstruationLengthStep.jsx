import DurationStep from './DurationStep';

export default function MenstruationLengthStep(props) {
    return (
        <DurationStep
            {...props}
            etapa={4}
            titulo="Normalmente quanto tempo dura sua menstruação?"
        />
    );
}
