//Testa semanas, interação dos dias e continuidade da janela fértil.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {
    CycleWeek,
    obterTrechosFerteis
} from '../../../../src/features/calendar/components/CycleCalendar/CycleWeek'
import {estilos} from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar.styles'

function criarDia(numero, alteracoes = {}) {
    return {
        dia: numero,
        data: `2026-10-${String(numero).padStart(2, '0')}`,
        tipo: null,
        previsto: false,
        futuro: false,
        registroCicloId: null,
        janelaFertil: false,
        janelaFertilPrevista: false,
        inicioSegmento: false,
        fimSegmento: false,
        ...alteracoes
    }
}

describe('CycleWeek', () => {
    test('mantém exatamente sete posições na semana', async () => {
        const semana = [
            null,
            null,
            criarDia(1),
            criarDia(2),
            criarDia(3),
            criarDia(4),
            criarDia(5)
        ]

        const resultado = await render(<CycleWeek semana={semana} />)

        expect(resultado.toJSON().children).toHaveLength(7)
        expect(screen.getByText('1')).toBeOnTheScreen()
        expect(screen.getByText('5')).toBeOnTheScreen()
    })

    test('cria um único contorno para dias férteis contínuos', async () => {
        const semana = [
            criarDia(1),
            criarDia(2, {janelaFertil: true}),
            criarDia(3, {janelaFertil: true}),
            criarDia(4, {janelaFertil: true}),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ]

        await render(<CycleWeek semana={semana} />)

        const contorno = screen.getByTestId(
            'janela-fertil-2026-10-02-2026-10-04'
        )

        expect(contorno).toHaveStyle({
            left: `${100 / 7}%`,
            width: `${300 / 7}%`
        })

        expect(contorno).toHaveStyle(estilos.janelaFertilAtual)
    })

    test('separa a janela fértil atual da parte futura prevista', async () => {
        const semana = [
            criarDia(1),
            criarDia(2, {janelaFertil: true}),
            criarDia(3, {janelaFertil: true}),
            criarDia(4, {
                janelaFertil: true,
                janelaFertilPrevista: true,
                futuro: true
            }),
            criarDia(5, {
                janelaFertil: true,
                janelaFertilPrevista: true,
                futuro: true
            }),
            criarDia(6),
            criarDia(7)
        ]

        await render(<CycleWeek semana={semana} />)

        expect(
            screen.getByTestId('janela-fertil-2026-10-02-2026-10-03')
        ).toHaveStyle(estilos.janelaFertilAtual)

        expect(
            screen.getByTestId('janela-fertil-2026-10-04-2026-10-05')
        ).toHaveStyle(estilos.janelaFertilPrevista)
    })

    test('não desenha contorno quando a semana não possui janela fértil', async () => {
        const semana = Array.from(
            {length: 7},
            (_, indice) => criarDia(indice + 1)
        )

        await render(<CycleWeek semana={semana} />)

        expect(screen.queryByTestId(/janela-fertil-/)).toBeNull()
    })

    test('encaminha a interação de um dia menstrual registrado', async () => {
        const aoPressionarDia = jest.fn()
        const semana = [
            criarDia(1, {
                tipo: 'menstruacao',
                registroCicloId: 18,
                inicioSegmento: true,
                fimSegmento: true
            }),
            criarDia(2),
            criarDia(3),
            criarDia(4),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ]

        await render(
            <CycleWeek
                semana={semana}
                aoPressionarDia={aoPressionarDia}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Dia 1 de outubro de 2026, menstruação registrada'
            })
        )

        expect(aoPressionarDia).toHaveBeenCalledWith({
            data: '2026-10-01',
            registroCicloId: 18
        })
    })

    test('calcula os trechos sem alterar os dias recebidos', () => {
        const semana = [
            criarDia(1),
            criarDia(2, {janelaFertil: true}),
            criarDia(3, {janelaFertil: true}),
            criarDia(4),
            criarDia(5),
            criarDia(6),
            criarDia(7)
        ]

        const copia = JSON.parse(JSON.stringify(semana))

        expect(obterTrechosFerteis(semana)).toEqual([
            {
                inicio: 1,
                quantidade: 2,
                previsto: false,
                chave: '2026-10-02-2026-10-03'
            }
        ])

        expect(semana).toEqual(copia)
    })
})