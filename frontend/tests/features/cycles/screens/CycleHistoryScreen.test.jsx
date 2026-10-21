//Testa os estados e as ações principais da tela de histórico de ciclos.
import {fireEvent, render, screen} from '@testing-library/react-native'

import {CycleHistoryScreen} from '../../../../src/features/cycles/screens/CycleHistoryScreen'

const resumoCarregado = Object.freeze({
    cicloMedioDias: 28,
    menstruacaoMediaDias: 5,
    quantidadeCiclos: 2,
    confianca: 'alta'
})

const resumoVazio = Object.freeze({
    quantidadeCiclos: 0,
    confianca: 'baixa'
})

const ciclos = Object.freeze([
    Object.freeze({
        id: 'ciclo-02',
        numero: 2,
        periodo: '04 Set até hoje',
        diasMenstruais: 4,
        duracaoDias: null,
        status: 'emAndamento'
    }),
    Object.freeze({
        id: 'ciclo-01',
        numero: 1,
        periodo: '07 Ago até 03 Set',
        diasMenstruais: 5,
        duracaoDias: 27,
        status: 'concluido'
    })
])

describe('CycleHistoryScreen', () => {
    test('mostra o resumo e os ciclos carregados', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByRole('header', {name: 'Histórico de Ciclos'})).toBeOnTheScreen()
        expect(screen.getByText('28')).toBeOnTheScreen()
        expect(screen.getByText('5')).toBeOnTheScreen()
        expect(screen.getByText('2 ciclos registrados')).toBeOnTheScreen()
        expect(screen.getByText('TODOS OS CICLOS')).toBeOnTheScreen()
        expect(screen.getByText('04 Set até hoje')).toBeOnTheScreen()
        expect(screen.getByText('07 Ago até 03 Set')).toBeOnTheScreen()
    })

    test('mostra o estado vazio e abre o calendário', async () => {
        const aoAbrirCalendario = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={[]}
                resumo={resumoVazio}
                aoAbrirCalendario={aoAbrirCalendario}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByText('0 ciclos registrados')).toBeOnTheScreen()
        expect(screen.getByText('Nenhum ciclo registrado')).toBeOnTheScreen()
        expect(screen.getByText('Comece registrando seu primeiro ciclo pelo calendário.')).toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Ir para o Calendário'
            })
        )

        expect(aoAbrirCalendario).toHaveBeenCalledTimes(1)
    })

    test('mostra uma mensagem segura no estado de erro', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={[]}
                resumo={resumoVazio}
                erro="SQLITE_ERROR: tabela indisponível"
                aoTentarNovamente={jest.fn()}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByRole('alert')).toBeOnTheScreen()
        expect(screen.getByText('Ocorreu um erro')).toBeOnTheScreen()
        expect(screen.getByText('Não foi possível carregar seu histórico de ciclos. Tente novamente.')).toBeOnTheScreen()
        expect(screen.queryByText('SQLITE_ERROR: tabela indisponível')).not.toBeOnTheScreen()
    })

    test('solicita uma nova tentativa no estado de erro', async () => {
        const aoTentarNovamente = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={[]}
                resumo={resumoVazio}
                erro="Falha de rede"
                aoTentarNovamente={aoTentarNovamente}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar Novamente'
            })
        )

        expect(aoTentarNovamente).toHaveBeenCalledTimes(1)
    })

    test('mostra o carregamento antes dos demais estados', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                carregando
                erro="Falha de rede"
                aoTentarNovamente={jest.fn()}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByTestId('cycle-history-loading')).toBeOnTheScreen()
        expect(screen.getByText('Carregando histórico de ciclos...')).toBeOnTheScreen()
        expect(screen.queryByText('Ocorreu um erro')).not.toBeOnTheScreen()
        expect(screen.queryByTestId('cycle-history-card')).not.toBeOnTheScreen()
    })

    test('encaminha o ciclo correto para edição', async () => {
        const aoEditarCiclo = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={aoEditarCiclo}
                aoExcluirCiclo={jest.fn()}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Editar ciclo 02'
            })
        )

        expect(aoEditarCiclo).toHaveBeenCalledTimes(1)
        expect(aoEditarCiclo).toHaveBeenCalledWith(ciclos[0])
    })

    test('encaminha o ciclo correto para exclusão', async () => {
        const aoExcluirCiclo = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={aoExcluirCiclo}
            />
        )

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Excluir ciclo 01'
            })
        )

        expect(aoExcluirCiclo).toHaveBeenCalledTimes(1)
        expect(aoExcluirCiclo).toHaveBeenCalledWith(ciclos[1])
    })

    test('trata uma lista inválida como vazia', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={null}
                resumo={resumoVazio}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByText('Nenhum ciclo registrado')).toBeOnTheScreen()
        expect(screen.queryByTestId('cycle-history-list')).not.toBeOnTheScreen()
    })

    test('usa confiança baixa quando o resumo recebe uma confiança desconhecida', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={[]}
                resumo={{
                    quantidadeCiclos: 0,
                    confianca: 'desconhecida'
                }}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByText('Confiança Baixa')).toBeOnTheScreen()
    })

    test('encaminha a navegação inferior', async () => {
        const onSelecionarAba = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={[]}
                resumo={resumoVazio}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
                onSelecionarAba={onSelecionarAba}
            />
        )

        await fireEvent.press(
            screen.getByRole('tab', {
                name: 'Início'
            })
        )

        expect(onSelecionarAba).toHaveBeenCalledWith('inicio')
    })

    test('solicita a próxima página ao chegar perto do fim', async () => {
        const aoCarregarMais = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                temMais
                aoCarregarMais={aoCarregarMais}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        await fireEvent(
            screen.getByTestId('cycle-history-list'),
            'endReached'
        )

        expect(aoCarregarMais).toHaveBeenCalledTimes(1)
    })

    test('mostra carregamento da próxima página sem esconder os ciclos', async () => {
        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                temMais
                carregandoMais
                aoCarregarMais={jest.fn()}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getByTestId('cycle-history-loading-more')).toBeOnTheScreen()
        expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(2)
    })

    test('mantém a lista e permite repetir a paginação após uma falha', async () => {
        const aoTentarCarregarMais = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                temMais
                erroCarregarMais="Detalhe técnico privado"
                aoTentarCarregarMais={aoTentarCarregarMais}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        expect(screen.getAllByTestId('cycle-history-card')).toHaveLength(2)
        expect(screen.getByText('Não foi possível carregar mais ciclos.')).toBeOnTheScreen()
        expect(screen.queryByText('Detalhe técnico privado')).not.toBeOnTheScreen()

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar carregar mais ciclos novamente'
            })
        )

        expect(aoTentarCarregarMais).toHaveBeenCalledTimes(1)
    })

    test('não solicita outra página quando não existem mais ciclos', async () => {
        const aoCarregarMais = jest.fn()

        await render(
            <CycleHistoryScreen
                ciclos={ciclos}
                resumo={resumoCarregado}
                temMais={false}
                aoCarregarMais={aoCarregarMais}
                aoAbrirCalendario={jest.fn()}
                aoEditarCiclo={jest.fn()}
                aoExcluirCiclo={jest.fn()}
            />
        )

        await fireEvent(
            screen.getByTestId('cycle-history-list'),
            'endReached'
        )

        expect(aoCarregarMais).not.toHaveBeenCalled()
    })
})