import { conteudoDaPrevia } from '../../../src/features/notifications/notificationPreview';

test('exibe uma mensagem curta na prévia de retirada do anel', () => {
    expect(conteudoDaPrevia('anticoncepcional.anel.retirada', 'Retirada do anel')).toStrictEqual({
        title: 'Retirada do anel',
        body: 'Hoje é o dia previsto para retirar o anel. Confira sua agenda no Aloya.',
        data: { previaLocal: true }
    });
});

test.each([
    ['inicioPausa', 'Início da pausa do anticoncepcional', /começa a pausa programada/],
    ['fimPausa', 'Fim da pausa do anticoncepcional', /último dia da pausa/],
    ['retomada', 'Retomada do anticoncepcional', /retomar o uso/]
])('identifica o anticoncepcional na prévia de %s', (evento, title, trecho) => {
    const conteudo = conteudoDaPrevia(`anticoncepcional.rotina.${evento}`);
    expect(conteudo.title).toBe(title);
    expect(conteudo.body).toContain('Pílula Aurora');
    expect(conteudo.body).toMatch(trecho);
});

test.each([
    ['aviso', 'Restam 4 horas'],
    ['moderados', 'Restam 3 horas'],
    ['criticos', 'Restam 2 horas'],
    ['fimJanela', 'O prazo deste lembrete terminou.']
])('mantém o título e diferencia pelo texto o alerta de uso pendente %s', (fase, mensagem) => {
    const { title, body } = conteudoDaPrevia(`anticoncepcional.naoConfirmado.${fase}`);
    expect(title).toBe('Confirmação de uso pendente');
    expect(body).toContain('Pílula Aurora');
    expect(body).toContain(mensagem);
});

test.each(['proxima', 'atingida'])(
    'identifica o anticoncepcional no aviso de validade %s',
    (tipo) => {
        const conteudo = conteudoDaPrevia(`anticoncepcional.validade.${tipo}`);
        expect(conteudo.title).toMatch(/anticoncepcional/);
        expect(conteudo.body).toContain('Pílula Aurora é 30 de novembro');
    }
);

test.each(['proxima', 'hoje'])('identifica o injetável e a data na prévia %s', (tipo) => {
    const { title, body } = conteudoDaPrevia(`anticoncepcional.injetavel.${tipo}`);
    expect(title).toMatch(/aplicação do anticoncepcional/i);
    expect(body).toContain('Injetável Aurora');
    expect(body).toContain('28 de novembro');
});

test.each([
    ['troca', 'sem iniciar a pausa'],
    ['retirada', 'marca o início da pausa'],
    ['novo', 'A pausa programada terminou']
])('explica o aviso de adesivo %s na prévia', (tipo, acao) => {
    const { title, body } = conteudoDaPrevia(`anticoncepcional.adesivo.${tipo}`);
    expect(title).toContain('adesivo anticoncepcional');
    expect(body).toContain('Adesivo Aurora');
    expect(body).toContain(acao);
});
