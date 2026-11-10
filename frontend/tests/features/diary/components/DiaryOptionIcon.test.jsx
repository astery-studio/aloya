import { render } from '@testing-library/react-native';

const mockSvgXml = jest.fn(() => null);
jest.mock('react-native-svg', () => ({ SvgXml: (props) => mockSvgXml(props) }));

const mockIcone = jest.fn(() => null);
jest.mock('../../../../src/shared/components/icons/DiaryIcons', () => ({
    diaryIcons: {
        componente: (props) => mockIcone(props),
        svg: '<svg />'
    }
}));

import { DiaryOptionIcon } from '../../../../src/features/diary/components/DiaryOptionIcon/DiaryOptionIcon';

describe('DiaryOptionIcon', () => {
    beforeEach(() => jest.clearAllMocks());

    test('renderiza componente React com propriedades visuais', async () => {
        await render(
            <DiaryOptionIcon iconeId="componente" tamanho={20} cor="#123456" weight="fill" />
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
        await render(<DiaryOptionIcon iconeId="svg" />);
        expect(mockSvgXml.mock.calls[0][0]).toEqual(
            expect.objectContaining({ accessible: false, xml: '<svg />', width: 18, height: 18 })
        );
    });

    test('falha explicitamente para identificador desconhecido', async () => {
        await expect(render(<DiaryOptionIcon iconeId="ausente" />)).rejects.toThrow(
            'Ícone do Diário não encontrado: ausente'
        );
    });
});
