import { organizarOpcoesEmLinhas } from '../../../../src/features/diary/utils/diaryOptionRows';

const opcao = (id, nome) => ({ id, nome });

test('mantém os níveis de cólica juntos antes dos demais sintomas', () => {
    const colicas = [
        opcao('sintomas_fisicos_sintomas_colicas_leves', 'Cólicas leves'),
        opcao('sintomas_fisicos_sintomas_colicas_moderadas', 'Cólicas moderadas'),
        opcao('sintomas_fisicos_sintomas_colicas_intensas', 'Cólicas intensas')
    ];
    const outro = opcao('outro', 'Fadiga');
    expect(organizarOpcoesEmLinhas([outro, ...colicas])).toEqual([
        colicas.slice(0, 2),
        colicas.slice(2),
        [outro]
    ]);
});

test('isola opção grande e combina as menores dentro do limite', () => {
    const grande = opcao('grande', 'Sensação de esvaziamento incompleto');
    const pequenas = [opcao('dor', 'Dor'), opcao('normal', 'Normal')];
    expect(organizarOpcoesEmLinhas([grande, ...pequenas])).toEqual([[grande], pequenas]);
    expect(organizarOpcoesEmLinhas([pequenas[0], grande])).toEqual([[pequenas[0]], [grande]]);
});
