import Button from '../Button/Button';

const variantesPermitidas = [
    'verde',
    'branco',
    'preto',
    'vermelho'
];

export default function ButtonPopup({
    texto,
    aoPressionar,
    variante = 'verde',
    desativado = false,
    carregando = false,
    rotuloAcessibilidade,
    estilo
}) {
    if (!variantesPermitidas.includes(variante)) {
        throw new Error(
            `Variante de ButtonPopup inválida: ${variante}`
        );
    }

    return (
        <Button
            texto={texto}
            aoPressionar={aoPressionar}
            variante={variante}
            tamanho="compacto"
            largura={294}
            desativado={desativado}
            carregando={carregando}
            rotuloAcessibilidade={rotuloAcessibilidade}
            estilo={estilo}
        />
    );
}