//Testa agrupamento e apresentação do resumo de permissões.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import {
    ContactPermissionsSummaryModal,
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

        expect(screen.getByText('Acesso à Fase Atual')).toBeOnTheScreen();

        expect(screen.getByText('Receber dicas')).toBeOnTheScreen();

        expect(screen.getByText(/Saúde e Acompanhamento: consultas\./iu)).toBeOnTheScreen();

        expect(screen.getByText(/Ciclo e Sangramento: fluxo menstrual\./iu)).toBeOnTheScreen();

        expect(screen.getByText('Profissional')).toBeOnTheScreen();
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

        expect(screen.getByText('Você não possui acesso aos dados do diário.')).toBeOnTheScreen();

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

    test('cria as mensagens vazias da perspectiva recebida', () => {
        expect(criarMensagensVazias('recebido', 'Julia')).toEqual({
            gerais: 'Você não possui acesso direto aos dados de permissões gerais.',
            diario: 'Você não possui acesso aos dados do diário.'
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
