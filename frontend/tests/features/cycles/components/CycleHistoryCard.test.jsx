//Testa os estados, dados, ações e proteções visuais do histórico de ciclos.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {CycleHistoryCard} from '../../../../src/features/cycles/components/CycleHistoryCard/CycleHistoryCard'

const cicloConcluido = Object.freeze({
    numero: 4,
    periodo: '07 Ago até 03 Set',
    diasMenstruais: 5,
    duracaoDias: 27,
    status: 'concluido'
})

describe('CycleHistoryCard', () => {
    test('mostra um ciclo concluído com todas as informações', async () => {
        await render(
            <CycleHistoryCard
                ciclo={cicloConcluido}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
            />
        )

        expect(screen.getByText('04')).toBeOnTheScreen()
        expect(screen.getByText('07 Ago até 03 Set')).toBeOnTheScreen()
        expect(screen.getByText('5 dias')).toBeOnTheScreen()
        expect(screen.getByText('27 dias')).toBeOnTheScreen()
        expect(screen.queryByText('Em andamento')).not.toBeOnTheScreen()
        expect(screen.queryByText('Estimativa incerta')).not.toBeOnTheScreen()
    })

    test('mostra o ciclo em andamento e mantém a duração indisponível', async () => {
        await render(
            <CycleHistoryCard
                ciclo={{
                    numero: 5,
                    periodo: '04 Set até hoje',
                    diasMenstruais: 4,
                    duracaoDias: 10,
                    status: 'emAndamento'
                }}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
            />
        )

        expect(screen.getByText('05')).toBeOnTheScreen()
        expect(screen.getByText('04 Set até hoje')).toBeOnTheScreen()
        expect(screen.getByText('Em andamento')).toBeOnTheScreen()
        expect(screen.getByLabelText('Duração do ciclo ainda não disponível')).toBeOnTheScreen()
    })

    test('mostra o aviso quando a estimativa é incerta', async () => {
        await render(
            <CycleHistoryCard
                ciclo={{
                    numero: 3,
                    periodo: '08 Jul até 06 Ago',
                    diasMenstruais: 6,
                    duracaoDias: 29,
                    status: 'incerto'
                }}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
            />
        )

        expect(screen.getByRole('alert')).toHaveProp(
            'accessibilityLabel',
            'Estimativa incerta. Os dados deste ciclo podem ser imprecisos.'
        )
        expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen()
        expect(screen.getByText('Os dados deste ciclo podem ser imprecisos.')).toBeOnTheScreen()
    })

    test('envia o ciclo correto ao solicitar edição', async () => {
        const aoEditar = jest.fn()

        await render(
            <CycleHistoryCard
                ciclo={cicloConcluido}
                aoEditar={aoEditar}
                aoExcluir={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar ciclo 04'
            })
        )

        expect(aoEditar).toHaveBeenCalledTimes(1)
        expect(aoEditar).toHaveBeenCalledWith(cicloConcluido)
    })

    test('envia o ciclo correto ao solicitar exclusão', async () => {
        const aoExcluir = jest.fn()

        await render(
            <CycleHistoryCard
                ciclo={cicloConcluido}
                aoEditar={jest.fn()}
                aoExcluir={aoExcluir}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Excluir ciclo 04'
            })
        )

        expect(aoExcluir).toHaveBeenCalledTimes(1)
        expect(aoExcluir).toHaveBeenCalledWith(cicloConcluido)
    })

    test('desabilita as ações que não foram fornecidas', async () => {
        await render(
            <CycleHistoryCard
                ciclo={cicloConcluido}
            />
        )

        expect(
            screen.getByRole('button', {
                name: 'Editar ciclo 04'
            })
        ).toBeDisabled()

        expect(
            screen.getByRole('button', {
                name: 'Excluir ciclo 04'
            })
        ).toBeDisabled()
    })

    test('protege a interface contra valores inválidos', async () => {
        await render(
            <CycleHistoryCard
                ciclo={{
                    numero: -1,
                    periodo: '   ',
                    diasMenstruais: -2,
                    duracaoDias: '28',
                    status: 'desconhecido'
                }}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
            />
        )

        expect(screen.getByText('--')).toBeOnTheScreen()
        expect(screen.getByText('Período não informado')).toBeOnTheScreen()
        expect(screen.getByText('Estimativa incerta')).toBeOnTheScreen()
        expect(screen.getByLabelText('Dias de menstruação não informados')).toBeOnTheScreen()
        expect(screen.getByLabelText('Duração do ciclo ainda não disponível')).toBeOnTheScreen()
    })

    test('usa o singular para um dia', async () => {
        await render(
            <CycleHistoryCard
                ciclo={{
                    numero: 1,
                    periodo: '12 Mai até 13 Mai',
                    diasMenstruais: 1,
                    duracaoDias: 1,
                    status: 'concluido'
                }}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
            />
        )

        expect(screen.getAllByText('1 dia')).toHaveLength(2)
        expect(screen.getByLabelText('1 dia de menstruação')).toBeOnTheScreen()
        expect(screen.getByLabelText('1 dia de ciclo')).toBeOnTheScreen()
    })
})