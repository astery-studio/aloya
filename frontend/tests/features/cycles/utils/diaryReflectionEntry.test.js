import {
    calcularCapacidadeAnotacao,
    formatarHorario,
    montarAnotacaoHome
} from '../../../../src/features/cycles/utils/diaryReflectionEntry';

test('formata e acrescenta a anotação com horário e quebra final', () => {
    const agora = new Date(2026, 10, 26, 7, 5);

    expect(formatarHorario(agora)).toBe('07:05');
    expect(
        montarAnotacaoHome({
            anotacaoExistente: 'Anterior\n',
            texto: 'Preciso descansar',
            agora
        })
    ).toBe('Anterior\n07:05: Preciso descansar\n');
});

test('separa uma anotação antiga que não termina em quebra de linha', () => {
    expect(
        montarAnotacaoHome({
            anotacaoExistente: 'Anterior',
            texto: 'Nova',
            agora: new Date(2026, 10, 26, 19, 30)
        })
    ).toBe('Anterior\n19:30: Nova\n');
});

test('inicia o campo da Home com cem caracteres livres', () => {
    expect(calcularCapacidadeAnotacao('')).toEqual({
        caracteresExistentes: 0,
        caracteresEstruturais: 8,
        limiteContador: 100,
        limiteTexto: 100,
        semEspaco: false,
        separador: ''
    });
});

test('reduz o limite conforme o espaço restante no Diário', () => {
    const existente = `${'a'.repeat(4949)}\n`;

    expect(calcularCapacidadeAnotacao(existente)).toMatchObject({
        caracteresEstruturais: 8,
        limiteContador: 42,
        limiteTexto: 42,
        semEspaco: false
    });
    expect(
        montarAnotacaoHome({
            anotacaoExistente: existente,
            texto: 'b'.repeat(100),
            agora: new Date(2026, 10, 26, 19, 30)
        })
    ).toHaveLength(5000);
});

test('bloqueia a anotação quando só cabe horário, separador e quebra', () => {
    const existente = `${'a'.repeat(4991)}\n`;
    const capacidade = calcularCapacidadeAnotacao(existente);

    expect(capacidade).toMatchObject({
        caracteresEstruturais: 8,
        limiteContador: 0,
        limiteTexto: 0,
        semEspaco: true
    });
    expect(
        montarAnotacaoHome({
            anotacaoExistente: existente,
            texto: 'x',
            agora: new Date(2026, 10, 26, 19, 30)
        })
    ).toBeNull();
});
