//Mostra a ação principal de uma tela ou formulário.
import Button from './Button';

export default function ButtonScreen({texto, aoPressionar, variante = 'laranja', desativado = false, carregando = false, icone, posicaoIcone = 'esquerda', rotuloAcessibilidade, estilo}) {
    const semAcao = typeof aoPressionar !== 'function';
    const estaDesativado = desativado || semAcao;

    return (
        <Button
            texto={texto}
            aoPressionar={aoPressionar}
            variante={variante}
            tamanho="grande"
            largura="100%"
            desativado={estaDesativado}
            carregando={carregando}
            icone={icone}
            posicaoIcone={posicaoIcone}
            rotuloAcessibilidade={rotuloAcessibilidade}
            estilo={estilo}
        />
    );
}