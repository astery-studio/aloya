import { Text } from 'react-native';

function DiaryFormErrors({ erros, estilos }) {
    return (
        <>
            {erros.data ? <Text style={estilos.erro}>{erros.data}</Text> : null}
            {erros.conteudo ? <Text style={estilos.erro}>{erros.conteudo}</Text> : null}
        </>
    );
}

export { DiaryFormErrors };
