import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');

    const criarIcone = (nome) =>
        function Icone(propriedades) {
            return React.createElement(View, {
                ...propriedades,
                testID: nome
            });
        };

    return {
        ArrowLeftIcon: criarIcone('ArrowLeftIcon'),
        PaperPlaneTiltIcon: criarIcone('PaperPlaneTiltIcon'),
        WarningCircleIcon: criarIcone('WarningCircleIcon')
    };
});

jest.mock('../../../../src/features/settings/layouts/SettingsLayout/SettingsLayout', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        SettingsLayout({ titulo, onVoltar, children }) {
            return React.createElement(
                View,
                null,
                React.createElement(Text, null, titulo),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Voltar da tela',
                        onPress: onVoltar
                    },
                    React.createElement(Text, null, 'Voltar')
                ),
                children
            );
        }
    };
});

jest.mock('../../../../src/features/support-network/components/ContactForm/ContactForm', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return {
        ContactForm({
            dados,
            categorias,
            aoAlterar,
            aoSalvar,
            aoAbrirPermissoes,
            aoCriarCategoria,
            carregando
        }) {
            const dadosValidos = {
                email: 'maria@example.com',
                iconeId: 'lotus',
                corId: 'verde',
                categoriaId: 10
            };

            return React.createElement(
                View,
                {
                    testID: 'contact-form-falso'
                },
                React.createElement(Text, null, `Categorias: ${categorias.length}`),
                React.createElement(Text, null, `E-mail: ${dados.email}`),
                React.createElement(
                    Text,
                    null,
                    `Permissões: ${dados.permissoesIndividuais.join(',')}`
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Alterar dados do contato',
                        onPress: () =>
                            aoAlterar?.({
                                email: 'rascunho@example.com'
                            })
                    },
                    React.createElement(Text, null, 'Alterar dados')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Salvar contato',
                        disabled: carregando,
                        onPress: () => aoSalvar?.(dadosValidos)
                    },
                    React.createElement(Text, null, 'Salvar')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Abrir permissões',
                        onPress: aoAbrirPermissoes
                    },
                    React.createElement(Text, null, 'Permissões')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Criar categoria',
                        onPress: aoCriarCategoria
                    },
                    React.createElement(Text, null, 'Criar categoria')
                )
            );
        }
    };
});

jest.mock(
    '../../../../src/features/support-network/components/IndividualPermissionsForm/IndividualPermissionsForm',
    () => {
        const React = require('react');
        const { Pressable, Text, View } = require('react-native');

        return {
            IndividualPermissionsForm({ visivel, aoAlterar, aoSalvar }) {
                if (!visivel) {
                    return null;
                }

                return React.createElement(
                    View,
                    {
                        testID: 'individual-permissions-form'
                    },
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Selecionar permissão',
                            onPress: () => aoAlterar(['geral.fase_atual'])
                        },
                        React.createElement(Text, null, 'Selecionar')
                    ),
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Salvar permissões',
                            onPress: () => aoSalvar(['geral.fase_atual'])
                        },
                        React.createElement(Text, null, 'Salvar permissões')
                    )
                );
            }
        };
    }
);

jest.mock('../../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');

    return function SimpleModal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria }) {
        if (!visivel) {
            return null;
        }

        return React.createElement(
            View,
            {
                accessibilityRole: 'alert'
            },
            React.createElement(Text, null, titulo),
            mensagem ? React.createElement(Text, null, mensagem) : null,
            acaoPrincipal
                ? React.createElement(
                      Pressable,
                      {
                          accessibilityRole: 'button',
                          accessibilityLabel: acaoPrincipal.texto,
                          onPress: acaoPrincipal.aoPressionar
                      },
                      React.createElement(Text, null, acaoPrincipal.texto)
                  )
                : null,
            acaoSecundaria
                ? React.createElement(
                      Pressable,
                      {
                          accessibilityRole: 'button',
                          accessibilityLabel: acaoSecundaria.texto,
                          onPress: acaoSecundaria.aoPressionar
                      },
                      React.createElement(Text, null, acaoSecundaria.texto)
                  )
                : null
        );
    };
});

