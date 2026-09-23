import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

function useKeyboard() {
    const [visivel, setVisivel] = useState(false);
    const [altura, setAltura] = useState(0);

    useEffect(() => {
        const aoMostrar = Keyboard.addListener('keyboardDidShow', (evento) => {
            setVisivel(true);
            setAltura(evento.endCoordinates.height);
        });
        const aoOcultar = Keyboard.addListener('keyboardDidHide', () => {
            setVisivel(false);
            setAltura(0);
        });

        return () => {
            aoMostrar.remove();
            aoOcultar.remove();
        };
    }, []);

    return { visivel, altura, fecharTeclado: Keyboard.dismiss };
}

export { useKeyboard };
/**
 * Hook que acompanha visibilidade e altura do teclado e remove seus listeners ao desmontar.
 */
