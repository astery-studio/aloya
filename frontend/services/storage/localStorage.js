//Armazena pequenas preferências locais que não precisam ficar no backend
import AsyncStorage from '@react-native-async-storage/async-storage';

const prefixoDaAplicacao = '@aloya:local:';
const limiteDeCaracteres = 100000;
const termosSensiveis = Object.freeze(['token', 'senha', 'password', 'secret', 'jwt', 'credencial', 'refresh', 'sessao', 'session']);

const mensagemErroSalvar = 'Não foi possível salvar a informação neste aparelho.';
const mensagemErroLer = 'Não foi possível ler a informação salva neste aparelho.';
const mensagemErroRemover = 'Não foi possível remover a informação deste aparelho.';

function validarChave(chave) {
    if (typeof chave !== 'string') {
        throw new Error('A chave do armazenamento local precisa ser um texto.');
    }

    const chaveLimpa = chave.trim();

    if (!/^[a-zA-Z0-9:_-]{1,64}$/.test(chaveLimpa)) {
        throw new Error('A chave do armazenamento local é inválida.');
    }

    const chaveComparavel = chaveLimpa.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const possuiTermoSensivel = termosSensiveis.some((termo) => chaveComparavel.includes(termo));

    if (possuiTermoSensivel) {
        throw new Error('Dados sensíveis não podem ser salvos no armazenamento local comum.');
    }

    return `${prefixoDaAplicacao}${chaveLimpa}`;
}

function serializarValor(valor) {
    if (valor === undefined || typeof valor === 'function' || typeof valor === 'symbol') {
        throw new Error('O valor informado não pode ser salvo no armazenamento local.');
    }

    let valorSerializado;

    try {
        valorSerializado = JSON.stringify(valor);
    } catch {
        throw new Error('O valor informado não pode ser salvo no armazenamento local.');
    }

    if (typeof valorSerializado !== 'string' || valorSerializado.length > limiteDeCaracteres) {
        throw new Error('O valor informado é maior que o limite do armazenamento local.');
    }

    return valorSerializado;
}

async function salvarDadoLocal(chave, valor) {
    const chaveInterna = validarChave(chave);
    const valorSerializado = serializarValor(valor);

    try {
        await AsyncStorage.setItem(chaveInterna, valorSerializado);
    } catch {
        throw new Error(mensagemErroSalvar);
    }
}

async function obterDadoLocal(chave) {
    const chaveInterna = validarChave(chave);

    try {
        const valorSerializado = await AsyncStorage.getItem(chaveInterna);

        if (valorSerializado === null) {
            return null;
        }

        return JSON.parse(valorSerializado);
    } catch {
        throw new Error(mensagemErroLer);
    }
}

async function removerDadoLocal(chave) {
    const chaveInterna = validarChave(chave);

    try {
        await AsyncStorage.removeItem(chaveInterna);
    } catch {
        throw new Error(mensagemErroRemover);
    }
}

export { salvarDadoLocal, obterDadoLocal, removerDadoLocal };