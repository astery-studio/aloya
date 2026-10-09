//Testa cores, conteúdo, acessibilidade e interação de um dia do calendário.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {CycleDay} from '../../../../src/features/calendar/components/CycleCalendar/CycleDay'
import {
    estilos,
    estilosTipos,
    estilosTiposPrevistos
} from '../../../../src/features/calendar/components/CycleCalendar/CycleCalendar.styles'

function criarDia(alteracoes = {}) {
    return {
        dia: 3,
        data: '2026-10-03',
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

describe('CycleDay', () => {
    test('mantém o espaço de uma casa vazia', async () => {
        const resultado = await render(<CycleDay dia={null} />)

        expect(resultado.toJSON()).toHaveStyle(estilos.celulaDia)
    })

    test('mostra um dia comum sem transformá-lo em botão', async () => {
        await render(<CycleDay dia={criarDia()} />)

        expect(screen.getByText('3')).toBeOnTheScreen()
        expect(screen.queryByRole('button')).toBeNull()
        expect(screen.getByLabelText('Dia 3 de outubro de 2026')).toBeOnTheScreen()
    })

    test('suaviza um dia futuro sem marcação', async () => {
        await render(
            <CycleDay
                dia={criarDia({
                    dia: 4,
                    data: '2026-10-04',
                    futuro: true
                })}
            />
        )

        expect(screen.getByText('4')).toHaveStyle(estilos.numeroDiaFuturo)
        expect(
            screen.getByLabelText('Dia 4 de outubro de 2026, data futura')
        ).toBeOnTheScreen()
    })

    test('usa a cor forte para uma fase atual', async () => {
        const dia = criarDia({
            tipo: 'folicular',
            inicioSegmento: true,
            fimSegmento: true
        })

        await render(<CycleDay dia={dia} />)

        expect(screen.getByTestId('fundo-dia-2026-10-03')).toHaveStyle([
            estilosTipos.folicular,
            estilos.inicioSegmento,
            estilos.fimSegmento
        ])
    })

    test('usa a cor clara para uma fase prevista', async () => {
        const dia = criarDia({
            dia: 6,
            data: '2026-10-06',
            tipo: 'ovulacao',
            previsto: true,
            futuro: true,
            inicioSegmento: true,
            fimSegmento: true
        })

        await render(<CycleDay dia={dia} />)

        expect(screen.getByTestId('fundo-dia-2026-10-06')).toHaveStyle(
            estilosTiposPrevistos.ovulacao
        )

        expect(
            screen.getByLabelText('Dia 6 de outubro de 2026, provável ovulação')
        ).toBeOnTheScreen()
    })

    test('informa a janela fértil sem depender somente da cor', async () => {
        const dia = criarDia({
            tipo: 'lutea',
            janelaFertil: true,
            inicioSegmento: true,
            fimSegmento: true
        })

        await render(<CycleDay dia={dia} />)

        expect(
            screen.getByLabelText('Dia 3 de outubro de 2026, fase lútea, janela fértil')
        ).toBeOnTheScreen()
    })

    test('abre a edição somente para uma menstruação registrada', async () => {
        const aoPressionarDia = jest.fn()
        const dia = criarDia({
            dia: 2,
            data: '2026-10-02',
            tipo: 'menstruacao',
            registroCicloId: 18,
            inicioSegmento: true,
            fimSegmento: true
        })

        await render(
            <CycleDay
                dia={dia}
                aoPressionarDia={aoPressionarDia}
            />
        )

        fireEvent.press(
            screen.getByRole('button', {
                name: 'Dia 2 de outubro de 2026, menstruação registrada'
            })
        )

        expect(aoPressionarDia).toHaveBeenCalledTimes(1)
        expect(aoPressionarDia).toHaveBeenCalledWith({
            data: '2026-10-02',
            registroCicloId: 18
        })
    })

    test('não permite interação com um dia previsto', async () => {
        const aoPressionarDia = jest.fn()

        await render(
            <CycleDay
                dia={criarDia({
                    tipo: 'menstruacao',
                    previsto: true,
                    futuro: true,
                    inicioSegmento: true,
                    fimSegmento: true
                })}
                aoPressionarDia={aoPressionarDia}
            />
        )

        expect(screen.queryByRole('button')).toBeNull()
        expect(aoPressionarDia).not.toHaveBeenCalled()
    })
})