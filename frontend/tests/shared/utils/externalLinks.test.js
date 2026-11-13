import { analisarLinkExterno } from '../../../src/shared/utils/externalLinks';

describe('analisarLinkExterno', () => {
    test('distingue recuperação de senha e convite de Rede de Apoio', () => {
        expect(analisarLinkExterno('aloya://reset-password?token=senha-segura')).toEqual({
            tipo: 'recuperacao_senha',
            token: 'senha-segura'
        });
        expect(
            analisarLinkExterno('aloya://support-network/invitation?token=convite-seguro')
        ).toEqual({
            tipo: 'convite_rede_apoio',
            token: 'convite-seguro'
        });
        expect(
            analisarLinkExterno(
                'https://aloya.example/support-network/invitation?token=convite-web'
            )
        ).toEqual({
            tipo: 'convite_rede_apoio',
            token: 'convite-web'
        });
    });

    test.each([null, '', 'url inválida', 'aloya://reset-password', 'aloya://outro?token=x'])(
        'ignora link externo sem destino conhecido: %p',
        (url) => {
            expect(analisarLinkExterno(url)).toBeNull();
        }
    );
});
