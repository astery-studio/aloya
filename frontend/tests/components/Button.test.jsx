/**
 * Testes das variantes, estados, interações e temas dos botões.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import Button from '../../src/shared/components/common/Button/Button';
import ButtonDashed from '../../src/shared/components/common/Button/ButtonDashed';
import ButtonPopup from '../../src/shared/components/common/Button/ButtonPopup';
import { ThemeProvider } from '../../src/shared/theme/ThemeProvider';

function renderizarBotao(componente, preferencia = 'claro') {
    return render(
        <ThemeProvider preferencia={preferencia} esquemaDoSistema="light">
            {componente}
        </ThemeProvider>
    );
}

describe('Button', () => {
    test('chama a ação ao toque', async () => {
        const aoPressionar = jest.fn();

        await renderizarBotao(<Button texto="Salvar" aoPressionar={aoPressionar} />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Salvar'
            })
        );

        expect(aoPressionar).toHaveBeenCalledTimes(1);
    });

    test.each([
        [
            'desativado',
            {
                desativado: true
            }
        ],
        [
            'carregando',
            {
                carregando: true
            }
        ]
    ])('botão %s bloqueia a ação', async (_nome, estado) => {
        const aoPressionar = jest.fn();

        await renderizarBotao(<Button texto="Salvar" aoPressionar={aoPressionar} {...estado} />);

        const botao = screen.getByRole('button', {
            name: 'Salvar'
        });

        await fireEvent.press(botao);

        expect(aoPressionar).not.toHaveBeenCalled();

        expect(botao.props.accessibilityState.disabled).toBe(true);
    });

    test('mostra carregamento acessível', async () => {
        await renderizarBotao(<Button texto="Salvar" carregando />);

        expect(screen.getByTestId('button-loading')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', {
                name: 'Salvar'
            }).props.accessibilityState
        ).toEqual({
            disabled: true,
            busy: true
        });
    });

    test.each(['verde', 'branco', 'preto', 'vermelho'])(
        'popup aceita variante %s',
        async (variante) => {
            await renderizarBotao(<ButtonPopup texto="OK" variante={variante} />);

            expect(
                screen.getByRole('button', {
                    name: 'OK'
                })
            ).toBeOnTheScreen();
        }
    );

    test('usa destaque acessível no botão verde escuro', async () => {
        await renderizarBotao(<Button texto="Confirmar" variante="verde" />, 'escuro');

        expect(
            screen.getByRole('button', {
                name: 'Confirmar'
            })
        ).toHaveStyle({
            backgroundColor: '#9FD6B6'
        });

        expect(screen.getByText('Confirmar')).toHaveStyle({
            color: '#152018'
        });
    });

    test('usa superfície escura na variante branca', async () => {
        await renderizarBotao(<Button texto="Cancelar" variante="branco" />, 'escuro');

        expect(
            screen.getByRole('button', {
                name: 'Cancelar'
            })
        ).toHaveStyle({
            backgroundColor: '#232926',
            borderColor: '#4A514D'
        });

        expect(screen.getByText('Cancelar')).toHaveStyle({
            color: '#C4C8C5'
        });
    });

    test('usa contraste inverso no botão preto escuro', async () => {
        await renderizarBotao(<Button texto="Continuar" variante="preto" />, 'escuro');

        expect(
            screen.getByRole('button', {
                name: 'Continuar'
            })
        ).toHaveStyle({
            backgroundColor: '#F4F1EA'
        });

        expect(screen.getByText('Continuar')).toHaveStyle({
            color: '#222222'
        });
    });

    test('botão tracejado executa ação', async () => {
        const aoPressionar = jest.fn();

        await renderizarBotao(<ButtonDashed texto="Adicionar" aoPressionar={aoPressionar} />);

        await fireEvent.press(
            screen.getByRole('button', {
                name: 'Adicionar'
            })
        );

        expect(aoPressionar).toHaveBeenCalledTimes(1);
    });

    test.each([
        [
            'variante',
            {
                variante: 'inexistente'
            }
        ],
        [
            'tamanho',
            {
                tamanho: 'inexistente'
            }
        ]
    ])('rejeita %s inválido', async (_nome, propriedade) => {
        await expect(renderizarBotao(<Button texto="Teste" {...propriedade} />)).rejects.toThrow(
            /inválid/
        );
    });
});
