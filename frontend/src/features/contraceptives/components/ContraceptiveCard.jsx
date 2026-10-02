//Mostra um anticoncepcional da listagem e abre sua edição quando uma ação é fornecida.
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { obterFrequencia, obterTipo } from '../constants/contraceptiveOptions';
import { ContraceptiveAlert } from './ContraceptiveAlert';
import { ScheduleList } from './ScheduleList';
import { estilos } from './contraceptives.styles';

//Recebe um anticoncepcional e uma ação opcional e retorna um card acessível.
function ConteudoContraceptiveCard({
    anticoncepcional,
    onEditar
}) {
    const tipo = obterTipo(anticoncepcional.tipo)?.label ?? anticoncepcional.tipo;
    const programacao = anticoncepcional.programacao;
    const frequencia = programacao
        ? obterFrequencia(
            anticoncepcional.tipo,
            programacao.frequenciaId
        )?.label
        : null;

    const editavel = typeof onEditar === 'function';

    //Encaminha para a edição somente quando uma ação válida foi fornecida.
    function editar() {
        if (editavel) onEditar(anticoncepcional);
    }

    return (
        <Pressable
            onPress={editar}
            disabled={!editavel}
            accessibilityRole="button"
            accessibilityLabel={`${anticoncepcional.nome}, ${tipo}. Editar anticoncepcional`}
            accessibilityHint={editavel
                ? 'Abre o formulário com os dados atuais'
                : undefined}
            accessibilityState={{
                disabled: !editavel
            }}
            style={({ pressed }) => [
                estilos.card,
                pressed && editavel && estilos.cardPressionado
            ]}
        >
            <View style={estilos.cabecalhoCard}>
                <View style={estilos.titulosCard}>
                    <Text style={estilos.nome}>
                        {anticoncepcional.nome}
                    </Text>

                    <Text style={estilos.textoSecundario}>
                        {tipo}
                    </Text>
                </View>

                <ContraceptiveAlert
                    intensidade={anticoncepcional.intensidadeAlerta}
                />
            </View>

            {frequencia ? (
                <Text style={estilos.frequencia}>
                    {frequencia}
                </Text>
            ) : null}

            {programacao ? (
                <ScheduleList
                    horarios={programacao.horarios}
                />
            ) : (
                <Text style={estilos.frequencia}>
                    Validade: {anticoncepcional.dataValidade}
                </Text>
            )}

            {programacao?.horarios?.[0] ? (
                <Text style={estilos.proximo}>
                    Próximo uso previsto: {programacao.horarios[0]}
                </Text>
            ) : null}
        </Pressable>
    );
}

//Memoização evita renderizar novamente um card quando suas propriedades não mudaram.
const ContraceptiveCard = memo(ConteudoContraceptiveCard);

export { ContraceptiveCard };