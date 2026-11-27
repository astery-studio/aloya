import assert from 'node:assert/strict';
import test from 'node:test';
import { agruparDias } from '../../../../src/features/cycles/services/cycleEditDays.service.js';

for (const [datas, total] of [
    [[], 0],
    [['2026-08-01'], 1],
    [['2026-08-01', '2026-08-04'], 1],
    [['2026-08-01', '2026-08-05'], 2],
    [['2026-08-30', '2026-09-02'], 1],
    [['2026-12-30', '2027-01-03'], 2]
])
    test(`agrupa ${JSON.stringify(datas)} em ${total} episódios`, () => {
        const dias = datas.map((data) => new Date(`${data}T00:00:00Z`));
        const copia = [...dias];
        assert.equal(agruparDias(dias).length, total);
        assert.deepEqual(dias, copia);
    });
