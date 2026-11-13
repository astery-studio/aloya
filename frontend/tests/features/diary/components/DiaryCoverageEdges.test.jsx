import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { DiaryDateArrow } from '../../../../src/features/diary/components/DiaryDateNavigator/DiaryDateArrow';
import { DiaryCategoryFilterGroup } from '../../../../src/features/diary/components/DiaryFiltersSheet/DiaryCategoryFilterGroup';
import { DiaryFilterDateField } from '../../../../src/features/diary/components/DiaryFiltersSheet/DiaryFilterDateField';
import { DiaryPhaseFilterOption } from '../../../../src/features/diary/components/DiaryFiltersSheet/DiaryPhaseFilterOption';
import { DiaryHistoryHeader } from '../../../../src/features/diary/components/DiaryHistoryHeader/DiaryHistoryHeader';
import { DiaryMacrocategoryAccordion } from '../../../../src/features/diary/components/DiaryMacrocategoryAccordion/DiaryMacrocategoryAccordion';
import { DiaryPhaseIcon } from '../../../../src/features/diary/components/DiaryPhaseIcon/DiaryPhaseIcon';
import { DiaryRecordDetailsModal } from '../../../../src/features/diary/components/DiaryRecordDetailsModal/DiaryRecordDetailsModal';
import { DiaryRecordValueChip } from '../../../../src/features/diary/components/DiaryRecordValueChip/DiaryRecordValueChip';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

function IconeTeste(props) {
    return <Text testID="icone-teste">{String(props.size)}</Text>;
}

