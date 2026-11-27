import { fireEvent, screen } from '@testing-library/react-native';
import { PlantIcon } from 'phosphor-react-native/src/icons/Plant';
import { WavesIcon } from 'phosphor-react-native/src/icons/Waves';
import { StyleSheet } from 'react-native';
import { CycleEducationSection } from '../../../../src/features/cycles/components/CycleEducationSection';
import { CONTEUDOS_EDUCATIVOS } from '../../../../src/features/cycles/constants/cycleEducationContent';
import { DropIcon, SunIcon } from '../../../../src/shared/components/icons/AppIcons';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

test('alterna o conteúdo educativo das quatro fases', async () => {
    await render(<CycleEducationSection />);
    expect(screen.getByText(/revestimento interno/)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Ovulatória' }));

    expect(screen.getByText(/fertilidade estimada/)).toBeOnTheScreen();
    expect(screen.getByText(/não possuem duração fixa/)).toBeOnTheScreen();
});

test('na perspectiva do contato oferece as quatro fases e usa seleção educativa independente', async () => {
    const { rerender } = await render(
        <CycleEducationSection perspectiva="contato" faseSelecionada="lutea" />
    );

    expect(screen.getByText('Conhecimento sem expectativas')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Entenda cada fase' })).toBeOnTheScreen();
    expect(screen.getByText(/sem criar expectativas/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Menstrual' })).toBeSelected();
    expect(screen.getAllByRole('button')).toHaveLength(4);

    await fireEvent.press(screen.getByRole('button', { name: 'Folicular' }));
    await rerender(<CycleEducationSection perspectiva="contato" faseSelecionada="ovulatoria" />);

    expect(screen.getByRole('button', { name: 'Folicular' })).toBeSelected();
    expect(screen.getByText('Fase folicular')).toBeOnTheScreen();
    expect(screen.getByText(/não possuem duração fixa/)).toBeOnTheScreen();
});

test.each([
    ['menstrual', DropIcon, 'fill', '#C85A44'],
    ['folicular', PlantIcon, 'regular', '#2C4C3B'],
    ['ovulatoria', SunIcon, 'regular', '#4A758E'],
    ['lutea', WavesIcon, 'regular', '#D68C3A']
])('usa o ícone do protótipo sem caixa colorida na fase %s', async (fase, Icone, weight, cor) => {
    expect(CONTEUDOS_EDUCATIVOS[fase]).toMatchObject({ Icone, weight, cor });
    await render(<CycleEducationSection />);
    const icone = screen.getByTestId(`icone-fase-educativa-${fase}`);
    expect(StyleSheet.flatten(icone.props.style).backgroundColor).toBeUndefined();
});

test('mostra o conteúdo menstrual quando a fase solicitada não existe', async () => {
    const menstrual = { ...CONTEUDOS_EDUCATIVOS.menstrual, weight: undefined };
    const aoSelecionarFase = jest.fn();
    await render(
        <CycleEducationSection
            faseSelecionada="desconhecida"
            conteudos={{ menstrual }}
            aoSelecionarFase={aoSelecionarFase}
        />
    );

    expect(screen.getByText(menstrual.titulo)).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Menstrual' }));
    expect(aoSelecionarFase).toHaveBeenCalledWith('menstrual');
});
