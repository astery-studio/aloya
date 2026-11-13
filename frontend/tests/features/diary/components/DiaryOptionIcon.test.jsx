import { renderWithTheme } from '../../../helpers/renderWithTheme';

const mockSvgXml = jest.fn(() => null);
jest.mock('react-native-svg', () => ({ SvgXml: (props) => mockSvgXml(props) }));

const mockIcone = jest.fn(() => null);
jest.mock('../../../../src/shared/components/icons/DiaryIcons', () => ({
    diaryIcons: {
        componente: (props) => mockIcone(props),
        svg: '<svg fill="#C85A44" />',
        material: '<svg><path /></svg>'
    }
}));

import { DiaryOptionIcon } from '../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon';

describe('DiaryOptionIcon', () => {
    beforeEach(() => jest.clearAllMocks());

    test('renderiza componente React com propriedades visuais', async () => {
        await renderWithTheme(
            <DiaryOptionIcon iconeId="componente" tamanho={20} color="#123456" weight="fill" />
        );
        expect(mockIcone.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                accessible: false,
                size: 20,
                color: '#123456',
                weight: 'fill'
            })
        );
    });

    test('renderiza XML SVG sem anunciá-lo em duplicidade', async () => {
        await renderWithTheme(<DiaryOptionIcon iconeId="svg" />);
        expect(mockSvgXml.mock.calls[0][0]).toEqual(
            expect.objectContaining({
                accessible: false,
                xml: '<svg fill="#C85A44" />',
                width: 18,
                height: 18
            })
        );
    });

    test('troca a cor específica do SVG para branco quando selecionado', async () => {
        mockSvgXml.mockClear();
        await renderWithTheme(<DiaryOptionIcon iconeId="svg" color="#CB442A" selecionado />);
        expect(mockSvgXml.mock.calls[0][0].xml).toBe('<svg fill="#FFFFFF" />');
    });

    test('sobrepõe também a cor específica de componente selecionado', async () => {
        await renderWithTheme(
            <DiaryOptionIcon iconeId="componente" color="#CB442A" selecionado />
        );
        expect(mockIcone.mock.calls[0][0].color).toBe('#FFFFFF');
    });

    test('troca cores internas pela mesma cor do texto', async () => {
        await renderWithTheme(<DiaryOptionIcon iconeId="svg" color="#123456" />);
        expect(mockSvgXml.mock.calls[0][0].xml).toBe('<svg fill="#123456" />');
    });

    test('aplica a cor do texto a SVG sem cor explícita', async () => {
        mockSvgXml.mockClear();
        await renderWithTheme(<DiaryOptionIcon iconeId="material" color="#C85A44" />);
        expect(mockSvgXml.mock.calls[0][0].xml).toBe('<svg fill="#C85A44"><path /></svg>');
    });

    test('falha explicitamente para identificador desconhecido', async () => {
        await expect(renderWithTheme(<DiaryOptionIcon iconeId="ausente" />)).rejects.toThrow(
            'Ícone do Diário não encontrado: ausente'
        );
    });

    test('usa contraste escuro fiel quando a opção está selecionada', async () => {
        await renderWithTheme(
            <DiaryOptionIcon iconeId="componente" color="#CB442A" selecionado />,
            { preferencia: 'escuro' }
        );
        expect(mockIcone.mock.calls[0][0].color).toBe('#121212');
    });
});
