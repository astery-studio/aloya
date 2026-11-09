//Testa dados, validações e ações do formulário de contato.
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/forms/EmailInput', () => {
    const React = require('react');
    const { Text, TextInput, View } = require('react-native');

    return function EmailInput({ label, value, onChangeText, erro, desativado }) {
        return React.createElement(
            View,
            null,
            React.createElement(TextInput, {
                accessibilityLabel: label,
                value,
                editable: !desativado,
                onChangeText
            }),
            erro
                ? React.createElement(
                      Text,
                      {
                          accessibilityRole: 'alert'
                      },
                      erro
                  )
                : null
        );
    };
});

jest.mock(
    '../../../../src/features/support-network/components/ContactAppearancePicker/ContactAppearancePicker',
    () => {
        const React = require('react');
        const { Pressable, Text } = require('react-native');

        return {
            ContactAppearancePicker({ aoAlterar, desabilitado }) {
                return React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Alterar aparência',
                        disabled: desabilitado,
                        onPress: () =>
                            aoAlterar?.({
                                iconeId: 'lotus',
                                corId: 'roxo'
                            })
                    },
                    React.createElement(Text, null, 'Aparência')
                );
            }
        };
    }
);

jest.mock(
    '../../../../src/features/support-network/components/SupportCategorySelector/SupportCategorySelector',
    () => {
        const React = require('react');
        const { Pressable, Text } = require('react-native');

        function idCategoriaEhValido(id) {
            return (
                (Number.isSafeInteger(id) && id > 0) ||
                (typeof id === 'string' && id.trim().length > 0)
            );
        }

        function SupportCategorySelector({ aoSelecionar, desabilitado }) {
            return React.createElement(
                Pressable,
                {
                    accessibilityRole: 'button',
                    accessibilityLabel: 'Selecionar categoria Família',
                    disabled: desabilitado,
                    onPress: () => aoSelecionar?.(2)
                },
                React.createElement(Text, null, 'Categorias Cadastradas')
            );
        }

        return {
            SupportCategorySelector,
            idCategoriaEhValido
        };
    }
);

jest.mock(
    '../../../../src/features/support-network/components/PermissionBulkSelector/PermissionBulkSelector',
    () => {
        const permissoesPermitidas = [
            'geral.fase_atual',
            'geral.anticoncepcionais',
            'ciclo.fluxo_menstrual'
        ];

        function normalizarPermissoesSelecionadas(permissoes) {
            if (!Array.isArray(permissoes)) {
                return [];
            }

            return permissoesPermitidas.filter((permissaoId) => permissoes.includes(permissaoId));
        }

        return {
            normalizarPermissoesSelecionadas
        };
    }
);

jest.mock('../../../../src/shared/components/common/Button/ButtonScreen', () => {
    const React = require('react');
    const { Pressable, Text } = require('react-native');

    return function ButtonScreen({
        texto,
        rotuloAcessibilidade,
        aoPressionar,
        desativado,
        carregando
    }) {
        return React.createElement(
            Pressable,
            {
                accessibilityRole: 'button',
                accessibilityLabel: rotuloAcessibilidade ?? texto,
                accessibilityState: {
                    disabled: desativado || carregando,
                    busy: carregando
                },
                disabled: desativado || carregando,
                onPress: aoPressionar
            },
            React.createElement(Text, null, texto)
        );
    };
});

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    return {
        UserCheckIcon: (propriedades) => React.createElement(View, propriedades),
        UsersIcon: (propriedades) => React.createElement(View, propriedades)
    };
});

import {
    ContactForm,
    emailContatoEhValido,
    prepararContatoParaSalvar
} from '../../../../src/features/support-network/components/ContactForm/ContactForm';

const dadosCategoria = Object.freeze({
    email: 'maria@gmail.com',
    iconeId: 'lotus',
    corId: 'verde',
    categoriaId: 1,
    permissoesIndividuais: []
});

