import { conteudoDaPrevia, listarPreviews } from '../../../src/features/notifications/notificationPreview';

test('lista uma dica prática para o contato em cada fase da Rede de Apoio', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));
    const dicas = tipos
        .filter(([codigo]) => codigo.startsWith('redeApoio.dicas.apoio.'))
        .map(([codigo, rotulo]) => conteudoDaPrevia(codigo, rotulo));
    expect(dicas).toHaveLength(4);
    expect(new Set(dicas.map(({ body }) => body)).size).toBe(4);
    expect(dicas.map(({ body }) => body)).toEqual([
        expect.stringContaining('bolsa térmica'),
        expect.stringContaining('repor os itens'),
        expect.stringContaining('quando começou e quanto durou'),
        expect.stringContaining('fazer o jantar ou cuidar da louça')
    ]);
});

test('oferece três dicas diferentes por fase na barra de notificações', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));

    for (const fase of ['menstrual', 'folicular', 'ovulatoria', 'lutea']) {
        const dicas = tipos
            .filter(([codigo]) => codigo.startsWith(`ciclo.dicas.${fase}.`))
            .map(([codigo, rotulo]) => conteudoDaPrevia(codigo, rotulo));
        const mudanca = conteudoDaPrevia(`ciclo.fases.${fase}`);

        expect(new Set(dicas.map(({ title }) => title)).size).toBe(3);
        expect(new Set(dicas.map(({ body }) => body)).size).toBe(3);
        for (const dica of dicas) {
            expect(dica.title).not.toBe(mudanca.title);
            expect(dica.body).not.toBe(mudanca.body);
        }
    }
});

test('separa os três níveis de confiabilidade e explica o que esperar da data', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));
    const previsoes = tipos.filter(([codigo]) => codigo.startsWith('ciclo.menstrual.proxima'));

    expect(previsoes.map(([, rotulo]) => rotulo.split(' ').at(-1))).toEqual([
        'alta',
        'média',
        'baixa'
    ]);
    const mensagens = previsoes.map(([codigo, rotulo]) => conteudoDaPrevia(codigo, rotulo).body);
    expect(mensagens).toEqual([
        expect.stringContaining('durações parecidas'),
        expect.stringContaining('já dão uma referência'),
        expect.stringContaining('pode variar bastante')
    ]);
    expect(mensagens.every((body) => body.includes('por volta de 16 de novembro'))).toBe(true);
});
