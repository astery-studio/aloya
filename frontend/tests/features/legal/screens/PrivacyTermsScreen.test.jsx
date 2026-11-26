import { fireEvent, render, screen } from '@testing-library/react-native';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PrivacyTermsScreen } from '../../../../src/features/legal/screens/PrivacyTermsScreen/PrivacyTermsScreen';
import { ThemeProvider } from '../../../../src/shared/theme/ThemeProvider';
import documentos from '../../../../src/features/legal/data/legalDocuments.json';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

function abrir(documentoInicial, onVoltar = jest.fn()) {
    return render(
        <ThemeProvider preferencia="claro" esquemaDoSistema="light">
            <PrivacyTermsScreen documentoInicial={documentoInicial} onVoltar={onVoltar} />
        </ThemeProvider>
    );
}

describe('Privacidade e termos', () => {
    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test.each([undefined, 'invalido'])('abre Privacidade por padrão (%s)', async (inicial) => {
        await abrir(inicial);
        expect(screen.getByRole('tab', { name: 'Privacidade', selected: true })).toBeOnTheScreen();
        expect(screen.getByText(documentos.privacy.titulo)).toBeOnTheScreen();
        expect(screen.queryByText(documentos.terms.titulo)).toBeNull();
    });

    test('abre Termos e retorna pelo header ou pelo retorno nativo', async () => {
        const voltar = jest.fn();
        await abrir('terms', voltar);
        expect(
            screen.getByRole('tab', { name: 'Termos de uso', selected: true })
        ).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
        await fireEvent(screen.getByTestId('consulta-legal'), 'requestClose');
        expect(voltar).toHaveBeenCalledTimes(2);
    });

    test('aplica a área segura superior no contêiner do modal', async () => {
        await render(
            <SafeAreaProvider
                initialMetrics={{
                    frame: { x: 0, y: 0, width: 390, height: 844 },
                    insets: { top: 24, right: 0, bottom: 0, left: 0 }
                }}
            >
                <ThemeProvider preferencia="claro" esquemaDoSistema="light">
                    <PrivacyTermsScreen />
                </ThemeProvider>
            </SafeAreaProvider>
        );

        expect(screen.getByTestId('header-container')).toHaveStyle({ paddingTop: 16 });
    });

    test('preserva a posição e as seções abertas de cada documento', async () => {
        await abrir();
        const lista = screen.getByTestId('documento-privacy');
        await fireEvent.scroll(lista, { nativeEvent: { contentOffset: { x: 0, y: 320 } } });
        const secoes = ['Informações que coletamos', 'Dados de saúde e vida íntima'];
        for (const name of secoes) await fireEvent.press(screen.getByRole('button', { name }));
        await fireEvent.press(screen.getByRole('tab', { name: 'Termos de uso' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Expandir tudo' }));
        expect(screen.getByRole('button', { name: 'Recolher tudo' })).toBeOnTheScreen();
        await fireEvent.press(screen.getByRole('tab', { name: 'Privacidade' }));
        expect(screen.getByTestId('documento-privacy').props.contentOffset).toEqual({
            x: 0,
            y: 320
        });
        for (const name of secoes) {
            expect(screen.getByRole('button', { name, expanded: true })).toBeOnTheScreen();
        }
        const primeiroTrecho = documentos.privacy.secoes.find(({ id }) => id === 'dados-sensiveis')
            .blocos[0].texto;
        expect(screen.getByText(primeiroTrecho).props.selectable).toBe(true);
        await fireEvent.press(screen.getByRole('button', { name: 'Expandir tudo' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Recolher tudo' }));
        expect(screen.queryByText(primeiroTrecho)).toBeNull();
        await fireEvent.press(screen.getByRole('tab', { name: 'Termos de uso' }));
        expect(screen.getByRole('button', { name: 'Recolher tudo' })).toBeOnTheScreen();
    });

    test.each([
        ['privacy', 'Quem é responsável', 'Contato e atendimento de privacidade', 19],
        ['terms', 'Condições comerciais', 'Contato e suporte', 21]
    ])(
        'oculta seções sem conteúdo e numera as visíveis em %s',
        async (id, oculto, contato, total) => {
            await abrir(id);
            expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
            expect(screen.getByRole('header', { name: 'Privacidade e Termos' })).toBeOnTheScreen();
            expect(screen.queryByRole('button', { name: oculto })).toBeNull();
            expect(
                screen.getAllByText(/^\d+\.$/).map(({ props }) => props.children.join(''))
            ).toEqual(Array.from({ length: total }, (_, i) => `${i + 1}.`));
            await fireEvent.press(screen.getByRole('button', { name: 'Expandir tudo' }));
            expect(screen.queryByText('Em revisão.')).toBeNull();
            expect(screen.getByRole('button', { name: contato, expanded: true })).toBeOnTheScreen();
            expect(screen.getAllByRole('link', { name: 'aloya.support@gmail.com' })).toHaveLength(
                2
            );
            expect(
                screen.getByRole('button', { name: 'Copiar endereço de e-mail' })
            ).toBeOnTheScreen();
        }
    );

    test('mantém seções estáveis e omite referências internas', () => {
        for (const documento of Object.values(documentos)) {
            expect(documento.estadoEditorial).toBe('minuta');
            expect(documento).not.toHaveProperty('versao');
            expect(documento).not.toHaveProperty('vigencia');
            expect(new Set(documento.secoes.map(({ id }) => id)).size).toBe(
                documento.secoes.length
            );
            expect(documento.secoes.map(({ numero }) => numero)).toEqual(
                Array.from({ length: documento.secoes.length }, (_, indice) => indice + 2)
            );
        }
        expect(documentos.privacy.secoes).toHaveLength(22);
        expect(documentos.terms.secoes).toHaveLength(24);
        expect(JSON.stringify(documentos)).not.toMatch(/PENDÊNCIA|PEN-\d|AF-\d|EC-[A-Z]+-|ALOYA_/);
    });
});
