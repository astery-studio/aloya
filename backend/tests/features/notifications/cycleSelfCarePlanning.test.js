import assert from 'node:assert/strict';
import test from 'node:test';
import { planejarCiclo } from '../../../src/features/notifications/cyclePushPlanning.js';

test('limita as dicas ao intervalo estimado de cada fase', () => {
    const dias = [];
    planejarCiclo({
        previsao: {
            fasesEstimadas: {
                folicularPosMenstrual: { inicio: '2026-10-10', fim: '2026-10-12' },
                ovulatoria: { data: '2026-10-13' },
                lutea: { inicio: '2026-10-14', fim: '2026-10-23' }
            }
        },
        registrosDiario: [],
        hoje: '2026-10-10',
        amanha: '2026-10-11',
        porDia: (evento, dia) => {
            if (evento.startsWith('ciclo.dicas.')) dias.push([evento, dia]);
        }
    });
    assert.deepEqual(dias, [
        ['ciclo.dicas.folicular', '2026-10-11'],
        ['ciclo.dicas.ovulatoria', '2026-10-13'],
        ['ciclo.dicas.lutea', '2026-10-15'],
        ['ciclo.dicas.lutea', '2026-10-17'],
        ['ciclo.dicas.lutea', '2026-10-19']
    ]);
});
