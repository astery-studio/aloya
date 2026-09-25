import { calcularPeriodosDePausa } from '../../domain/contraceptive/ContraceptiveSchedule';
import { obterFrequencia, obterFrequencias } from '../../features/contraceptives/constants/contraceptiveOptions';
import { validarAnticoncepcional } from '../../features/contraceptives/utils/contraceptiveValidation';

const base = { nome: 'Mercilon', tipo: 'pilula', frequenciaId: 'pilula_continuo', horarios: ['08:00'], intensidadeAlerta: '' };

test('expõe somente as frequências compatíveis com cada tipo', () => {
    expect(obterFrequencias('adesivo').map((item) => item.id)).toEqual(['adesivo_continuo', 'adesivo_3_1']);
    expect(obterFrequencias('diu_hormonal')).toEqual([]);
});

test('exige nome e ao menos um horário', () => {
    expect(validarAnticoncepcional({ ...base, nome: '' }, '2026-09-24')).toBe('Informe o nome do anticoncepcional.');
    expect(validarAnticoncepcional({ ...base, horarios: [] }, '2026-09-24')).toBe('Informe ao menos um horário de uso.');
});

test('aceita múltiplos horários somente para pílula diária', () => {
    expect(validarAnticoncepcional({ ...base, horarios: ['08:00', '20:00'] }, '2026-09-24')).toBeNull();
    expect(validarAnticoncepcional({ ...base, tipo: 'adesivo', frequenciaId: 'adesivo_continuo', horarios: ['08:00', '20:00'] }, '2026-09-24')).toBe('Este tipo de anticoncepcional aceita somente um horário.');
});

test('DIU hormonal exige validade atual ou futura e dispensa horário', () => {
    const diu = { nome: 'Mirena', tipo: 'diu_hormonal', horarios: [] };
    expect(validarAnticoncepcional({ ...diu, dataValidade: '2026-09-23' }, '2026-09-24')).toContain('data de validade');
    expect(validarAnticoncepcional({ ...diu, dataValidade: '2026-09-24' }, '2026-09-24')).toBeNull();
});

test('calcula pausas subsequentes e não cria pausa no uso contínuo', () => {
    const ciclica = obterFrequencia('pilula', 'pilula_21_7');
    expect(calcularPeriodosDePausa('2026-09-01', ciclica, 2)).toEqual([
        { inicio: '2026-09-22', fim: '2026-09-28' },
        { inicio: '2026-10-20', fim: '2026-10-26' }
    ]);
    expect(calcularPeriodosDePausa('2026-09-01', obterFrequencia('pilula', 'pilula_continuo'))).toEqual([]);
});
