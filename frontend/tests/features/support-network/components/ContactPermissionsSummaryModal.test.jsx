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
        expect(rolagem).toHaveProp('scrollEnabled', true);
        expect(rolagem).toHaveProp('nestedScrollEnabled', true);

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
            width: 11,
            height: 16,
            color: '#C85A44',
            fontSize: 11,
            fontStyle: 'normal',
            fontWeight: '400',
            lineHeight: 16
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
            screen.getByText('Este contato não possuí acesso direto aos seus dados.')
        ).toBeOnTheScreen();

        expect(screen.getByText('Este contato não possuí acesso ao seu diário.')).toBeOnTheScreen();
    });

    test('mostra ao usuário principal os textos definidos para permissões gerais', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="enviado"
                nomeContato="Anna"
                permissoes={[
                    'geral.fase_atual',
                    'geral.anticoncepcionais',
                    'geral.historico_ciclo',
                    'geral.alerta_anticoncepcional',
                    'geral.dicas'
                ]}
                vinculo={vinculoCategoria}
                aoFechar={jest.fn()}
            />
        );

        expect(
            screen.getByText(
                'Este contato possuí as seguintes permissões de acesso dos seus dados:'
            )
        ).toBeOnTheScreen();
        expect(screen.getByText('Este contato terá acesso a fase você está.')).toBeOnTheScreen();
        expect(
            screen.getByText('Este contato terá acesso a lista e ao histórico de uso.')
        ).toBeOnTheScreen();
        expect(
            screen.getByText(
                'Este contato terá acesso ao ciclos, menstruação e previsões de ciclo.'
            )
        ).toBeOnTheScreen();
        expect(
            screen.getByText(
                'Este contato será afetado pelas configurações de alarme do anticoncepcional.'
            )
        ).toBeOnTheScreen();
        expect(
            screen.getByText(
                'Este contato receberá notificações e dicas práticas sobre a fase atual.'
            )
        ).toBeOnTheScreen();
    });

    test('mostra ao usuário principal os textos definidos para categorias do diário', async () => {
        await render(
            <ContactPermissionsSummaryModal
                visivel
                perspectiva="enviado"
                nomeContato="Anna"
                permissoes={[
                    'ciclo.fluxo_menstrual',
                    'corpo.sintomas_fisicos',
                    'emocional.sintomas_emocionais',
                    'vida_intima.atividade_sexual',
                    'energia.energia',
                    'saude.testes'
                ]}
                vinculo={vinculoCategoria}
                aoFechar={jest.fn()}
            />
        );

        expect(
            screen.getByText('Este contato possuí acesso as seguintes categorias do seu diário:')
        ).toBeOnTheScreen();
        expect(
            screen.getByText('Fluxo Menstrual, sangramento de escape e secreção/corrimento.')
        ).toBeOnTheScreen();
        expect(
            screen.getByText(
                'Sintomas físicos, pele, cabelo, digestão, banheiro, região genital, tórax/peito, temperatura basal e peso.'
            )
        ).toBeOnTheScreen();
        expect(screen.getByText('sintomas emocionais, sintomas pré-menstruais.')).toBeOnTheScreen();
        expect(
            screen.getByText(
                'Atividade sexual(com parceiro(a), autoerotismo, desejo/libido, vida social.'
            )
        ).toBeOnTheScreen();
        expect(screen.getByText('energia, qualidade de sono e tempo de sono.')).toBeOnTheScreen();
        expect(screen.getByText('testes, consultas e anotação livre.')).toBeOnTheScreen();
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

        expect(calcularLimitesModal(800, 44, 34)).toEqual({
            alturaMaximaModal: 690,
            alturaMaximaRolagem: 480
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
