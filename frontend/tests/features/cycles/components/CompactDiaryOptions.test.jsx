import { fireEvent, screen } from '@testing-library/react-native';
import { CompactDiaryOptions } from '../../../../src/features/cycles/components/home/CompactDiaryOptions';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

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
