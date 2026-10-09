import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { CheckIcon, ClockIcon } from 'phosphor-react-native';
import { estilosAcompanhamento } from './contraceptiveTracking.styles';

function DailyUseControl({ uso, aoAlternar }) {
    const [confirmado, setConfirmado] = useState(uso.status === 'confirmado');
    const [salvando, setSalvando] = useState(false);
    const montado = useRef(true);

    useEffect(() => () => {
        montado.current = false;
    }, []);

    async function alternar() {
        if (salvando || typeof aoAlternar !== 'function') return;

        const anterior = confirmado;
        const proximo = !anterior;
        setConfirmado(proximo);
        setSalvando(true);

        try {
            await aoAlternar(uso, proximo);
        } catch {
            if (montado.current) setConfirmado(anterior);
        } finally {
            if (montado.current) setSalvando(false);
        }
    }

    const descricao = confirmado
        ? `${uso.horario}, uso confirmado. Toque para desmarcar.`
        : `${uso.horario}, uso pendente. Toque para confirmar.`;

    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel={descricao}
            accessibilityState={{ checked: confirmado, busy: salvando }}
            disabled={salvando || typeof aoAlternar !== 'function'}
            onPress={alternar}
            style={({ pressed }) => [
                estilosAcompanhamento.uso,
                confirmado && estilosAcompanhamento.usoConfirmado,
                pressed && estilosAcompanhamento.pressionado
            ]}
        >
            <View style={[estilosAcompanhamento.iconeUso, confirmado && estilosAcompanhamento.iconeUsoConfirmado]}>
                {salvando
                    ? <ActivityIndicator size="small" color={confirmado ? '#FFFFFF' : '#5C5C59'} />
                    : confirmado
                        ? <CheckIcon size={16} color="#FFFFFF" weight="bold" />
                        : <ClockIcon size={16} color="#5C5C59" />}
            </View>
            <View style={estilosAcompanhamento.textoUso}>
                <Text style={estilosAcompanhamento.horarioUso}>{uso.horario}</Text>
                <Text style={estilosAcompanhamento.estadoUso}>{confirmado ? 'Confirmado' : 'Pendente de uso'}</Text>
            </View>
        </Pressable>
    );
}

export { DailyUseControl };
