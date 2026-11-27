import { conteudoDaPrevia, listarPreviews } from '../../../src/features/notifications/notificationPreview';

test('padroniza os avisos de uso pendente do anticoncepcional compartilhado', () => {
    for (const [fase, prazo] of [
        ['naoConfirmado', 'Restam 4 horas'],
        ['moderados', 'Restam 3 horas'],
        ['criticos', 'Restam 2 horas'],
        ['fimJanela', 'O prazo do lembrete terminou']
    ]) {
        const { title, body } = conteudoDaPrevia(`redeApoio.anticoncepcional.${fase}`);
        expect(title).toBe('Uso pendente — anticoncepcional de Alex');
        expect(body).toContain('Pílula Aurora');
        expect(body).toContain(prazo);
    }
});

test('separa aplicação e troca nas prévias da agenda compartilhada', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));
    const avisos = tipos.filter(([codigo]) =>
        codigo.startsWith('redeApoio.anticoncepcional.aplicacoesTrocas')
    );
    const [aplicacao, troca] = avisos.map(([codigo, rotulo]) => conteudoDaPrevia(codigo, rotulo));
    expect(aplicacao.title).toBe('Aplicação do anticoncepcional de Alex');
    expect(aplicacao.body).toContain('Injetável Aurora');
    expect(troca.title).toBe('Troca do anticoncepcional de Alex');
    expect(troca.body).toContain('Adesivo Aurora');
});

test('explica qual link de autorização expirou e onde conferir o e-mail', () => {
    const { title, body } = conteudoDaPrevia('redeApoio.consentimento.expirado');
    expect(title).toBe('Link de autorização do responsável expirou');
    expect(body).toContain('liberar a Rede de Apoio');
    expect(body).toContain('Responsável Legal');
});
