import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('../../../../src/features/diary/config/diaryOptionPresentation', () => ({
    obterApresentacaoOpcao: jest.fn()
}));
jest.mock('../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon', () => ({ DiaryOptionIcon: () => null }));

import { DiaryCategoryField } from '../../../../src/features/diary/components/DiaryCategoryField/DiaryCategoryField';
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
        await render(
            <DiaryCategoryField categoria={nota} valor="Olá" aoAlterar={aoAlterar} desabilitado />
        );
        const entrada = screen.getByLabelText('Digite aqui sua nota...');
        expect(screen.getByText('3 / 5000')).toBeOnTheScreen();
        await fireEvent.changeText(entrada, 'Nova nota');
    });
});