import { ContactFormScreen } from '../../../../src/features/support-network/screens/ContactFormScreen/ContactFormScreen';

const categorias = [
    {
        id: 10,
        nome: 'Família',
        dadosVisiveis: ['geral.fase_atual'],
        quantidadeContatos: 0,
        criadoEm: '2026-11-01T12:00:00.000Z',
        atualizadoEm: '2026-11-01T12:00:00.000Z'
    }
];

const resultadoConvite = {
    mensagem: 'Convite enviado com sucesso.',
    convite: {
        id: 20,
        email: 'maria@example.com',
        status: 'pendente',
        iconeId: 'lotus',
        corId: 'verde'
    }
};

function criarServicos({ contaContatoCadastrada = true } = {}) {
    return {
        service: {
            consultarEmail: jest.fn().mockResolvedValue({
                email: 'maria@example.com',
                contaContatoCadastrada
            }),
            enviarConvite: jest.fn().mockResolvedValue(resultadoConvite)
        },
        categoriasService: {
            listarCategorias: jest.fn().mockResolvedValue(categorias)
        }
    };
}

async function esperarFormulario() {
    await waitFor(() => {
        expect(screen.getByTestId('contact-form-falso')).toBeOnTheScreen();
    });
}

describe('ContactFormScreen', () => {
    test('carrega categorias e mostra o formulário', async () => {
        const servicos = criarServicos();

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        expect(servicos.categoriasService.listarCategorias).toHaveBeenCalledWith({
            signal: expect.any(AbortSignal)
        });

        expect(screen.getByText('Novo Contato')).toBeOnTheScreen();

        expect(screen.getByText('Categorias: 1')).toBeOnTheScreen();
    });

    test('envia diretamente para uma conta cadastrada', async () => {
        const servicos = criarServicos();

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        await waitFor(() => {
            expect(servicos.service.enviarConvite).toHaveBeenCalledWith({
                email: 'maria@example.com',
                iconeId: 'lotus',
                corId: 'verde',
                categoriaId: 10
            });
        });

        expect(await screen.findByText('Convite enviado com sucesso')).toBeOnTheScreen();

        expect(screen.queryByText('Contato Não Registrado')).toBeNull();
    });

    test('impede o próprio e-mail antes de consultar a API', async () => {
        const servicos = criarServicos();

        await render(<ContactFormScreen {...servicos} emailUsuario=" MARIA@EXAMPLE.COM " />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        expect(await screen.findByText('E-mail não permitido')).toBeOnTheScreen();
        expect(screen.getByText('Você não pode convidar seu próprio e-mail.')).toBeOnTheScreen();

        expect(servicos.service.consultarEmail).not.toHaveBeenCalled();
        expect(servicos.service.enviarConvite).not.toHaveBeenCalled();
    });

    test('restaura e notifica alterações do rascunho recebido', async () => {
        const servicos = criarServicos();
        const onRascunhoAlterado = jest.fn();

        await render(
            <ContactFormScreen
                {...servicos}
                dadosIniciais={{
                    email: 'guardado@example.com',
                    iconeId: 'coracao',
                    corId: 'coral',
                    categoriaId: 10,
                    permissoesIndividuais: []
                }}
                onRascunhoAlterado={onRascunhoAlterado}
            />
        );

        await esperarFormulario();

        expect(screen.getByText('E-mail: guardado@example.com')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Alterar dados do contato'
            })
        );

        expect(onRascunhoAlterado).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'rascunho@example.com',
                iconeId: 'coracao',
                corId: 'coral',
                categoriaId: 10
            })
        );
    });

    test('pede confirmação antes de convidar contato não cadastrado', async () => {
        const servicos = criarServicos({
            contaContatoCadastrada: false
        });

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        expect(await screen.findByText('Contato Não Registrado')).toBeOnTheScreen();

        expect(servicos.service.enviarConvite).not.toHaveBeenCalled();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Enviar Convite'
            })
        );

        await waitFor(() => {
            expect(servicos.service.enviarConvite).toHaveBeenCalledTimes(1);
        });

        expect(await screen.findByText('Convite enviado com sucesso')).toBeOnTheScreen();
    });

    test('informa o convite criado ao concluir', async () => {
        const servicos = criarServicos();
        const onSalvo = jest.fn();

        await render(<ContactFormScreen {...servicos} onSalvo={onSalvo} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        await screen.findByText('Convite enviado com sucesso');

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'OK'
            })
        );

        expect(onSalvo).toHaveBeenCalledWith(resultadoConvite.convite);
    });

    test('aplica permissões individuais escolhidas', async () => {
        const servicos = criarServicos();

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Abrir permissões'
            })
        );

        expect(screen.getByTestId('individual-permissions-form')).toBeOnTheScreen();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Selecionar permissão'
            })
        );

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar permissões'
            })
        );

        expect(screen.getByText('Permissões: geral.fase_atual')).toBeOnTheScreen();
    });

    test('abre o fluxo existente de criação de categoria', async () => {
        const servicos = criarServicos();
        const onCriarCategoria = jest.fn();

        await render(<ContactFormScreen {...servicos} onCriarCategoria={onCriarCategoria} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Criar categoria'
            })
        );

        expect(onCriarCategoria).toHaveBeenCalledTimes(1);
    });

    test('mantém os dados e permite repetir uma falha de envio', async () => {
        const servicos = criarServicos();

        servicos.service.enviarConvite
            .mockRejectedValueOnce(new Error('detalhes privados'))
            .mockResolvedValueOnce(resultadoConvite);

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();

        expect(screen.queryByText('detalhes privados')).toBeNull();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Tentar novamente'
            })
        );

        expect(await screen.findByText('Convite enviado com sucesso')).toBeOnTheScreen();

        expect(servicos.service.enviarConvite).toHaveBeenCalledTimes(2);

        expect(servicos.service.consultarEmail).toHaveBeenCalledTimes(1);
    });

    test('encerra o fluxo quando a sessão expira', async () => {
        const servicos = criarServicos();
        const onSessaoExpirada = jest.fn();

        const erro = Object.assign(new Error('sessão privada'), {
            codigo: 'SESSAO_INVALIDA'
        });

        servicos.service.consultarEmail.mockRejectedValue(erro);

        await render(<ContactFormScreen {...servicos} onSessaoExpirada={onSessaoExpirada} />);

        await esperarFormulario();

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar contato'
            })
        );

        await waitFor(() => {
            expect(onSessaoExpirada).toHaveBeenCalledTimes(1);
        });

        expect(screen.queryByText('sessão privada')).toBeNull();
    });

    test('cancela a busca de categorias ao desmontar', async () => {
        let sinalRecebido;

        const servicos = criarServicos();

        servicos.categoriasService.listarCategorias = jest.fn(({ signal }) => {
            sinalRecebido = signal;

            return new Promise(() => {});
        });

        const resultado = await render(<ContactFormScreen {...servicos} />);

        await waitFor(() => {
            expect(sinalRecebido).toBeDefined();
        });

        await act(async () => {
            resultado.unmount();
        });

        await waitFor(() => {
            expect(sinalRecebido.aborted).toBe(true);
        });
    });

    test('impede dois envios simultâneos', async () => {
        let resolverConsulta;

        const servicos = criarServicos();

        servicos.service.consultarEmail = jest.fn(
            () =>
                new Promise((resolve) => {
                    resolverConsulta = resolve;
                })
        );

        await render(<ContactFormScreen {...servicos} />);

        await esperarFormulario();

        const botao = screen.getByRole('button', {
            name: 'Salvar contato'
        });

        const primeiroEnvio = fireEvent.press(botao);

        fireEvent.press(botao);

        expect(servicos.service.consultarEmail).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolverConsulta({
                email: 'maria@example.com',
                contaContatoCadastrada: true
            });

            await primeiroEnvio;
        });

        await waitFor(() => {
            expect(servicos.service.enviarConvite).toHaveBeenCalledTimes(1);
        });
    });
});
