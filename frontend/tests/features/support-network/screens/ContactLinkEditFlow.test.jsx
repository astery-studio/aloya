import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

let propriedadesFormulario = null;
let propriedadesPermissoes = null;

jest.mock('../../../../src/shared/components/icons/AppIcons', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Icone = (props) => React.createElement(View, props);
    return { LockKeyIcon: Icone, WarningCircleIcon: Icone };
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
                        accessibilityLabel: 'Voltar',
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
        ContactForm(props) {
            propriedadesFormulario = props;
            return React.createElement(
                View,
                { testID: 'formulario-edicao' },
                React.createElement(Text, null, `E-mail: ${props.dados.email}`),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Abrir permissões',
                        onPress: props.aoAbrirPermissoes
                    },
                    React.createElement(Text, null, 'Permissões')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Selecionar Família',
                        onPress: () =>
                            props.aoAlterar({ categoriaId: 10, permissoesIndividuais: [] })
                    },
                    React.createElement(Text, null, 'Família')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Alterar aparência',
                        onPress: () => props.aoAlterar({ iconeId: 'sol', corId: 'azul' })
                    },
                    React.createElement(Text, null, 'Aparência')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Cadastrar categoria nova',
                        onPress: props.aoCriarCategoria
                    },
                    React.createElement(Text, null, 'Nova categoria')
                ),
                React.createElement(
                    Pressable,
                    {
                        accessibilityRole: 'button',
                        accessibilityLabel: 'Salvar edição',
                        onPress: props.aoSalvar
                    },
                    React.createElement(Text, null, 'Salvar')
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
            IndividualPermissionsForm(props) {
                propriedadesPermissoes = props;
                if (!props.visivel) return null;
                return React.createElement(
                    View,
                    { testID: 'permissoes-individuais' },
                    React.createElement(
                        Pressable,
                        {
                            accessibilityRole: 'button',
                            accessibilityLabel: 'Alterar e salvar permissões',
                            onPress: () => props.aoSalvar(['geral.fase_atual'])
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
    return function Modal({ visivel, titulo, mensagem, acaoPrincipal, acaoSecundaria }) {
        if (!visivel) return null;
        return React.createElement(
            View,
            { accessibilityRole: 'alert', accessibilityLabel: titulo },
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

import {
    ContactLinkEditFlow,
    criarAlteracao,
    houveAlteracaoReal,
    obterMensagemConfirmacao
} from '../../../../src/features/support-network/screens/ContactFormScreen/ContactLinkEditFlow';

const configuracaoCategoria = {
    contato: {
        id: 20,
        nome: 'Ana',
        email: 'ana@example.com',
        iconeId: 'coracao',
        corId: 'coral'
    },
    vinculoAtual: {
        tipo: 'categoria',
        categoria: { id: 10, nome: 'Família', permissoes: ['geral.fase_atual', 'saude.consultas'] },
        permissoes: ['geral.fase_atual', 'saude.consultas']
    },
    proximoVinculo: {
        tipo: 'individual',
        permissoesPreenchidas: [],
        categorias: [
            { id: 10, nome: 'Família', permissoes: ['geral.fase_atual', 'saude.consultas'] },
            { id: 11, nome: 'Profissional', permissoes: ['geral.historico_ciclo'] }
        ]
    },
    versao: '2026-11-08T12:00:00.000Z'
};

const configuracaoIndividual = {
    contato: {
        id: 21,
        nome: 'Bia',
        email: 'bia@example.com',
        iconeId: 'coracao',
        corId: 'coral'
    },
    vinculoAtual: {
        tipo: 'individual',
        categoria: null,
        permissoes: ['geral.fase_atual']
    },
    proximoVinculo: {
        tipo: 'categoria',
        permissoesPreenchidas: [],
        categorias: [{ id: 10, nome: 'Família', permissoes: ['geral.fase_atual'] }]
    },
    versao: '2026-11-08T13:00:00.000Z'
};

function criarService(configuracao = configuracaoCategoria) {
    return {
        consultar: jest.fn().mockResolvedValue(configuracao),
        atualizar: jest.fn().mockResolvedValue({
            mensagem: 'Vínculo atualizado com sucesso.',
            vinculo: { contatoId: configuracao.contato.id }
        })
    };
}

const dadosIniciais = { iconeId: 'coracao', corId: 'coral' };

beforeEach(() => {
    propriedadesFormulario = null;
    propriedadesPermissoes = null;
});

test('carrega o vínculo e preserva a aparência do contato', async () => {
    const service = criarService();
    await render(
        <ContactLinkEditFlow
            contatoId={20}
            dadosIniciais={dadosIniciais}
            service={service}
            onCriarCategoria={jest.fn()}
        />
    );

    await screen.findByTestId('formulario-edicao');

    expect(service.consultar).toHaveBeenCalledWith(20, { signal: expect.any(AbortSignal) });
    expect(propriedadesFormulario.dados).toMatchObject({
        email: 'ana@example.com',
        iconeId: 'coracao',
        corId: 'coral',
        categoriaId: 10
    });
    expect(propriedadesFormulario.alterado).toBe(false);
    expect(propriedadesFormulario.bloquearAparencia).toBeUndefined();
    expect(propriedadesFormulario.permitirCriarCategoria).toBe(true);
});

test('converte categoria em permissões individuais somente após confirmação', async () => {
    const service = criarService();
    const onSalvo = jest.fn();
    await render(
        <ContactLinkEditFlow
            contatoId={20}
            dadosIniciais={dadosIniciais}
            service={service}
            onSalvo={onSalvo}
        />
    );
    await screen.findByTestId('formulario-edicao');

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir permissões' }));
    expect(screen.getByText('Desvincular categoria')).toBeOnTheScreen();
    expect(screen.queryByTestId('permissoes-individuais')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    expect(propriedadesPermissoes.permissoesSelecionadas).toEqual([]);

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar e salvar permissões' }));
    expect(propriedadesFormulario.alterado).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar edição' }));
    await waitFor(() => {
        expect(service.atualizar).toHaveBeenCalledWith(20, {
            tipo: 'individual',
            permissoesIndividuais: ['geral.fase_atual'],
            iconeId: 'coracao',
            corId: 'coral',
            versao: configuracaoCategoria.versao
        });
    });
    await waitFor(() => expect(onSalvo).toHaveBeenCalledTimes(1));
});

test('substitui permissões individuais por uma categoria', async () => {
    const service = criarService(configuracaoIndividual);
    await render(
        <ContactLinkEditFlow contatoId={21} dadosIniciais={dadosIniciais} service={service} />
    );
    await screen.findByTestId('formulario-edicao');

    expect(propriedadesFormulario.permitirPermissoes).toBe(true);
    expect(propriedadesFormulario.categorias).toHaveLength(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar Família' }));
    expect(screen.getByText('Vincular a categoria')).toBeOnTheScreen();
    expect(screen.getByText(/vincula o contato à categoria ‘Família’/u)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar edição' }));
    await waitFor(() => {
        expect(service.atualizar).toHaveBeenCalledWith(21, {
            tipo: 'categoria',
            categoriaId: 10,
            iconeId: 'coracao',
            corId: 'coral',
            versao: configuracaoIndividual.versao
        });
    });
});

test('salva ícone e cor mantendo o vínculo e o e-mail bloqueado', async () => {
    const service = criarService();
    const onSalvo = jest.fn();
    await render(
        <ContactLinkEditFlow
            contatoId={20}
            dadosIniciais={dadosIniciais}
            service={service}
            onCriarCategoria={jest.fn()}
            onSalvo={onSalvo}
        />
    );
    await screen.findByTestId('formulario-edicao');

    expect(propriedadesFormulario.modo).toBe('edicao');
    expect(propriedadesFormulario.aoCriarCategoria).toBeDefined();

    await fireEvent.press(screen.getByRole('button', { name: 'Alterar aparência' }));
    expect(propriedadesFormulario.alterado).toBe(true);

    await fireEvent.press(screen.getByRole('button', { name: 'Salvar edição' }));

    await waitFor(() => {
        expect(service.atualizar).toHaveBeenCalledWith(20, {
            tipo: 'categoria',
            categoriaId: 10,
            iconeId: 'sol',
            corId: 'azul',
            versao: configuracaoCategoria.versao
        });
    });
    expect(screen.queryByText('Desvincular categoria')).toBeNull();
    expect(onSalvo).toHaveBeenCalledTimes(1);
});

test('confirma antes de abrir o cadastro de uma categoria nova', async () => {
    const service = criarService(configuracaoIndividual);
    const onCriarCategoria = jest.fn();

    await render(
        <ContactLinkEditFlow
            contatoId={21}
            dadosIniciais={dadosIniciais}
            service={service}
            onCriarCategoria={onCriarCategoria}
        />
    );
    await screen.findByTestId('formulario-edicao');

    await fireEvent.press(screen.getByRole('button', { name: 'Cadastrar categoria nova' }));

    expect(screen.getByText('Vincular a categoria')).toBeOnTheScreen();
    expect(
        screen.getByText(
            'Esta ação remove as permissões individuais cadastradas e permite vincular o contato à nova categoria.'
        )
    ).toBeOnTheScreen();
    expect(onCriarCategoria).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

    expect(onCriarCategoria).toHaveBeenCalledTimes(1);
});

test('não menciona permissões individuais ao trocar uma categoria por outra', () => {
    const mensagem = obterMensagemConfirmacao({
        confirmacao: { tipo: 'categoria', categoriaId: 11 },
        configuracao: configuracaoCategoria,
        categoriaDestino: { id: 11, nome: 'Profissional' }
    });

    expect(mensagem).toBe(
        'Esta ação remove o contato da categoria ‘Família’ e o vincula à categoria ‘Profissional’.'
    );
    expect(mensagem).not.toContain('permissões individuais');
});

test('não menciona permissões individuais ao criar categoria a partir de outra categoria', () => {
    const mensagem = obterMensagemConfirmacao({
        confirmacao: { tipo: 'criar_categoria' },
        configuracao: configuracaoCategoria,
        categoriaDestino: null
    });

    expect(mensagem).toBe(
        'Esta ação permite substituir a categoria ‘Família’ por uma nova categoria.'
    );
});

test('mantém a tela e permite repetir quando a atualização falha', async () => {
    const service = criarService(configuracaoIndividual);
    service.atualizar
        .mockRejectedValueOnce(new Error('detalhe privado'))
        .mockResolvedValueOnce({ mensagem: 'Vínculo atualizado com sucesso.', vinculo: {} });

    await render(
        <ContactLinkEditFlow contatoId={21} dadosIniciais={dadosIniciais} service={service} />
    );
    await screen.findByTestId('formulario-edicao');
    await fireEvent.press(screen.getByRole('button', { name: 'Selecionar Família' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar edição' }));

    expect(await screen.findByText('Algo deu errado')).toBeOnTheScreen();
    expect(
        screen.getByText('Não foi possível atualizar o vínculo deste contato. Tente novamente.')
    ).toBeOnTheScreen();
    expect(screen.queryByText('detalhe privado')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() => expect(service.atualizar).toHaveBeenCalledTimes(2));
});

test('cancela a consulta ao desmontar', async () => {
    let sinal;
    const service = criarService();
    service.consultar = jest.fn((_id, { signal }) => {
        sinal = signal;
        return new Promise(() => {});
    });

    const resultado = await render(
        <ContactLinkEditFlow contatoId={20} dadosIniciais={dadosIniciais} service={service} />
    );
    await waitFor(() => expect(sinal).toBeDefined());

    await act(async () => resultado.unmount());
    expect(sinal.aborted).toBe(true);
});

test('detecta somente mudanças reais do vínculo', () => {
    expect(
        houveAlteracaoReal(configuracaoCategoria, {
            iconeId: 'coracao',
            corId: 'coral',
            categoriaId: 10,
            permissoesIndividuais: []
        })
    ).toBe(false);
    expect(
        houveAlteracaoReal(configuracaoCategoria, {
            iconeId: 'coracao',
            corId: 'coral',
            categoriaId: null,
            permissoesIndividuais: ['geral.fase_atual']
        })
    ).toBe(true);
    expect(
        houveAlteracaoReal(configuracaoIndividual, {
            iconeId: 'coracao',
            corId: 'coral',
            categoriaId: 10,
            permissoesIndividuais: []
        })
    ).toBe(true);

    expect(
        houveAlteracaoReal(configuracaoIndividual, {
            iconeId: 'sol',
            corId: 'azul',
            categoriaId: null,
            permissoesIndividuais: ['geral.fase_atual']
        })
    ).toBe(true);
});

test('monta alteração sem mesclar categoria e permissões individuais', () => {
    expect(
        criarAlteracao(configuracaoIndividual, {
            categoriaId: 10,
            permissoesIndividuais: ['x'],
            iconeId: 'sol',
            corId: 'azul'
        })
    ).toEqual({
        tipo: 'categoria',
        categoriaId: 10,
        iconeId: 'sol',
        corId: 'azul',
        versao: configuracaoIndividual.versao
    });
});
