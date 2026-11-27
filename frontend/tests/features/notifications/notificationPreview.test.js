import {
    conteudoDaPrevia,
    exibirPrevia,
    listarPreviews
} from '../../../src/features/notifications/notificationPreview';
import { aviso, criarSdk } from './notificationPreviewFixture';

test('lista todos os tipos, separa variantes e omite os editores de horário e de antecedência', () => {
    const tipos = listarPreviews().flatMap(({ grupos }) => grupos.flatMap(({ tipos }) => tipos));
    const chaves = tipos.map(([codigo]) => codigo);
    expect(new Set(chaves).size).toBe(64);
    expect(chaves).not.toEqual(
        expect.arrayContaining([
            'ciclo.diario.horarioLembreteDiario',
            'ciclo.fases.antecedenciaProximoCiclo'
        ])
    );
    expect(conteudoDaPrevia('redeApoio.convites.respondido.aceito', 'Convite aceito').title).toBe(
        'Seu convite foi aceito!'
    );
    expect(
        conteudoDaPrevia('redeApoio.convites.respondido.recusado', 'Convite recusado').title
    ).toBe('Seu convite não foi aceito');
});

test('solicita apresentação imediata no canal nativo e usa dados fictícios', async () => {
    const sdk = criarSdk();
    expect(await exibirPrevia({ ...aviso, plataforma: 'android', sdk })).toBe('solicitada');
    expect(sdk.setNotificationChannelAsync).toHaveBeenCalledWith(
        'ciclo',
        expect.objectContaining({ importance: 4 })
    );
    const handler = sdk.setNotificationHandler.mock.calls[0][0];
    expect(await handler.handleNotification()).toMatchObject({
        shouldShowBanner: true,
        shouldShowList: true
    });
    expect(sdk.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.objectContaining({
            title: 'Que tal atualizar seu diário hoje?',
            data: { previaLocal: true }
        }),
        trigger: { channelId: 'ciclo' }
    });
});
