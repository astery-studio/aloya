import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { DiaryCategoriesSheet } from '../../../../src/features/diary/components/DiaryCategoriesSheet/DiaryCategoriesSheet';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const macros = [
    ['ciclo_sangramento', 'Ciclo e Sangramento', 'fluxo_menstrual', 'Fluxo menstrual'],
    ['corpo_sintomas_fisicos', 'Corpo e Sintomas Físicos', 'pele', 'Pele'],
    ['emocional', 'Emocional', 'humor', 'Humor'],
    ['energia_sono', 'Energia e Sono', 'qualidade_sono', 'Qualidade do sono'],
    ['vida_intima_social', 'Vida Íntima e Social', 'vida_social', 'Vida social'],
    ['saude_acompanhamento', 'Saúde e Acompanhamento', 'consultas', 'Consultas']
];

function criarCatalogo(versao = 0) {
    return {
        versao,
        macrocategorias: macros.map(([id, nome, categoriaId, categoriaNome], ordem) => ({
            id,
            nome,
            ordem,
            ativa: true,
            categorias: [
                {
                    id: categoriaId,
                    nome: categoriaNome,
                    ativaIndividual: true,
                    ativaEfetiva: true
                }
            ]
        }))
    };
}

test('lista as seis macros no sheet e expande suas categorias', async () => {
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(criarCatalogo()) };
    await render(<DiaryCategoriesSheet visivel service={service} onFechar={jest.fn()} />);

    expect(screen.getByRole('header', { name: 'Gerências Categorias' })).toBeOnTheScreen();
    await waitFor(() => expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen());
    for (const [, nome] of macros) expect(screen.getByText(nome)).toBeOnTheScreen();
    await waitFor(() => {
        expect(screen.queryByText('Fluxo menstrual')).toBeNull();
        expect(screen.queryByText('Pele')).toBeNull();
    });

    fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));
    await waitFor(() => expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen());
    fireEvent.press(screen.getByRole('button', { name: 'Expandir Corpo e Sintomas Físicos' }));
    await waitFor(() => expect(screen.getByText('Pele')).toBeOnTheScreen());
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveStyle({
        width: 342,
        maxWidth: '100%',
        height: 54,
        paddingTop: 15.375,
        paddingBottom: 14.625
    });
});

test('fecha pelo X ou por Salvar sem exigir nova persistência', async () => {
    const onFechar = jest.fn();
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(criarCatalogo()) };
    await render(<DiaryCategoriesSheet visivel service={service} onFechar={onFechar} />);
    await waitFor(() => expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen());

    await fireEvent.press(screen.getByRole('button', { name: 'Fechar painel' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(onFechar).toHaveBeenCalledTimes(2);
});

test('desativa filhos visualmente sem apagar seu estado individual', async () => {
    const inicial = criarCatalogo();
    const atualizado = criarCatalogo(1);
    atualizado.macrocategorias[0] = {
        ...atualizado.macrocategorias[0],
        ativa: false,
        categorias: atualizado.macrocategorias[0].categorias.map((categoria) => ({
            ...categoria,
            ativaEfetiva: false
        }))
    };
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(inicial),
        atualizarMacrocategoria: jest.fn().mockResolvedValue(atualizado)
    };
    await render(<DiaryCategoriesSheet visivel service={service} onFechar={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen());

    await fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));

    await fireEvent.press(screen.getByRole('switch', { name: 'Desativar Ciclo e Sangramento' }));

    await waitFor(() => expect(screen.getByText('5 / 6 ativos')).toBeOnTheScreen());
    expect(service.atualizarMacrocategoria).toHaveBeenCalledWith('ciclo_sangramento', false, 0);
    expect(screen.getByRole('switch', { name: 'Desativar Fluxo menstrual' })).toBeDisabled();
});

test('reverte uma categoria e oferece nova tentativa após erro', async () => {
    const service = {
        buscarCatalogo: jest.fn().mockResolvedValue(criarCatalogo()),
        atualizarCategoria: jest.fn().mockRejectedValue(new Error('rede indisponível'))
    };
    await render(<DiaryCategoriesSheet visivel service={service} onFechar={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));

    await fireEvent.press(screen.getByRole('switch', { name: 'Desativar Fluxo menstrual' }));

    await waitFor(() => expect(screen.getByText('Algo deu errado')).toBeOnTheScreen());
    expect(screen.getByText(/Ocorreu um erro ao gerenciar categorias/)).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Desativar Fluxo menstrual' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeOnTheScreen();
});

test('fecha todas as macrocategorias sempre que o sheet reabre', async () => {
    const service = { buscarCatalogo: jest.fn().mockResolvedValue(criarCatalogo()) };
    const resultado = await render(
        <DiaryCategoriesSheet visivel service={service} onFechar={jest.fn()} />
    );
    await waitFor(() => expect(screen.getByText('6 / 6 ativos')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Expandir Ciclo e Sangramento' }));
    expect(screen.getByText('Fluxo menstrual')).toBeOnTheScreen();

    await resultado.rerender(
        <DiaryCategoriesSheet visivel={false} service={service} onFechar={jest.fn()} />
    );
    await resultado.rerender(
        <DiaryCategoriesSheet visivel service={service} onFechar={jest.fn()} />
    );

    await waitFor(() => expect(screen.queryByText('Fluxo menstrual')).toBeNull());
    for (const [, nome] of macros) {
        expect(screen.getByRole('button', { name: `Expandir ${nome}` })).toBeOnTheScreen();
    }
});
