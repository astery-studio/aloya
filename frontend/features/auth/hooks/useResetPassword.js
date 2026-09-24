//Controla a criação e a confirmação da nova senha no fluxo de recuperação de acesso
import { useCallback, useEffect, useRef, useState } from 'react'

const tamanhoMinimo = 8
const tamanhoMaximoEmBytes = 72
const mensagemErroPadrao = 'Não foi possível redefinir a senha.'

function contarBytesUtf8(texto) {
    let total = 0

    for (const caractere of texto) {
        const codigo = caractere.codePointAt(0)

        if (codigo <= 0x7F) {
            total += 1
        } else if (codigo <= 0x7FF) {
            total += 2
        } else if (codigo <= 0xFFFF) {
            total += 3
        } else {
            total += 4
        }
    }

    return total
}

function validarSenhas(senha, confirmacao) {
    if (!senha || !confirmacao) {
        return {
            valido: false,
            mensagem: 'Preencha e confirme a nova senha.'
        }
    }

    if ([...senha].length < tamanhoMinimo) {
        return {
            valido: false,
            mensagem: `A senha deve possuir pelo menos ${tamanhoMinimo} caracteres.`
        }
    }

    if (contarBytesUtf8(senha) > tamanhoMaximoEmBytes) {
        return {
            valido: false,
            mensagem: 'A senha ultrapassa o tamanho máximo permitido.'
        }
    }

    if (senha !== confirmacao) {
        return {
            valido: false,
            mensagem: 'A confirmação deve ser igual à nova senha.'
        }
    }

    return {
        valido: true,
        mensagem: null
    }
}

function useResetPassword({redefinirSenha, token}) {
    const [senha, setSenha] = useState('')
    const [confirmacao, setConfirmacao] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState(null)
    const [sucesso, setSucesso] = useState(false)
    const montado = useRef(true)
    const operacaoAtual = useRef(null)
    const validacao = validarSenhas(senha, confirmacao)

    useEffect(() => {
        montado.current = true

        return () => {
            montado.current = false
        }
    }, [])

    const alterarSenha = useCallback(valor => {
        setSenha(valor)
        setErro(null)
        setSucesso(false)
    }, [])

    const alterarConfirmacao = useCallback(valor => {
        setConfirmacao(valor)
        setErro(null)
        setSucesso(false)
    }, [])

    const limparErro = useCallback(() => {
        setErro(null)
    }, [])

    const enviar = useCallback(() => {
        if (operacaoAtual.current) {
            return operacaoAtual.current
        }

        const resultadoValidacao = validarSenhas(senha, confirmacao)
        const tokenSeguro = typeof token === 'string' ? token.trim() : ''

        if (!resultadoValidacao.valido) {
            setErro(resultadoValidacao.mensagem)
            return Promise.resolve(null)
        }

        if (!tokenSeguro || typeof redefinirSenha !== 'function') {
            setErro(mensagemErroPadrao)
            return Promise.resolve(null)
        }

        const operacao = (async () => {
            setCarregando(true)
            setErro(null)

            try {
                const resultado = await redefinirSenha({
                    token: tokenSeguro,
                    senha
                })

                if (montado.current) {
                    setSucesso(true)
                }

                return resultado
            } catch (falha) {
                if (montado.current) {
                    setErro(falha?.mensagemUsuario || mensagemErroPadrao)
                }

                return null
            } finally {
                operacaoAtual.current = null

                if (montado.current) {
                    setCarregando(false)
                }
            }
        })()

        operacaoAtual.current = operacao
        return operacao
    }, [confirmacao, redefinirSenha, senha, token])

    return {senha, setSenha: alterarSenha, confirmacao, setConfirmacao: alterarConfirmacao, valido: validacao.valido, carregando, erro, sucesso, enviar, limparErro}
}

export { contarBytesUtf8, useResetPassword, validarSenhas }