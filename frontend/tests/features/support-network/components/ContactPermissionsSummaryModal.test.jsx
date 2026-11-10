//Testa agrupamento e apresentação do resumo de permissões.
import { fireEvent, screen, within } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import {
    ContactPermissionsSummaryModal,
    calcularLimitesModal,
    criarMensagensVazias,
    criarResumoPermissoes,
    normalizarNome,
    normalizarPermissoes,
    normalizarPerspectiva
} from '../../../../src/features/support-network/components/ContactPermissionsSummaryModal/ContactPermissionsSummaryModal';

const vinculoCategoria = {
    tipo: 'categoria',
    categoria: {
        id: 2,
        nome: 'Profissional'
    }
};

describe('ContactPermissionsSummaryModal', () => {
    test('não apresenta o conteúdo quando está invisível', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel={false}
                perspectiva="recebido"
                nomeContato="Julia"
                permissoes={[]}
                vinculo={{
                    tipo: 'individual'
                }}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.queryByText('Resumo de Permissões')).toBeNull();
    });

    test('mostra permissões gerais e do diário', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="recebido"
                nomeContato="Julia"
                permissoes={[
                    'geral.fase_atual',
                    'geral.dicas',
                    'saude.consultas',
                    'ciclo.fluxo_menstrual'
                ]}
                vinculo={vinculoCategoria}
                aoFechar={jest.fn()}
            />
        );

        expect(screen.getByText('Resumo de Permissões')).toBeOnTheScreen();

        expect(
            screen.getByText('Você possui as seguintes permissões de acesso aos dados de Julia:')
        ).toBeOnTheScreen();

        expect(screen.getByText('Acesso à Fase Atual: ')).toBeOnTheScreen();

        expect(screen.getByText('Você terá acesso à fase em que Julia está.')).toBeOnTheScreen();

        expect(screen.getByText('Receber dicas: ')).toBeOnTheScreen();

        expect(screen.getByText('Saúde e Acompanhamento: ')).toBeOnTheScreen();

        expect(screen.getByText('consultas')).toBeOnTheScreen();

        expect(screen.getByText('Ciclo e Sangramento: ')).toBeOnTheScreen();

        expect(screen.getByText('fluxo menstrual')).toBeOnTheScreen();

        expect(screen.getByText('Profissional')).toBeOnTheScreen();

        const rolagem = screen.getByTestId('contact-permissions-scroll');

        expect(screen.getByTestId('app-modal-scroll')).toHaveProp('scrollEnabled', false);
        expect(rolagem).not.toHaveProp('scrollEnabled', false);

        expect(within(rolagem).getByText('PERMISSÕES GERAIS')).toBeOnTheScreen();
        expect(within(rolagem).queryByText('Profissional')).toBeNull();
        expect(
            within(rolagem).queryByRole('button', {
                name: 'Fechar resumo de permissões'
            })
        ).toBeNull();

        const marcadores = screen.getAllByText('●', {
            includeHiddenElements: true
        });

        expect(marcadores[0]).toHaveStyle({
            color: '#C85A44',
            fontSize: 9,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 13.5
        });

        expect(marcadores[1]).toHaveStyle({
            color: '#2C4C3B'
        });
    });

    test('mostra mensagens quando não existem permissões', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="recebido"
                nomeContato="Julia"
                permissoes={[]}
                vinculo={{
                    tipo: 'individual'
                }}
                aoFechar={jest.fn()}
            />
        );

        expect(
            screen.getByText('Você não possui acesso direto aos dados de permissões gerais.')
        ).toBeOnTheScreen();

        expect(
            screen.getByText('Você não possui acesso direto ao diário de Julia.')
        ).toBeOnTheScreen();

        expect(screen.getByText('Permissões Individuais')).toBeOnTheScreen();
    });

    test('adapta as mensagens para a perspectiva enviada', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="enviado"
                nomeContato="Anna"
                permissoes={[]}
                vinculo={{
                    tipo: 'individual'
                }}
                aoFechar={jest.fn()}
            />
        );

        expect(
            screen.getByText('Anna não possui acesso direto aos dados de permissões gerais.')
        ).toBeOnTheScreen();

        expect(screen.getByText('Anna não possui acesso aos dados do diário.')).toBeOnTheScreen();
    });

    test('fecha pelo botão OK', async () => {
        const aoFechar = jest.fn();

        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="recebido"
                nomeContato="Julia"
                permissoes={[]}
                vinculo={{
                    tipo: 'individual'
                }}
                aoFechar={aoFechar}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Fechar resumo de permissões'
            })
        );

        expect(aoFechar).toHaveBeenCalledTimes(1);
    });

    test('normaliza permissões e remove valores desconhecidos', () => {
        expect(
            normalizarPermissoes([
                'saude.consultas',
                'geral.fase_atual',
                'saude.consultas',
                'permissao.inexistente',
                null
            ])
        ).toEqual(['geral.fase_atual', 'saude.consultas']);
    });

    test('cria o resumo por grupos', () => {
        expect(criarResumoPermissoes(['geral.dicas', 'saude.consultas', 'saude.testes'])).toEqual({
            gerais: [
                {
                    id: 'geral.dicas',
                    titulo: 'Receber dicas'
                }
            ],
            diario: [
                {
                    id: 'saude',
                    titulo: 'Saúde e Acompanhamento',
                    permissoes: [
                        {
                            id: 'saude.testes',
                            titulo: 'Testes'
                        },
                        {
                            id: 'saude.consultas',
                            titulo: 'Consultas'
                        }
                    ]
                }
            ]
        });
    });

    test('normaliza a perspectiva e o nome', () => {
        expect(normalizarPerspectiva('recebido')).toBe('recebido');

        expect(normalizarPerspectiva('desconhecida')).toBe('enviado');

        expect(normalizarNome(' Julia ')).toBe('Julia');

        expect(normalizarNome('')).toBe('Contato');
    });

    test('limita o modal e reserva a área rolável', () => {
        expect(calcularLimitesModal(800)).toEqual({
            alturaMaximaModal: 768,
            alturaMaximaRolagem: 558
        });

        expect(calcularLimitesModal(undefined)).toEqual({
            alturaMaximaModal: 608,
            alturaMaximaRolagem: 398
        });
    });

    test('cria as mensagens vazias da perspectiva recebida', () => {
        expect(criarMensagensVazias('recebido', 'Julia')).toEqual({
            gerais: 'Você não possui acesso direto aos dados de permissões gerais.',
            diario: 'Você não possui acesso direto ao diário de Julia.'
        });
    });

    test('preserva contraste no modo escuro', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="recebido"
                nomeContato="Julia"
                permissoes={['geral.fase_atual']}
                vinculo={vinculoCategoria}
                aoFechar={jest.fn()}
            />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByText('PERMISSÕES GERAIS')).toHaveStyle({
            color: '#F08A75'
        });
    });
});