describe('ContactForm', () => {
    test('mostra todos os campos e ações', async () => {
        await render(
            <ContactForm
                dados={dadosCategoria}
                categorias={[]}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        expect(screen.getByLabelText('E-mail do Contato')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Alterar aparência'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Cadastrar permissões individuais'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Cadastrar categoria nova'
            })
        ).toBeOnTheScreen();

        expect(screen.getByText('Categorias Cadastradas')).toBeOnTheScreen();
    });

    test('encaminha alteração de e-mail', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactForm
                dados={{
                    ...dadosCategoria,
                    email: ''
                }}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        await fireEvent.changeText(screen.getByLabelText('E-mail do Contato'), 'novo@email.com');

        expect(aoAlterar).toHaveBeenCalledWith({
            email: 'novo@email.com'
        });
    });

    test('encaminha alteração de aparência', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactForm
                dados={dadosCategoria}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar aparência'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith({
            iconeId: 'lotus',
            corId: 'roxo'
        });
    });

    test('selecionar categoria remove permissões individuais', async () => {
        const aoAlterar = jest.fn();

        await render(
            <ContactForm
                dados={{
                    ...dadosCategoria,
                    categoriaId: null,
                    permissoesIndividuais: ['geral.fase_atual']
                }}
                aoAlterar={aoAlterar}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Selecionar categoria Família'
            })
        );

        expect(aoAlterar).toHaveBeenCalledWith({
            categoriaId: 2,
            permissoesIndividuais: []
        });
    });

    test('abre os fluxos auxiliares', async () => {
        const aoAbrirPermissoes = jest.fn();
        const aoCriarCategoria = jest.fn();

        await render(
            <ContactForm
                dados={dadosCategoria}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={aoAbrirPermissoes}
                aoCriarCategoria={aoCriarCategoria}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cadastrar permissões individuais'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Cadastrar categoria nova'
            })
        );

        expect(aoAbrirPermissoes).toHaveBeenCalledTimes(1);
        expect(aoCriarCategoria).toHaveBeenCalledTimes(1);
    });

    test('salva o cadastro válido por categoria', async () => {
        const aoSalvar = jest.fn();

        await render(
            <ContactForm
                dados={dadosCategoria}
                aoAlterar={jest.fn()}
                aoSalvar={aoSalvar}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar novo contato'
            })
        );

        expect(aoSalvar).toHaveBeenCalledWith({
            email: 'maria@gmail.com',
            iconeId: 'lotus',
            corId: 'verde',
            categoriaId: 1
        });
    });

    test('salva permissões individuais sem enviar categoria', async () => {
        const resultado = prepararContatoParaSalvar({
            email: ' MARIA@GMAIL.COM ',
            iconeId: 'coracao',
            corId: 'coral',
            categoriaId: null,
            permissoesIndividuais: ['geral.fase_atual', 'inválida']
        });

        expect(resultado).toEqual({
            email: 'maria@gmail.com',
            iconeId: 'coracao',
            corId: 'coral',
            permissoesIndividuais: ['geral.fase_atual']
        });

        expect(resultado).not.toHaveProperty('categoriaId');
    });

    test.each([
        ['email-inválido', false],
        ['sem-dominio@', false],
        ['@email.com', false],
        ['usuario@email.com', true],
        [' USUARIO@EMAIL.COM ', true]
    ])('valida o e-mail %p', (email, esperado) => {
        expect(emailContatoEhValido(email)).toBe(esperado);
    });

    test('desabilita salvar com vínculo ausente', async () => {
        await render(
            <ContactForm
                dados={{
                    ...dadosCategoria,
                    categoriaId: null,
                    permissoesIndividuais: []
                }}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvar novo contato'
            })
        ).toBeDisabled();
    });

    test('desabilita salvar com categoria e permissões simultâneas', async () => {
        await render(
            <ContactForm
                dados={{
                    ...dadosCategoria,
                    permissoesIndividuais: ['geral.fase_atual']
                }}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvar novo contato'
            })
        ).toBeDisabled();
    });

    test('edição exige alteração real', async () => {
        await render(
            <ContactForm
                dados={dadosCategoria}
                modo="edicao"
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
                alterado={false}
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Salvar alterações do contato'
            })
        ).toBeDisabled();

        expect(screen.getByLabelText('E-mail do Contato')).toBeDisabled();
    });

    test('bloqueia o formulário durante carregamento', async () => {
        await render(
            <ContactForm
                dados={dadosCategoria}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
                carregando
            />
        );

        expect(
            screen.getByRole('button', {
                name: 'Alterar aparência'
            })
        ).toBeDisabled();

        expect(
            screen.getByRole('button', {
                name: 'Salvar novo contato'
            })
        ).toBeDisabled();
    });

    test('mostra mensagens de validação acessíveis', async () => {
        await render(
            <ContactForm
                dados={dadosCategoria}
                aoAlterar={jest.fn()}
                aoSalvar={jest.fn()}
                aoAbrirPermissoes={jest.fn()}
                aoCriarCategoria={jest.fn()}
                erros={{
                    email: 'Informe um e-mail válido.',
                    aparencia: 'Escolha uma aparência.',
                    permissao: 'Escolha um tipo de vínculo.'
                }}
            />
        );

        expect(screen.getByText('Informe um e-mail válido.')).toBeOnTheScreen();

        expect(
            screen.getByRole('alert', {
                name: 'Escolha uma aparência.'
            })
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('alert', {
                name: 'Escolha um tipo de vínculo.'
            })
        ).toBeOnTheScreen();
    });
});
