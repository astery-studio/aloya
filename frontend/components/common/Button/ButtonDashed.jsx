import { Plus } from 'phosphor-react-native';

import Button from './Button';

export default function ButtonDashed({
    texto,
    aoPressionar,
    desativado = false,
    carregando = false,
    rotuloAcessibilidade,
    estilo
}) {
    return (
        <Button
            texto={texto}
            aoPressionar={aoPressionar}
            variante="tracejado"
            tamanho="compacto"
            largura="100%"
            desativado={desativado}
            carregando={carregando}
            icone={Plus}
            rotuloAcessibilidade={rotuloAcessibilidade}
            estilo={estilo}
        />
    );
}
/**
 * Especializa o botão base para ações de inclusão com borda tracejada e ícone.
 */
