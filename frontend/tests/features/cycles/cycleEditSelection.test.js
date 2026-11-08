import { contarEpisodios } from '../../../src/features/cycles/utils/cycleEditSelection';

test.each([
    [[], 0],
    [['2026-08-01'], 1],
    [['2026-08-01', '2026-08-04'], 1],
    [['2026-08-01', '2026-08-05'], 2],
    [['2026-08-01', '2026-08-05', '2026-08-30'], 3],
    [['2026-09-02', '2026-08-30'], 1],
    [['2027-01-03', '2026-12-30'], 2]
])('agrupa %j em %i episódios com no máximo dois dias de pausa', (dias, total) => {
    expect(contarEpisodios(dias)).toBe(total);
});
