import { criarDiaryService } from '../../../../src/features/diary/services/diaryService';

describe('requisições do serviço do Diário', () => {
    test('busca o catálogo autenticado sem sinal opcional', async () => {
        const catalogo = { versao: 1, macrocategorias: [] };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(catalogo);
        const service = criarDiaryService({ requisicaoAutenticada });

        await expect(service.buscarCatalogo()).resolves.toBe(catalogo);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/api/diario/catalogo'
        });
    });

    test('encaminha o sinal ao buscar o catálogo', async () => {
        const signal = new AbortController().signal;
        const requisicaoAutenticada = jest
            .fn()
            .mockResolvedValue({ versao: 0, macrocategorias: [] });
        const service = criarDiaryService({ requisicaoAutenticada });

        await service.buscarCatalogo({ signal });
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'GET',
            caminho: '/api/diario/catalogo',
            signal
        });
    });

    test('cria o registro com o corpo informado', async () => {
        const dados = { data: '2026-11-09', fusoHorario: 'America/Sao_Paulo', categorias: [] };
        const registro = { id: 1, data: dados.data, categorias: [] };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(registro);
        const service = criarDiaryService({ requisicaoAutenticada });

        await expect(service.criarRegistro(dados)).resolves.toBe(registro);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'POST',
            caminho: '/api/diario/registros',
            corpo: dados
        });
    });
});
