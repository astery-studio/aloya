import { fireEvent, screen } from '@testing-library/react-native';

import {
    criarEstiloBotaoAcao,
    DiaryRecordDetails,
    criarIntroducaoRegistro,
    formatarDuracao,
    normalizarDetalhe,
    obterCoresCategoria,
    precisaAtivarRolagem,
    valorEscalado
} from '../../../../src/features/diary/components/DiaryRecordDetails/DiaryRecordDetails';
import { temaEscuro } from '../../../../src/shared/theme/themePalettes';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const registro = {
    id: 7,
    data: '2026-10-28',
    fase: 'lutea',
    ciclo: { dia: 21, numero: 3 },
    versao: 2,
    categorias: [
        {
            id: 'pele',
            macrocategoria: 'Corpo',
            nome: 'Pele',
            opcoes: [{ id: 'pele_espinhas', grupo: 'caracteristicas', nome: 'Espinhas' }]
        },
        {
            id: 'tempo_sono',
            macrocategoria: 'Energia',
            nome: 'Tempo de sono',
            duracaoMinutos: 500
        },
        {
            id: 'anotacao_livre',
            macrocategoria: 'Saúde',
            nome: 'Anotação do dia',
            texto: 'Uma anotação privada carregada somente no detalhe.'
        }
    ]
};

