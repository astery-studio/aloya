//Controla o estado de abertura e fechamento de um modal.
import { useCallback, useState } from 'react'

function useModal(abertoInicialmente = false) {
    const [visivel, setVisivel] = useState(Boolean(abertoInicialmente))

    const abrirModal = useCallback(() => {
        setVisivel(true)
    }, [])

    const fecharModal = useCallback(() => {
        setVisivel(false)
    }, [])

    return {visivel, abrirModal, fecharModal}
}

export { useModal }