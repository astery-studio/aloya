import { partesDaDataUso, formatarDataUso, estadoCalendarioUso } from '../../../../src/features/contraceptives/utils/usageHistory';

test.each(['2026-09-05', '2026-09-05T02:00:00Z', '05/09/2026'])(
    'interpreta a data programada %s sem deslocamento de fuso',
    (valor) => {
        expect(partesDaDataUso(valor)).toEqual({ ano: 2026, mes: 9, dia: 5, chaveMes: '2026-09' });
        expect(formatarDataUso(valor)).toBe('05/09/2026');
    }
);

test.each([null, '', '2026-09', '31/02/2026', '2026-13-01', 'abc'])(
    'não cria um registro de calendário para data inválida %s',
    (valor) => expect(partesDaDataUso(valor)).toBeNull()
);

test('normaliza os nomes de estado do histórico sem inventar estado para valores desconhecidos', () => {
    expect(estadoCalendarioUso('confirmadoForaPrazoHistoricoUso')).toBe('foraDoPrazo');
    expect(estadoCalendarioUso('nãoConfirmado')).toBe('naoConfirmado');
    expect(estadoCalendarioUso('Confirmado')).toBe('confirmado');
    expect(estadoCalendarioUso('desconhecido')).toBeNull();
});
