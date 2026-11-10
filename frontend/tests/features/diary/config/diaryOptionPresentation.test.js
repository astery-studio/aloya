import { CATALOGO_DIARIO } from '../../../../../backend/src/features/diary/catalog/diary.catalog';
import { diaryIcons } from '../../../../src/shared/components/icons/DiaryIcons';
import {
    criarSlug,
    obterApresentacaoOpcao
} from '../../../../src/features/diary/config/diaryOptionPresentation';

describe('apresentação das opções do Diário', () => {
    const opcoes = CATALOGO_DIARIO.flatMap((macro) =>
        macro.categorias.flatMap((categoria) =>
            categoria.opcoes.map((opcao) => ({ categoria, opcao }))
        )
    );

    test('associa as 305 opções a chaves únicas existentes', () => {
        const apresentacoes = opcoes.map(({ categoria, opcao }) =>
            obterApresentacaoOpcao(categoria.id, opcao)
        );
        expect(apresentacoes).toHaveLength(305);
        expect(apresentacoes).not.toContain(null);
        expect(new Set(apresentacoes.map(({ iconeId }) => iconeId)).size).toBe(305);
        for (const { iconeId } of apresentacoes) expect(diaryIcons[iconeId]).toBeDefined();
    });

    test('preserva cor e preenchimento especiais', () => {
        const gota = obterApresentacaoOpcao('fluxo_menstrual', {
            id: 'fluxo_menstrual_aspecto_vermelho_vivo',
            grupo: 'aspecto',
            nome: 'Vermelho vivo'
        });
        expect(gota.iconeProps).toEqual({ weight: 'fill', color: '#CB442A' });

        const coagulos = obterApresentacaoOpcao('fluxo_menstrual', {
            id: 'fluxo_menstrual_coagulos_muitos',
            grupo: 'coagulos',
            nome: 'Muitos'
        });
        expect(coagulos.iconeProps).toEqual({ weight: 'fill' });
    });

    test('rejeita associação desconhecida sem fallback silencioso', () => {
        expect(obterApresentacaoOpcao('inexistente', { id: 'x', grupo: 'x', nome: 'X' })).toBeNull();
        expect(criarSlug('  Óleo / Água  ')).toBe('oleo-agua');
    });
});
