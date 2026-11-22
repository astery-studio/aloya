import { AppError } from '../../../shared/errors/AppError.js';

function normalizarDecimal(valor, casasDecimais = 1) {
    const texto = typeof valor === 'number' && Number.isFinite(valor) ? String(valor) : valor;
    const padrao = new RegExp(`^-?\\d+(?:[.,]\\d{1,${casasDecimais}})?$`);

    if (typeof texto !== 'string' || !padrao.test(texto)) {
        throw new AppError(
            `Informe um número com até ${casasDecimais} casa decimal.`,
            422,
            'VALOR_DECIMAL_INVALIDO'
        );
    }

    const negativo = texto.startsWith('-');
    const [inteiro, fracao = ''] = texto.replace('-', '').replace(',', '.').split('.');
    const escala = 10 ** casasDecimais;
    const escalado = Number(inteiro) * escala + Number(fracao.padEnd(casasDecimais, '0'));

    if (!Number.isSafeInteger(escalado)) {
        throw new AppError('O valor numérico é muito grande.', 422, 'VALOR_DECIMAL_INVALIDO');
    }

    return {
        valorEscalado: negativo ? -escalado : escalado,
        casasDecimais
    };
}

export { normalizarDecimal };
