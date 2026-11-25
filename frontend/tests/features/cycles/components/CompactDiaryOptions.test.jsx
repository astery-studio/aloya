import { fireEvent, screen } from '@testing-library/react-native';
import { CompactDiaryOptions } from '../../../../src/features/cycles/components/home/CompactDiaryOptions';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

jest.mock('../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon', () => {
    const { Text } = require('react-native');
    return {
        DiaryOptionIcon: ({ iconeId, color }) => <Text testID={iconeId} style={{ color }} />
    };
});

const fisicos = ['Fadiga', 'Retenção de líquidos', 'Inchaço', 'Sensibilidade', 'Dor de cabeça'];
const preMenstruais = [
    'Irritabilidade',
    'Oscilações de humor',
    'Diminuição da motivação',
    'Choro fácil'
];
const fluxos = ['Ausente', 'Muito leve', 'Leve', 'Moderado', 'Intenso', 'Muito intenso'];
const energias = ['Sem energia', 'Com energia', 'Exausto', 'Cansado', 'Disposto', 'Agitado'];
const emocionais = ['Feliz', 'Animado', 'Tranquilo', 'Motivado', 'Otimista', 'Reflexivo'];
const categoria = (id, nomes) => ({
    id,
    ativaEfetiva: true,
    opcoes: nomes.map((nome) => ({
        id: `${id}_${nome.toLowerCase().replaceAll(' ', '_')}`,
        nome
    }))
});
const catalogo = {
    macrocategorias: [
        {
            ativa: true,
            categorias: [
                categoria('fluxo_menstrual', fluxos),
                categoria('sintomas_fisicos', fisicos),
                categoria('sintomas_pre_menstruais', preMenstruais),
                categoria('sintomas_emocionais', emocionais),
                categoria('energia', energias)
            ]
        }
    ]
};

test('mostra oito sugestões da fase priorizando o histórico pessoal', async () => {
    const aoAlterar = jest.fn();
    await render(
        <CompactDiaryOptions
            catalogo={catalogo}
            fase="lutea"
            destaques={[{ categoriaId: 'sintomas_fisicos', valor: 'Fadiga', ocorrencias: 4 }]}
            valores={{}}
            aoAlterar={aoAlterar}
        />
    );

    expect(screen.getAllByRole('button')).toHaveLength(8);
    expect(screen.getByText('Fadiga')).toBeOnTheScreen();
    expect(screen.getByText('Retenção de líquidos')).toBeOnTheScreen();
    expect(screen.getByText('Oscilações de humor')).toBeOnTheScreen();
    expect(screen.getByText('Energia')).toBeOnTheScreen();
    expect(screen.getByText('Sintomas emocionais')).toBeOnTheScreen();
    expect(screen.queryByText('Intensidade fluxo menstrual')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Fadiga' }));
    expect(aoAlterar).toHaveBeenCalledWith('sintomas_fisicos', ['sintomas_fisicos_fadiga']);
});

test('mantém a seleção e permite desmarcar uma sugestão sem ícone do catálogo', async () => {
    const aoAlterar = jest.fn();
    const catalogoSemIcone = {
        macrocategorias: [{ categorias: [categoria('sintomas_fisicos', ['Sensação incomum'])] }]
    };
    await render(
        <CompactDiaryOptions
            catalogo={catalogoSemIcone}
            fase="lutea"
            valores={{ sintomas_fisicos: ['sintomas_fisicos_sensação_incomum'] }}
            aoAlterar={aoAlterar}
        />
    );

    const opcao = screen.getByRole('button', { name: 'Sensação incomum' });
    expect(opcao).toBeSelected();
    await fireEvent.press(opcao);
    expect(aoAlterar).toHaveBeenCalledWith('sintomas_fisicos', []);
});

test.each([true, false])('mantém a cor de seleção do ícone de fluxo (%s)', async (selected) => {
    const id = 'fluxo_menstrual_aspecto_vermelho_vivo';
    const categoriaFluxo = {
        id: 'fluxo_menstrual',
        opcoes: [{ id, grupo: 'aspecto', nome: 'Vermelho vivo' }]
    };
    await render(
        <CompactDiaryOptions
            catalogo={{ macrocategorias: [{ categorias: [categoriaFluxo] }] }}
            fase="menstrual"
            valores={{ fluxo_menstrual: selected ? [id] : [] }}
        />
    );

    const opcao = screen.getByRole('button', { name: 'Vermelho vivo' });
    expect(opcao.props.accessibilityState.selected).toBe(selected);
    const icone = screen.getByTestId('ciclo-fluxo-menstrual-aspecto-vermelho-vivo');
    if (selected) {
        expect(icone).not.toHaveStyle({ color: '#CB442A' });
    } else {
        expect(icone).toHaveStyle({ color: '#CB442A' });
    }
});
