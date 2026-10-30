//Testa preenchimento, alteração, confirmação, erros e sucesso da edição de categoria.
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    const criarIcone = (nome) =>
        function IconeFalso() {
            return React.createElement(View, {
                accessibilityLabel: nome
            });
        };

    return {
        ArrowLeftIcon: criarIcone('ArrowLeftIcon'),
        BellIcon: criarIcone('BellIcon'),
        CaretDownIcon: criarIcone('CaretDownIcon'),
        CaretUpIcon: criarIcone('CaretUpIcon'),
        DropIcon: criarIcone('DropIcon'),
        FirstAidKitIcon: criarIcone('FirstAidKitIcon'),
        HeartIcon: criarIcone('HeartIcon'),
        LightningIcon: criarIcone('LightningIcon'),
        PersonArmsSpreadIcon: criarIcone('PersonArmsSpreadIcon'),
        UsersIcon: criarIcone('UsersIcon'),
        WarningCircleIcon: criarIcone('WarningCircleIcon')
    };
});

jest.mock('../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        SettingsLayout: ({ titulo, onVoltar, children, rodape }) =>
            React.createElement(
                View,
                null,
                React.createElement(Text, null, titulo),
                React.createElement(Pressable, {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Voltar',
                    onPress: onVoltar
                }),
                children,
                React.createElement(
                    View,
                    {
                        testID: 'rodape-edicao'
                    },
                    rodape
                )
            )
    };
});

import { EditSupportCategoryScreen } from '../../../../src/features/support-network/screens/EditSupportCategoryScreen';

const categoriaSemContatos = {
    id: 7,
    nome: 'Família',
    dadosVisiveis: ['geral.fase_atual'],
    quantidadeContatos: 0,
    criadoEm: '2026-10-20T10:00:00.000Z',
    atualizadoEm: '2026-10-26T12:00:00.000Z'
};

const categoriaComContatos = {
    ...categoriaSemContatos,
    quantidadeContatos: 2
};

const categoriaAtualizada = {
    ...categoriaSemContatos,
    nome: 'Parceiro(a)',
    atualizadoEm: '2026-10-28T12:00:00.000Z'
};

async function alterarNome(nome = 'Parceiro(a)') {
    await fireEvent.changeText(screen.getByLabelText('Nome da categoria'), nome);
}

async function pressionarAtualizar() {
    await fireEvent.press(
        screen.getByRole('button', {
            name: 'Atualizar'
        })
    );
}

