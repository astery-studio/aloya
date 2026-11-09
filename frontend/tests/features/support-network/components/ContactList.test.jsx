//Testa agrupamento, estados e encaminhamento da lista de contatos.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import {
    ContactList,
    MENSAGEM_ERRO,
    MENSAGEM_VAZIA_ENVIADA,
    MENSAGEM_VAZIA_RECEBIDA,
    contatoEhValido,
    criarItensAgrupados,
    criarRotuloQuantidade,
    ordenarContatos
} from '../../../../src/features/support-network/components/ContactList/ContactList';

const contatos = [
    {
        id: 3,
        identificacao: 'Beatriz',
        email: 'beatriz@example.com',
        status: 'ativo',
        iconeId: 'coracao',
        corId: 'coral',
        dataConvite: '2026-10-20T10:00:00.000Z',
        vinculo: {
            tipo: 'individual',
            permissoes: ['geral.fase_atual']
        }
    },
    {
        id: 2,
        identificacao: 'Carlos',
        email: 'carlos@example.com',
        status: 'pendente',
        iconeId: 'pessoa',
        corId: 'verde',
        dataConvite: '2026-10-29T10:00:00.000Z',
        aguardando: {
            dias: 4,
            atrasado: false,
            rotulo: 'Aguardando há 4 dias'
        },
        vinculo: {
            tipo: 'categoria',
            categoria: {
                id: 2,
                nome: 'Profissional'
            },
            permissoes: ['saude.consultas']
        }
    },
    {
        id: 1,
        identificacao: 'Ana',
        email: 'ana@example.com',
        status: 'pendente',
        iconeId: 'lotus',
        corId: 'roxo',
        dataConvite: '2026-10-30T10:00:00.000Z',
        aguardando: {
            dias: 3,
            atrasado: false,
            rotulo: 'Aguardando há 3 dias'
        },
        vinculo: {
            tipo: 'individual',
            permissoes: ['geral.fase_atual']
        }
    }
];

describe('ContactList', () => {
    test('ordena pendentes antes dos ativos e alfabeticamente', () => {
        expect(ordenarContatos(contatos).map((contato) => contato.identificacao)).toEqual([
            'Ana',
            'Carlos',
            'Beatriz'
        ]);
    });

    test('agrupa os contatos por estado', () => {
        const itens = criarItensAgrupados(contatos);

        expect(
            itens.map((item) => (item.tipo === 'cabecalho' ? item.id : item.contato.identificacao))
        ).toEqual(['cabecalho-pendente', 'Ana', 'Carlos', 'cabecalho-ativo', 'Beatriz']);
    });

    test('mostra os cabeçalhos e os contatos', async () => {
        await render(
            <ContactList
                contatos={contatos}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByText('CONVITES (2 CONTATOS)')).toBeOnTheScreen();

        expect(screen.getByText('CONTATOS ATIVOS (1 CONTATO)')).toBeOnTheScreen();

        expect(screen.getByText('Ana')).toBeOnTheScreen();

        expect(screen.getByText('Carlos')).toBeOnTheScreen();

        expect(screen.getByText('Beatriz')).toBeOnTheScreen();
    });

    test('encaminha uma ação do cartão', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactList
                contatos={contatos}
                perspectiva="recebido"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aceitar convite de Ana'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('aceitar', contatos[2]);
    });

    test('encaminha a abertura do resumo', async () => {
        const aoAbrirResumo = jest.fn();

        await render(
            <ContactList
                contatos={contatos}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={aoAbrirResumo}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Carlos'
            })
        );

        expect(aoAbrirResumo).toHaveBeenCalledWith(contatos[1]);
    });

    test('mostra carregamento inicial', async () => {
        await render(
            <ContactList contatos={[]} carregando aoAcao={jest.fn()} aoAbrirResumo={jest.fn()} />
        );

        expect(screen.getByLabelText('Carregando contatos')).toBeOnTheScreen();

        expect(screen.getByText('Carregando contatos...')).toBeOnTheScreen();
    });

    test('preserva a lista durante atualização secundária', async () => {
        await render(
            <ContactList
                contatos={contatos}
                perspectiva="recebido"
                atualizando
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
                aoTentarNovamente={jest.fn()}
            />
        );

        expect(screen.getByText('Ana')).toBeOnTheScreen();

        expect(screen.getByLabelText('Atualizando contatos')).toBeOnTheScreen();
    });

    test('mostra erro inicial e permite tentar novamente', async () => {
        const aoTentarNovamente = jest.fn();

        await render(
            <ContactList
                contatos={[]}
                erro="ERRO_REDE"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
                aoTentarNovamente={aoTentarNovamente}
            />
        );

        expect(screen.getByText(MENSAGEM_ERRO)).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar Novamente'
            })
        );

        expect(aoTentarNovamente).toHaveBeenCalledTimes(1);
    });

    test('mostra o estado vazio da rede enviada', async () => {
        await render(
            <ContactList
                contatos={[]}
                perspectiva="enviado"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByText('Nenhum contato adicionado')).toBeOnTheScreen();

        expect(screen.getByText(MENSAGEM_VAZIA_ENVIADA)).toBeOnTheScreen();
    });

    test('mostra o estado vazio dos convites recebidos', async () => {
        await render(
            <ContactList
                contatos={[]}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByText('Nenhum convite recebido')).toBeOnTheScreen();

        expect(screen.getByText(MENSAGEM_VAZIA_RECEBIDA)).toBeOnTheScreen();
    });

    test('diferencia filtro sem resultados de uma rede vazia', async () => {
        await render(
            <ContactList contatos={[]} filtroAtivo aoAcao={jest.fn()} aoAbrirResumo={jest.fn()} />
        );

        expect(screen.getByText('Nenhum contato encontrado')).toBeOnTheScreen();

        expect(
            screen.getByText('Nenhum contato corresponde aos filtros selecionados.')
        ).toBeOnTheScreen();
    });

    test('remove contatos recusados e inativos da visualização', () => {
        const itens = criarItensAgrupados([
            ...contatos,
            {
                id: 4,
                identificacao: 'Recusado',
                status: 'recusado'
            },
            {
                id: 5,
                identificacao: 'Inativo',
                status: 'inativo'
            }
        ]);

        expect(
            itens.some(
                (item) =>
                    item.contato?.identificacao === 'Recusado' ||
                    item.contato?.identificacao === 'Inativo'
            )
        ).toBe(false);
    });

    test('encaminha o processamento somente ao contato correto', async () => {
        await render(
            <ContactList
                contatos={contatos}
                perspectiva="recebido"
                contatoEmAndamentoId={1}
                acaoEmAndamento="aceitar"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Aceitar convite de Ana',
                includeHiddenElements: true
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Aceitar convite de Carlos'
            })
        ).toBeEnabled();
    });

    test('valida contatos e quantidades', () => {
        expect(contatoEhValido(contatos[0])).toBe(true);

        expect(
            contatoEhValido({
                id: 99,
                status: 'recusado'
            })
        ).toBe(false);

        expect(contatoEhValido(null)).toBe(false);

        expect(criarRotuloQuantidade(1)).toBe('1 CONTATO');

        expect(criarRotuloQuantidade(3)).toBe('3 CONTATOS');
    });
});
