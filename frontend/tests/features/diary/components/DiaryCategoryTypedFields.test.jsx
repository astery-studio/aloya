import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../../src/features/diary/config/diaryOptionPresentation', () => ({
    obterApresentacaoOpcao: jest.fn()
}));
jest.mock('../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon', () => ({
    DiaryOptionIcon: () => null
}));

import {
    calcularAlturaAnotacao,
    DiaryCategoryField
} from '../../../../src/features/diary/components/DiaryCategoryField/DiaryCategoryField';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const temperatura = {
    id: 'temperatura_basal',
    nome: 'Temperatura basal',
    tipoValor: 'decimal_escalado',
    unidade: '°C',
    casasDecimais: 1,
    valorMinimo: '32.0',
    valorMaximo: '42.0'
};
const peso = {
    id: 'peso',
    nome: 'Peso',
    tipoValor: 'decimal_escalado',
    unidade: 'kg',
    casasDecimais: 1,
    valorMinimo: null,
    valorMaximo: null
};
const sono = { id: 'tempo_sono', nome: 'Tempo de sono', tipoValor: 'duracao_minutos' };
const nota = {
    id: 'anotacao_livre',
    nome: 'Anotação livre',
    tipoValor: 'texto',
    limiteCaracteres: 5000
};

describe('campos tipados do Diário', () => {
    test('expande a anotação sem criar rolagem interna', () => {
        expect(calcularAlturaAnotacao(10)).toBe(36);
        expect(calcularAlturaAnotacao(100)).toBe(112);
        expect(calcularAlturaAnotacao(500)).toBe(512);
    });

    test('renderiza temperatura com limites do backend', async () => {
        const aoAlterar = jest.fn();
        const resultado = await render(
            <DiaryCategoryField
                categoria={temperatura}
                valor="36,5"
                aoAlterar={aoAlterar}
                erro="Erro"
            />
        );
        const entrada = screen.getByLabelText('Temperatura basal');
        expect(entrada).toHaveProp('accessibilityValue', { min: 32, max: 42, now: 36.5 });
        await fireEvent.changeText(entrada, '37,1');
        expect(aoAlterar).toHaveBeenCalledWith('37,1');
        await resultado.rerender(<DiaryCategoryField categoria={peso} valor={null} />);
        expect(screen.getByLabelText('Peso')).toHaveProp('accessibilityValue', {});
    });

    test('renderiza duração e encaminha seu erro', async () => {
        await render(<DiaryCategoryField categoria={sono} valor={80} erro="Duração inválida" />);
        expect(screen.getByRole('alert')).toHaveTextContent('Duração inválida');
    });

    test('renderiza anotação longa com contador em tempo real', async () => {
        const aoAlterar = jest.fn();
        const resultado = await render(
            <DiaryCategoryField categoria={nota} valor="Olá" aoAlterar={aoAlterar} paleta="saude" />
        );
        const entrada = screen.getByLabelText('Digite aqui sua nota...');
        expect(entrada).toHaveProp('scrollEnabled', false);
        expect(entrada).toHaveStyle({
            minHeight: 24,
            height: 24,
            fontSize: 13,
            textAlign: 'justify',
            textAlignVertical: 'top',
            color: '#4A5899'
        });
        await fireEvent(entrada, 'contentSizeChange', {
            nativeEvent: { contentSize: { height: 100 } }
        });
        expect(entrada).toHaveStyle({ height: 100 });
        expect(screen.getByText('3 / 5000')).toBeOnTheScreen();
        expect(screen.getByText('3 / 5000')).toHaveStyle({ color: '#4A5899' });
        await fireEvent.press(screen.getByRole('button', { name: 'Limpar anotação livre' }));
        expect(aoAlterar).toHaveBeenLastCalledWith('');
        expect(entrada).toHaveStyle({ height: 24 });
        await fireEvent.changeText(entrada, 'Nova nota');
        await resultado.rerender(<DiaryCategoryField categoria={nota} valor={null} />);
        expect(screen.getByLabelText('Digite aqui sua nota...')).toHaveStyle({
            textAlign: 'center'
        });
        expect(screen.getByText('0 / 5000')).toBeOnTheScreen();
        expect(screen.queryByRole('button', { name: 'Limpar anotação livre' })).toBeNull();
    });
});
