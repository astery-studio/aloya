import { conteudoDaPrevia, listarPreviews } from '../../../src/features/notifications/notificationPreview';

test('fornece texto próprio para cada prévia do catálogo', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));

    const semTextoProprio = tipos.filter(([codigo, rotulo]) => {
        const { title, body } = conteudoDaPrevia(codigo, rotulo);
        return (
            !body?.trim() ||
            body === title ||
            body === 'Abra o Aloya para conferir os detalhes.' ||
            /exemplo para verificar|anticoncepcional de exemplo|\[[^\]]+\]/i.test(
                `${title} ${body}`
            )
        );
    });

    expect(semTextoProprio).toEqual([]);
});

test('preenche nome, horário e prazo nos textos do protótipo', () => {
    expect(conteudoDaPrevia('anticoncepcional.rotina.horario').title).toBe(
        'Hora de tomar Pílula Aurora'
    );
    expect(conteudoDaPrevia('redeApoio.anticoncepcional.horario')).toMatchObject({
        title: 'Horário do anticoncepcional de Alex',
        body: 'O uso de Pílula Aurora está previsto para 20:00 na agenda que Alex compartilhou com você.'
    });
    expect(conteudoDaPrevia('anticoncepcional.diu.data')).toMatchObject({
        title: 'Lembrete de troca do DIU hormonal',
        body: 'A data prevista para a troca do seu DIU hormonal é 16 de novembro. Restam 2 dias para a data de validade.'
    });
});
