//Testa informações, perspectivas e ações do cartão de contato.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';
import {
    CORES_INFORMACOES,
    ContactCard,
    TAMANHO_ICONE_INFORMACAO,
    formatarDataConvite,
    normalizarEstado,
    normalizarPerspectiva,
    obterIdentificacao,
    obterVinculoSeguro
} from '../../../../src/features/support-network/components/ContactCard/ContactCard';

const conviteRecebido = Object.freeze({
    id: 7,
    nome: 'Julia',
    identificacao: 'Julia',
    email: 'julia@example.com',
    status: 'pendente',
    iconeId: 'pessoa',
    corId: 'branco',
    dataConvite: '2026-10-30T12:00:00.000Z',
    aguardando: {
        dias: 3,
        atrasado: false,
        rotulo: 'Aguardando há 3 dias'
    },
    vinculo: {
        tipo: 'categoria',
        categoria: {
            id: 2,
            nome: 'Profissional'
        },
        permissoes: ['consultas']
    }
});

describe('ContactCard', () => {
    test('mostra os dados do convite recebido', async () => {
        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByText('Julia')).toBeOnTheScreen();

        expect(screen.getByText(/julia@example\.com/u)).toBeOnTheScreen();

        expect(screen.getByText('Profissional')).toBeOnTheScreen();

        expect(screen.getByText(/30\/10\/2026/u)).toBeOnTheScreen();

        expect(screen.getByText('há 3 dias')).toBeOnTheScreen();

        expect(screen.getByText('CONVITE PENDENTE')).toBeOnTheScreen();

        expect(screen.getByTestId('contact-card-centered-name')).toHaveStyle({
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center'
        });

        expect(screen.getByText('Julia')).toHaveStyle({
            textAlign: 'center'
        });

        expect(screen.getByTestId('contact-card')).toHaveStyle({
            width: '100%',
            maxWidth: 350,
            borderRadius: 16,
            borderWidth: 0.705
        });
    });

    test.each([
        ['email', '#B07D2A'],
        ['vinculo', '#C85A44'],
        ['data', '#2C4C3B'],
        ['aguardando', '#4A758E']
    ])('usa o ícone correto para a informação %s', async (identificador, cor) => {
        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByTestId(`contact-info-icon-${identificador}`)).toBeOnTheScreen();

        expect(CORES_INFORMACOES[identificador]).toBe(cor);
        expect(TAMANHO_ICONE_INFORMACAO).toBe(13);
    });

    test('encaminha o aceite do convite recebido', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Aceitar convite de Julia'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('aceitar', conviteRecebido);
    });

    test('encaminha a recusa do convite recebido', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Recusar convite de Julia'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('recusar', conviteRecebido);
    });

    test('abre o resumo de permissões', async () => {
        const aoAbrirResumo = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={aoAbrirResumo}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Julia'
            })
        );

        expect(aoAbrirResumo).toHaveBeenCalledWith(conviteRecebido);
    });

    test('mostra ações de um contato ativo enviado', async () => {
        const aoAcao = jest.fn();

        const contatoAtivo = {
            ...conviteRecebido,
            status: 'ativo',
            identificacao: 'Ana',
            dataAtivacao: '2026-11-02T12:00:00.000Z'
        };

        await render(
            <ContactCard
                contato={contatoAtivo}
                perspectiva="enviado"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar vínculo de Ana'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Arquivar Ana'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Remover Ana'
            })
        );

        expect(aoAcao).toHaveBeenNthCalledWith(1, 'alterar_vinculo', contatoAtivo);

        expect(aoAcao).toHaveBeenNthCalledWith(2, 'arquivar', contatoAtivo);

        expect(aoAcao).toHaveBeenNthCalledWith(3, 'remover', contatoAtivo);

        expect(screen.getByText(/Data de Ativação:/u)).toBeOnTheScreen();
        expect(screen.getByText(/02\/11\/2026/u)).toBeOnTheScreen();

        expect(screen.queryByText(/Vínculo solicitado:/u)).toBeNull();
        expect(screen.queryByText(/Aguardando:/u)).toBeNull();

        expect(screen.getByTestId('contact-permission-badge')).toBeOnTheScreen();

        expect(screen.getByText('Ana').parent).toHaveStyle({
            height: 23.999,
            alignSelf: 'center',
            justifyContent: 'center'
        });
    });

    test('mostra reenvio para convite enviado pendente', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="enviado"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByText('Pendente')).toBeOnTheScreen();

        expect(screen.getByText('Pendente').parent).toHaveStyle({
            height: 23.999,
            alignSelf: 'center',
            justifyContent: 'center'
        });

        expect(screen.getByTestId('pending-contact-icon')).toHaveStyle({
            width: 35.993,
            height: 35.993,
            borderRadius: 10,
            borderWidth: 0.705,
            borderColor: '#5C5C59',
            backgroundColor: 'rgba(92, 92, 89, 0.20)'
        });

        expect(screen.getByTestId('pending-cancel-icon')).toHaveProp('color', '#5C5C59');

        expect(screen.getByText(/Tipo de Vínculo:/u)).toBeOnTheScreen();
        expect(screen.getByText(/Data de Convite:/u)).toBeOnTheScreen();
        expect(screen.getByText(/Aguardando há:/u)).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Julia'
            })
        ).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Reenviar convite para Julia'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('reenviar', conviteRecebido);
    });

    test('cancela o convite enviado pendente pelo cabeçalho', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="enviado"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar convite de Julia'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('remover', conviteRecebido);
    });

    test('apresenta e reconvida um contato inativo arquivado', async () => {
        const aoAcao = jest.fn();

        const contatoInativo = {
            ...conviteRecebido,
            status: 'inativo',
            identificacao: 'Clara',
            dataDesativacao: '2026-11-08T12:00:00.000Z',
            aguardando: {
                dias: 2,
                atrasado: false,
                rotulo: 'Desativado há 2 dias'
            }
        };

        await render(
            <ContactCard
                contato={contatoInativo}
                perspectiva="enviado"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByTestId('contact-card')).toHaveStyle({
            width: '100%',
            maxWidth: 350,
            borderRadius: 16,
            opacity: 0.8,
            paddingTop: 14,
            paddingRight: 16,
            paddingBottom: 18,
            paddingLeft: 16
        });

        expect(screen.getByText('Clara')).toBeOnTheScreen();
        expect(screen.getByText('CONTATO INATIVO')).toBeOnTheScreen();
        expect(screen.getByText(/Tipo de Vínculo:/u)).toBeOnTheScreen();
        expect(screen.getByText(/Data de Desativação:/u)).toBeOnTheScreen();
        expect(screen.getByText(/08\/11\/2026/u)).toBeOnTheScreen();
        expect(screen.getByText(/Desativado há:/u)).toBeOnTheScreen();

        expect(
            screen.queryByRole('button', {
                name: 'Alterar vínculo de Clara'
            })
        ).toBeNull();
        expect(
            screen.queryByRole('button', {
                name: 'Arquivar Clara'
            })
        ).toBeNull();
        expect(
            screen.getByRole('button', {
                name: 'Remover Clara'
            })
        ).toBeOnTheScreen();
        expect(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Clara'
            })
        ).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Convidar Clara novamente'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('convidar_novamente', contatoInativo);
    });

    test('apresenta e reenvia um convite recusado', async () => {
        const aoAcao = jest.fn();

        const contatoRecusado = {
            ...conviteRecebido,
            status: 'recusado',
            identificacao: 'Marina',
            aguardando: {
                dias: 4,
                atrasado: false,
                rotulo: 'Recusado há 4 dias'
            }
        };

        await render(
            <ContactCard
                contato={contatoRecusado}
                perspectiva="enviado"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(screen.getByTestId('contact-card')).toHaveStyle({
            opacity: 0.8,
            paddingTop: 14,
            paddingRight: 16,
            paddingBottom: 18,
            paddingLeft: 16
        });

        expect(screen.getByText('Marina')).toBeOnTheScreen();
        expect(screen.getByText('CONVITE RECUSADO')).toBeOnTheScreen();
        expect(screen.getByText(/Tipo de Vínculo:/u)).toBeOnTheScreen();
        expect(screen.getByText(/Data de Convite:/u)).toBeOnTheScreen();
        expect(screen.getByText(/30\/10\/2026/u)).toBeOnTheScreen();
        expect(screen.getByText(/Recusado há:/u)).toBeOnTheScreen();

        expect(
            screen.queryByRole('button', {
                name: 'Alterar vínculo de Marina'
            })
        ).toBeNull();
        expect(
            screen.queryByRole('button', {
                name: 'Arquivar Marina'
            })
        ).toBeNull();
        expect(
            screen.getByRole('button', {
                name: 'Remover Marina'
            })
        ).toBeOnTheScreen();
        expect(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Marina'
            })
        ).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Reenviar convite para Marina'
            })
        );

        expect(aoAcao).toHaveBeenCalledWith('convidar_novamente', contatoRecusado);
    });

    test('bloqueia ações concorrentes', async () => {
        const aoAcao = jest.fn();

        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={aoAcao}
                aoAbrirResumo={jest.fn()}
                acaoEmAndamento="aceitar"
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Aceitar convite de Julia',
                includeHiddenElements: true
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Recusar convite de Julia',
                includeHiddenElements: true
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Abrir resumo de permissões de Julia',
                includeHiddenElements: true
            })
        ).toBeDisabled();

        expect(aoAcao).not.toHaveBeenCalled();
    });

    test('não mostra aceite e recusa para convite ativo', async () => {
        await render(
            <ContactCard
                contato={{
                    ...conviteRecebido,
                    status: 'ativo'
                }}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />
        );

        expect(
            screen.queryByRole('button', {
                name: 'Aceitar convite de Julia'
            })
        ).toBeNull();

        expect(
            screen.queryByRole('button', {
                name: 'Recusar convite de Julia'
            })
        ).toBeNull();

        expect(screen.getByTestId('contact-summary-button-container')).toHaveStyle({
            paddingTop: 8
        });
    });

    test('mantém o cartão legível no modo escuro', async () => {
        await render(
            <ContactCard
                contato={conviteRecebido}
                perspectiva="recebido"
                aoAcao={jest.fn()}
                aoAbrirResumo={jest.fn()}
            />,
            {
                preferencia: 'escuro'
            }
        );

        expect(screen.getByTestId('contact-card')).toHaveStyle({
            backgroundColor: '#232926',
            borderColor: '#4A514D'
        });
    });

    test('normaliza dados defensivamente', () => {
        expect(normalizarPerspectiva('desconhecida')).toBe('enviado');

        expect(normalizarEstado('desconhecido')).toBe('inativo');

        expect(
            obterIdentificacao({
                email: ' contato@example.com '
            })
        ).toBe('contato@example.com');

        expect(obterVinculoSeguro(null)).toEqual({
            tipo: 'individual'
        });
    });

    test('formata a data do convite', () => {
        expect(formatarDataConvite('2026-10-30T23:30:00.000Z')).toBe('30/10/2026');

        expect(formatarDataConvite('inválida')).toBe('Data não informada');
    });
});