describe('DiaryRecordDetails', () => {
    test('habilita rolagem somente quando o conteúdo ultrapassa a área visível', () => {
        expect(precisaAtivarRolagem(400, 500)).toBe(false);
        expect(precisaAtivarRolagem(501, 500)).toBe(false);
        expect(precisaAtivarRolagem(503, 500)).toBe(true);
        expect(precisaAtivarRolagem(600, 0)).toBe(false);
    });

    test('apresenta detalhe autorizado e ações contextualizadas', async () => {
        const aoEditar = jest.fn();
        const aoExcluir = jest.fn();
        const aoFechar = jest.fn();
        await render(
            <DiaryRecordDetails
                registro={registro}
                aoEditar={aoEditar}
                aoExcluir={aoExcluir}
                aoFechar={aoFechar}
            />
        );

        const detalhes = screen.getByTestId('diary-record-details');
        expect(detalhes).toHaveProp('scrollEnabled', false);
        await fireEvent(detalhes, 'layout', { nativeEvent: { layout: { height: 500 } } });
        await fireEvent(screen.getByTestId('diary-details-end'), 'layout', {
            nativeEvent: { layout: { y: 430, height: 52 } }
        });
        expect(screen.getByTestId('diary-record-details')).toHaveProp('scrollEnabled', false);
        await fireEvent(screen.getByTestId('diary-details-end'), 'layout', {
            nativeEvent: { layout: { y: 451, height: 52 } }
        });
        expect(screen.getByTestId('diary-record-details')).toHaveProp('scrollEnabled', true);

        expect(screen.getByText('Espinhas')).toBeOnTheScreen();
        expect(screen.getByText('8 horas e 20 minutos')).toBeOnTheScreen();
        expect(screen.getByText(registro.categorias[2].texto)).toBeOnTheScreen();
        expect(screen.getByText(registro.categorias[2].texto)).toHaveStyle({
            width: '100%',
            padding: 6,
            borderWidth: 0.7,
            borderColor: '#E6E2D8',
            borderRadius: 6,
            backgroundColor: 'rgba(247, 245, 240, 0.5)',
            fontSize: 8,
            fontWeight: '300',
            lineHeight: 12
        });
        expect(screen.getByRole('header', { name: 'Diário' })).toHaveStyle({
            fontSize: 17,
            lineHeight: 22
        });
        expect(screen.getByText('28/10/2026')).toHaveStyle({ fontSize: 14, lineHeight: 26 });
        expect(screen.getByText('No dia 21 do seu ciclo 03 você registrou:')).toBeOnTheScreen();
        expect(screen.getByRole('header', { name: 'PELE' })).toHaveStyle({
            fontSize: 10,
            lineHeight: 15
        });
        expect(screen.getByText('ALTERAÇÃO DO REGISTRO')).toHaveStyle({ color: '#2C4C3B' });
        expect(screen.getByText('Espinhas')).toHaveStyle({ fontSize: 8.56, lineHeight: 16 });
        expect(screen.getByRole('button', { name: 'Editar registro de 28/10/2026' })).toHaveStyle({
            height: 35.99,
            borderRadius: 20
        });
        expect(screen.getByRole('button', { name: 'OK' })).toHaveStyle({
            height: 52,
            borderRadius: 12
        });
        await fireEvent(
            screen.getByRole('button', { name: 'Editar registro de 28/10/2026' }),
            'pressIn'
        );
        await fireEvent(
            screen.getByRole('button', { name: 'Excluir registro de 28/10/2026' }),
            'pressIn'
        );
        await fireEvent.press(
            screen.getByRole('button', { name: 'Editar registro de 28/10/2026' })
        );
        await fireEvent.press(
            screen.getByRole('button', { name: 'Excluir registro de 28/10/2026' })
        );
        await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
        expect(aoEditar).toHaveBeenCalledWith(registro);
        expect(aoExcluir).toHaveBeenCalledWith(registro);
        expect(aoFechar).toHaveBeenCalledTimes(1);
    });

    test('cobre loading, erro e normalização defensiva', async () => {
        const tentar = jest.fn();
        const fechar = jest.fn();
        const resultado = await render(<DiaryRecordDetails carregando aoFechar={fechar} />);
        expect(screen.getByTestId('diary-details-loading')).toBeOnTheScreen();

        await resultado.rerender(
            <DiaryRecordDetails
                erro="Não foi possível carregar este registro."
                aoTentarNovamente={tentar}
                aoFechar={fechar}
            />
        );
        await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
        await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
        expect(tentar).toHaveBeenCalledTimes(1);
        expect(fechar).toHaveBeenCalledTimes(1);
        expect(normalizarDetalhe({ id: 0 })).toBeNull();
        expect(criarIntroducaoRegistro({})).toBe('Neste dia você registrou:');
        expect(formatarDuracao(0)).toBeNull();
        expect(formatarDuracao(60)).toBe('1 hora');
        expect(formatarDuracao(120)).toBe('2 horas');
        expect(formatarDuracao(20)).toBe('20 minutos');
        expect(formatarDuracao(61)).toBe('1 hora e 1 minuto');
        expect(formatarDuracao(121)).toBe('2 horas e 1 minuto');
    });

    test('apresenta valores escalares, opções sem ícone e categorias vazias', async () => {
        const registroAmpliado = {
            ...registro,
            categorias: [
                { id: 'temperatura_basal', nome: 'Temperatura', valor: '36.50' },
                { id: 'peso', nome: 'Peso', valor: '60.2' },
                { id: 'outro_decimal', nome: 'Outro', valor: '2.5' },
                {
                    id: 'categoria_desconhecida',
                    nome: 'Categoria sem ícone',
                    opcoes: [{ grupo: 'grupo', nome: 'Valor desconhecido' }, null, { nome: 1 }]
                },
                { id: 'vazia', nome: 'Vazia', opcoes: 'inválidas' }
            ]
        };
        await render(<DiaryRecordDetails registro={registroAmpliado} aoFechar={jest.fn()} />);
        expect(screen.getByText('36.50 °C')).toBeOnTheScreen();
        expect(screen.getByText('60.2 kg')).toBeOnTheScreen();
        expect(screen.getByText('2.5')).toBeOnTheScreen();
        expect(screen.getByText('Valor desconhecido')).toBeOnTheScreen();
        expect(screen.queryByText('VAZIA')).not.toBeOnTheScreen();
    });

    test('cobre estados sem retry, sem ações e contratos malformados', async () => {
        const fechar = jest.fn();
        const resultado = await render(
            <DiaryRecordDetails erro="Falha temporária" aoFechar={fechar} />
        );
        expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeOnTheScreen();

        await resultado.rerender(
            <DiaryRecordDetails
                registro={{ ...registro, categorias: undefined }}
                aoFechar={fechar}
                aoAnterior={jest.fn()}
                aoProximo={jest.fn()}
            />
        );
        expect(screen.queryByText('ALTERAÇÃO DO REGISTRO')).not.toBeOnTheScreen();
        expect(screen.getByRole('button', { name: 'Dia anterior' })).toBeEnabled();

        expect(normalizarDetalhe(null)).toBeNull();
        expect(normalizarDetalhe('registro')).toBeNull();
        expect(normalizarDetalhe([])).toBeNull();
        expect(normalizarDetalhe({ id: 1, data: 'inválida' })).toBeNull();
        expect(
            normalizarDetalhe({
                id: 1,
                data: '2026-11-01',
                categorias: [null, 'texto', { id: 1, nome: 'A' }, { id: 'a', nome: 1 }]
            })
        ).toMatchObject({ categorias: [] });
        expect(valorEscalado(null)).toBeNull();
        expect(valorEscalado({ valor: 1 })).toBeNull();
        expect(valorEscalado({ valor: ' ' })).toBeNull();
        expect(valorEscalado({ id: 'peso', valor: '60' })).toBe('60 kg');
        expect(valorEscalado({ id: 'desconhecido', valor: '2' })).toBe('2');
        expect(obterCoresCategoria('sintomas_pre_menstruais', '#000')).toEqual({
            fundo: '#F1EAF8',
            texto: '#8761A8'
        });
        expect(obterCoresCategoria('atividade_sexual', '#000').fundo).toBe('#F8E8EE');
        expect(obterCoresCategoria('pele', '#123').texto).toBe('#123');
        expect(obterCoresCategoria('pele', '#123', 'Corpo e Sintomas Físicos')).toEqual({
            fundo: 'rgba(44, 76, 59, 0.1)',
            texto: '#2C4C3B'
        });
        expect(obterCoresCategoria('tempo_sono', '#123', 'Energia e Sono')).toEqual({
            fundo: 'rgba(176, 125, 42, 0.1)',
            texto: '#B07D2A'
        });
        expect(obterCoresCategoria('fluxo_menstrual', '#123', 'Ciclo e Sangramento')).toEqual({
            fundo: 'rgba(200, 90, 68, 0.1)',
            texto: '#C85A44'
        });
        expect(obterCoresCategoria('humor', '#123', 'Emocional')).toEqual({
            fundo: 'rgba(123, 94, 167, 0.1)',
            texto: '#7B5EA7'
        });
        expect(obterCoresCategoria('vida_social', '#123', 'Vida Íntima e Social')).toEqual({
            fundo: 'rgba(176, 74, 112, 0.1)',
            texto: '#B04A70'
        });
        expect(obterCoresCategoria('consultas', '#123', 'Saúde e Acompanhamento')).toEqual({
            fundo: 'rgba(74, 88, 153, 0.1)',
            texto: '#4A5899'
        });
        expect(obterCoresCategoria('fluxo', '#123', 'Ciclo', temaEscuro).texto).toBe('#EF9A9A');
        expect(obterCoresCategoria('pele', '#123', 'Corpo', temaEscuro).texto).toBe('#A5D6A7');
        expect(obterCoresCategoria('humor', '#123', 'Emocional', temaEscuro).texto).toBe('#B59DDB');
        expect(obterCoresCategoria('sono', '#123', 'Energia', temaEscuro).texto).toBe('#FFE082');
        expect(obterCoresCategoria('social', '#123', 'Íntima', temaEscuro).texto).toBe('#EF9A9A');
        expect(obterCoresCategoria('consulta', '#123', 'Saúde', temaEscuro).texto).toBe('#90CAF9');
        const estilos = { botaoAcao: {}, botaoAcaoDesativado: {}, pressionado: {} };
        expect(criarEstiloBotaoAcao(estilos, false, false)).toEqual([{}, null, null]);
        expect(criarEstiloBotaoAcao(estilos, true, true)).toEqual([{}, {}, {}]);

        await resultado.rerender(<DiaryRecordDetails registro={{ id: 0 }} aoFechar={fechar} />);
        expect(screen.queryByTestId('diary-record-details')).not.toBeOnTheScreen();
    });

    test('aceita editar ou excluir como ação isolada', async () => {
        const resultado = await render(
            <DiaryRecordDetails registro={registro} aoEditar={jest.fn()} aoFechar={jest.fn()} />
        );
        expect(screen.getByRole('button', { name: 'Editar registro de 28/10/2026' })).toBeEnabled();
        expect(
            screen.queryByRole('button', { name: 'Excluir registro de 28/10/2026' })
        ).not.toBeOnTheScreen();

        await resultado.rerender(
            <DiaryRecordDetails registro={registro} aoExcluir={jest.fn()} aoFechar={jest.fn()} />
        );
        expect(
            screen.getByRole('button', { name: 'Excluir registro de 28/10/2026' })
        ).toBeEnabled();
        expect(
            screen.getByRole('button', { name: 'Editar registro de 28/10/2026' })
        ).toBeDisabled();
    });

    test.each([
        ['editar', 'Editar registro de 28/10/2026'],
        ['excluir', 'Excluir registro de 28/10/2026']
    ])('bloqueia todas as ações durante %s', async (acaoEmAndamento, rotulo) => {
        await render(
            <DiaryRecordDetails
                registro={registro}
                aoEditar={jest.fn()}
                aoExcluir={jest.fn()}
                aoFechar={jest.fn()}
                acaoEmAndamento={acaoEmAndamento}
            />
        );
        expect(screen.getByRole('button', { name: rotulo })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    });
});