test('cobre padrões defensivos dos componentes visuais do Diário', async () => {
    const aoPressionar = jest.fn();
    const resultado = await render(
        <DiaryDateArrow direcao="anterior" aoPressionar={aoPressionar} />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Dia anterior' }));
    expect(aoPressionar).toHaveBeenCalledTimes(1);

    await resultado.rerender(<DiaryPhaseIcon fase="fase-inexistente" />);
    expect(screen.queryByTestId(/diary-phase-icon/u)).toBeNull();
    await resultado.rerender(<DiaryPhaseIcon fase={null} aceitarFaseIndefinida size={18} />);
    expect(screen.getByTestId('diary-phase-icon-indefinida')).toBeOnTheScreen();

    await resultado.rerender(
        <DiaryRecordValueChip
            categoriaId="pele"
            rotulo={null}
            estilos={{ chip: {}, textoChip: {} }}
            cores={{ fundo: '#fff', texto: '#000' }}
        />
    );
    expect(screen.queryByText('pele')).toBeNull();
});

test('usa padrões do cabeçalho e do acordeão sem configuração opcional', async () => {
    const estilosCabecalho = {
        cabecalhoLista: {},
        introducao: {},
        descricao: {},
        atualizando: {},
        textoAtualizando: {},
        divisor: {},
        linhaDivisor: {},
        textoDivisor: {}
    };
    const tema = { cores: { interface: { destaque: '#2C4C3B' } } };
    const resultado = await render(
        <DiaryHistoryHeader estilos={estilosCabecalho} tema={tema} />
    );
    expect(screen.getByRole('header', { name: 'Linha do tempo' })).toBeOnTheScreen();

    const aoAlternar = jest.fn();
    await resultado.rerender(
        <DiaryMacrocategoryAccordion
            titulo="Categoria padrão"
            icone={IconeTeste}
            expandido={false}
            aoAlternar={aoAlternar}
        />
    );
    const botao = screen.getByRole('button', { name: 'Expandir Categoria padrão' });
    await fireEvent.press(botao);
    expect(aoAlternar).toHaveBeenCalledTimes(1);

    await resultado.rerender(
        <DiaryMacrocategoryAccordion
            titulo="Categoria desconhecida"
            icone={IconeTeste}
            paleta="inexistente"
            expandido
            aoAlternar={jest.fn()}
        >
            <Text>Conteúdo</Text>
        </DiaryMacrocategoryAccordion>
    );
    expect(screen.getByText('Conteúdo')).toBeOnTheScreen();
});

test('mantém opções ocultas quando macro ou categorias estão desativadas', async () => {
    const estilos = { opcaoCategoria: {}, pressionado: {} };
    const macros = [
        {
            id: 'ciclo_sangramento',
            nome: 'Ciclo e Sangramento',
            ativa: false,
            categorias: [{ id: 'fluxo', nome: 'Fluxo', ativaEfetiva: true }]
        },
        {
            id: 'emocional',
            nome: 'Emocional',
            ativa: true,
            categorias: [{ id: 'humor', nome: 'Humor', ativaEfetiva: false }]
        }
    ];
    const aoAlternar = jest.fn();
    const aoExpandir = jest.fn();
    const resultado = await render(
        <DiaryCategoryFilterGroup
            macro={macros[0]}
            selecionadas={[]}
            estilos={estilos}
            aoAlternar={aoAlternar}
        />
    );
    expect(screen.queryByText('Ciclo e Sangramento')).toBeNull();

    await resultado.rerender(
        <DiaryCategoryFilterGroup
            macro={macros[1]}
            selecionadas={[]}
            estilos={estilos}
            aoExpandir={aoExpandir}
        />
    );
    expect(screen.queryByText('Emocional')).toBeNull();

    const macroAtiva = {
        id: 'ciclo_sangramento',
        nome: 'Ciclo e Sangramento',
        ativa: true,
        categorias: [{ id: 'fluxo', nome: 'Fluxo menstrual', ativaEfetiva: true }]
    };
    await resultado.rerender(
        <DiaryCategoryFilterGroup
            macro={macroAtiva}
            selecionadas={[]}
            expandida
            estilos={estilos}
            aoAlternar={aoAlternar}
        />
    );
    await fireEvent.press(screen.getByText('Fluxo menstrual'));
    expect(aoAlternar).toHaveBeenCalledWith('fluxo');
});

test('usa paleta de fallback para macros sem paleta conhecida', async () => {
    const resultado = await render(
        <DiaryMacrocategoryAccordion
            titulo="Macro sem paleta"
            icone={IconeTeste}
            paleta="nao-mapeada"
            expandido
            aoAlternar={jest.fn()}
        >
            <Text>Conteúdo expandido</Text>
        </DiaryMacrocategoryAccordion>
    );
    expect(screen.getByText('Conteúdo expandido')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Recolher Macro sem paleta' })).toBeOnTheScreen();
});

test('modal de detalhes assume que a exclusão está inativa', async () => {
    await render(
        <DiaryRecordDetailsModal
            visivel
            registro={{ id: 1, data: '2026-11-01', fase: 'folicular', categorias: [] }}
            aoFechar={jest.fn()}
        />
    );
    expect(screen.getByRole('header', { name: 'Diário' })).toBeOnTheScreen();
});

test('aciona os controles elementares do filtro e ignora grupos indisponíveis', async () => {
    const aoLimpar = jest.fn();
    const resultado = await render(
        <DiaryFilterDateField
            rotulo="Data especial"
            valor="01/11/2026"
            aoAlterar={jest.fn()}
            aoLimpar={aoLimpar}
            estilos={{
                grupoCampo: {},
                rotuloCampo: {},
                campoDataComAcao: {},
                entradaData: {},
                campoData: {},
                limparData: {}
            }}
            tema={{ cores: { marca: { primaria: '#C85A44' } } }}
        />
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Limpar data especial' }));
    expect(aoLimpar).toHaveBeenCalledTimes(1);

    const estilos = {
        opcaoFase: {},
        pressionado: {},
        identificacaoFase: {},
        iconeFase: {},
        nomeFase: {},
        opcaoCategoria: {},
        nomeCategoria: {}
    };
    const aoAlterar = jest.fn();
    await resultado.rerender(
        <DiaryPhaseFilterOption
            fase="folicular"
            ativo={false}
            aoAlterar={aoAlterar}
            estilos={estilos}
        />
    );
    await fireEvent.press(screen.getByRole('switch', { name: 'Filtrar por Fase Folicular' }));
    expect(aoAlterar).toHaveBeenCalledWith(true);

    const macro = {
        id: 'ciclo_sangramento',
        nome: 'Ciclo e Sangramento',
        ativa: false,
        categorias: [{ id: 'fluxo_menstrual', nome: 'Fluxo', ativaEfetiva: true }]
    };
    await resultado.rerender(
        <DiaryCategoryFilterGroup
            macro={macro}
            selecionadas={[]}
            estilos={estilos}
            aoExpandir={jest.fn()}
            aoAlternar={jest.fn()}
            aoAlternarTodas={jest.fn()}
        />
    );
    expect(screen.queryByText('Ciclo e Sangramento')).toBeNull();
    await resultado.rerender(
        <DiaryCategoryFilterGroup
            macro={{ ...macro, ativa: true, categorias: [] }}
            selecionadas={[]}
            estilos={estilos}
            aoExpandir={jest.fn()}
            aoAlternar={jest.fn()}
            aoAlternarTodas={jest.fn()}
        />
    );
    expect(screen.queryByText('Ciclo e Sangramento')).toBeNull();
});
