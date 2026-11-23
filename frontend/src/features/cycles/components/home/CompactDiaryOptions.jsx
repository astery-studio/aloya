import { Text, View } from 'react-native';
import { ButtonSelection } from '../../../../shared/components/common/Button/ButtonSelection/ButtonSelection';
import { listarMacrocategoriasAtivas } from '../../../diary/utils/diaryForm';
import { alternarOpcao } from '../../../diary/utils/diaryFormValue';

function CompactDiaryOptions({ catalogo, valores, aoAlterar, desabilitado }) {
    const grupos = listarMacrocategoriasAtivas(catalogo)
        .flatMap((macro) => macro.categorias)
        .filter((categoria) => categoria.tipoValor === 'opcoes' && categoria.opcoes?.length)
        .slice(0, 3);

    return (
        <View style={{ gap: 12 }}>
            {grupos.map((categoria) => (
                <View key={categoria.id} style={{ gap: 6 }}>
                    <Text style={{ textAlign: 'center', fontSize: 9 }}>
                        {(categoria.nomeCompacto ?? categoria.nome).toUpperCase()}
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: 6
                        }}
                    >
                        {categoria.opcoes.slice(0, 4).map((opcao) => {
                            const selecionada = (valores[categoria.id] ?? []).includes(opcao.id);
                            return (
                                <ButtonSelection
                                    key={opcao.id}
                                    label={opcao.nome}
                                    selected={selecionada}
                                    desabilitado={desabilitado}
                                    variante="compacto"
                                    cor="#2C4C3B"
                                    fundo="rgba(44, 76, 59, 0.1)"
                                    onPress={() =>
                                        aoAlterar(
                                            categoria.id,
                                            alternarOpcao(valores[categoria.id], opcao.id)
                                        )
                                    }
                                />
                            );
                        })}
                    </View>
                </View>
            ))}
        </View>
    );
}

export { CompactDiaryOptions };