describe('EditSupportCategoryScreen', () => {
    test('preenche o formulário com os dados atuais', async () => {
        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn()}
            />
        );

        expect(screen.getByText('Atualizar Categoria')).toBeOnTheScreen();

        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('value', 'Família');

        expect(
            screen.getByRole('switch', {
                name: 'Acesso à Fase Atual'
            })
        ).toBeChecked();
    });

    test('mantém o botão desativado sem alteração real', async () => {
        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Atualizar'
            })
        ).toBeDisabled();

        await alterarNome('  Família  ');

        expect(
            screen.getByRole('button', {
                name: 'Atualizar'
            })
        ).toBeDisabled();
    });

    test('habilita o botão após uma alteração real', async () => {
        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn()}
            />
        );

        await alterarNome();

        expect(
            screen.getByRole('button', {
                name: 'Atualizar'
            })
        ).toBeEnabled();
    });

    test('atualiza diretamente uma categoria sem contatos', async () => {
        const editarCategoria = jest.fn().mockResolvedValue(categoriaAtualizada);

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        await waitFor(() => {
            expect(editarCategoria).toHaveBeenCalledWith(7, {
                nome: 'Parceiro(a)',
                dadosVisiveis: ['geral.fase_atual'],
                atualizadoEm: '2026-10-26T12:00:00.000Z'
            });
        });

        expect(await screen.findByText('Categoria atualizada com sucesso')).toBeOnTheScreen();
    });

    test('solicita confirmação antes de atualizar uma categoria com contatos', async () => {
        const editarCategoria = jest.fn();

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaComContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        expect(editarCategoria).not.toHaveBeenCalled();

        expect(
            screen.getByText(
                'Esta alteração afetará imediatamente 2 contatos vinculados a esta categoria. Deseja continuar?'
            )
        ).toBeOnTheScreen();
    });

    test('envia a quantidade após confirmar o impacto', async () => {
        const editarCategoria = jest.fn().mockResolvedValue({
            ...categoriaAtualizada,
            quantidadeContatos: 2
        });

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaComContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Confirmar'
            })
        );

        await waitFor(() => {
            expect(editarCategoria).toHaveBeenCalledWith(7, {
                nome: 'Parceiro(a)',
                dadosVisiveis: ['geral.fase_atual'],
                atualizadoEm: '2026-10-26T12:00:00.000Z',
                quantidadeContatosConfirmada: 2
            });
        });
    });

    test('cancela a confirmação sem perder os dados', async () => {
        const editarCategoria = jest.fn();

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaComContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        );

        expect(screen.queryByText('Atualizar categoria')).toBeNull();

        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('value', 'Parceiro(a)');

        expect(editarCategoria).not.toHaveBeenCalled();
    });

    test('mostra erro quando o nome fica vazio', async () => {
        const editarCategoria = jest.fn();

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome('   ');
        await pressionarAtualizar();

        expect(await screen.findByText('Salvar sem nome')).toBeOnTheScreen();

        expect(screen.getByText('Dê um nome para a categoria.')).toBeOnTheScreen();

        expect(editarCategoria).not.toHaveBeenCalled();
    });

    test('mostra erro de nome duplicado sem expor detalhes internos', async () => {
        const erro = new Error('Detalhes privados');

        erro.codigo = 'CATEGORIA_NOME_DUPLICADO';

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn().mockRejectedValue(erro)}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        expect(await screen.findByText('Categoria existente')).toBeOnTheScreen();

        expect(screen.queryByText('Detalhes privados')).toBeNull();
    });

    test('usa a quantidade mais recente devolvida pelo backend', async () => {
        const erro = new Error('Confirmação necessária');

        erro.codigo = 'CONFIRMACAO_IMPACTO_NECESSARIA';

        erro.detalhes = {
            quantidadeContatos: 3
        };

        const editarCategoria = jest.fn().mockRejectedValue(erro);

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={editarCategoria}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        expect(
            await screen.findByText(
                'Esta alteração afetará imediatamente 3 contatos vinculados a esta categoria. Deseja continuar?'
            )
        ).toBeOnTheScreen();
    });

    test('mantém os dados preenchidos após erro interno', async () => {
        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn().mockRejectedValue(new Error('Falha do banco'))}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();

        expect(screen.getByLabelText('Nome da categoria')).toHaveProp('value', 'Parceiro(a)');

        expect(screen.queryByText('Falha do banco')).toBeNull();
    });

    test('informa a categoria atualizada e conclui pelo botão OK', async () => {
        const onCategoriaAtualizada = jest.fn();

        const onConcluido = jest.fn();

        await render(
            <EditSupportCategoryScreen
                categoria={categoriaSemContatos}
                editarCategoria={jest.fn().mockResolvedValue(categoriaAtualizada)}
                onCategoriaAtualizada={onCategoriaAtualizada}
                onConcluido={onConcluido}
            />
        );

        await alterarNome();
        await pressionarAtualizar();

        await screen.findByText('Categoria atualizada com sucesso');

        expect(onCategoriaAtualizada).toHaveBeenCalledWith(categoriaAtualizada);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'OK'
            })
        );

        expect(onConcluido).toHaveBeenCalledWith(categoriaAtualizada);
    });

    test('mostra o carregamento inicial', async () => {
        await render(<EditSupportCategoryScreen carregando editarCategoria={jest.fn()} />);

        expect(screen.getByLabelText('Carregando categoria')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Atualizar'
            })
        ).toBeDisabled();
    });
});
