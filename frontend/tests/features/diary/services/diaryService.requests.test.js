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

    test('atualiza uma macrocategoria com a versão atual', async () => {
        const catalogo = { versao: 3, macrocategorias: [] };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(catalogo);
        const service = criarDiaryService({ requisicaoAutenticada });

        await expect(service.atualizarMacrocategoria('energia_sono', false, 2)).resolves.toBe(
            catalogo
        );
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: '/api/diario/preferencias/macrocategorias/energia_sono',
            corpo: { ativa: false, versao: 2 }
        });
    });

    test('atualiza uma categoria e encaminha o sinal opcional', async () => {
        const signal = new AbortController().signal;
        const catalogo = { versao: 4, macrocategorias: [] };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(catalogo);
        const service = criarDiaryService({ requisicaoAutenticada });

        await service.atualizarCategoria('qualidade_sono', true, 3, { signal });
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PATCH',
            caminho: '/api/diario/preferencias/categorias/qualidade_sono',
            corpo: { ativa: true, versao: 3 },
            signal
        });
    });

    test.each([
        ['', true, 0],
        ['energia_sono', 'sim', 0],
        ['energia_sono', true, -1]
    ])('rejeita preferência inválida antes da requisição', async (id, ativa, versao) => {
        const requisicaoAutenticada = jest.fn();
        const service = criarDiaryService({ requisicaoAutenticada });

        await expect(service.atualizarMacrocategoria(id, ativa, versao)).rejects.toBeInstanceOf(
            TypeError
        );
        expect(requisicaoAutenticada).not.toHaveBeenCalled();
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

    test('edita o registro com PUT e a versão no If-Match', async () => {
        const dados = { data: '2026-11-08', fusoHorario: 'America/Sao_Paulo', categorias: [] };
        const registro = { id: 4, data: dados.data, categorias: [] };
        const requisicaoAutenticada = jest.fn().mockResolvedValue(registro);
        const service = criarDiaryService({ requisicaoAutenticada });

        await expect(service.editarRegistro(4, 2, dados)).resolves.toBe(registro);
        expect(requisicaoAutenticada).toHaveBeenCalledWith({
            metodo: 'PUT',
            caminho: '/api/diario/registros/4',
            corpo: dados,
            ifMatch: '"2"'
        });
    });
});
