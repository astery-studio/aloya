import { fireEvent, screen } from '@testing-library/react-native';
import { MenstruationRegistrationScreen } from '../../../../src/features/cycles/screens/MenstruationRegistrationScreen';
import { renderWithTheme as render } from '../../../helpers/renderWithTheme';

const meses = [
    {
        mes: '2026-09',
        possuiCiclos: true,
        diasMenstruacao: [{ data: '2026-09-07', registroCicloId: 8 }],
        previsao: null
    }
];
function montar(props = {}, opcoes = {}) {
    return render(
        <MenstruationRegistrationScreen
            meses={meses}
            hoje="2026-09-25"
            onVoltar={jest.fn()}
            {...props}
        />,
        opcoes
    );
}

test('abre no mês atual após carregar os meses, mesmo com um dia anterior pré-selecionado', async () => {
    const propriedades = { hoje: '2026-10-30', datasSelecionadas: ['2026-09-21'] };
    const tela = await montar({ ...propriedades, meses: [] });
    expect(
        screen.getByTestId('calendario-cadastro-menstruacao').props.initialScrollIndex
    ).toBeUndefined();
    await tela.rerender(
        <MenstruationRegistrationScreen
            {...propriedades}
            meses={[...meses, { mes: '2026-10', diasMenstruacao: [], previsao: null }]}
        />
    );
    const lista = screen.getByTestId('calendario-cadastro-menstruacao').props;
    expect(lista.initialScrollIndex).toBe(1);
    expect(lista.getItemLayout(null, 1).offset).toBeGreaterThan(0);
    expect(lista.getItemLayout(null, 0).offset).toBe(0);
});

test('duplo toque em um dia livre solicita uma nova faixa e não abre confirmação', async () => {
    const alternar = jest.fn();
    const iniciar = jest.fn();
    await montar({ onAlternarData: alternar, onIniciarFaixa: iniciar });
    const dia = screen.getByRole('button', { name: '4 de setembro de 2026' });
    await fireEvent.press(dia);
    await fireEvent.press(dia);
    expect(alternar).toHaveBeenCalledTimes(1);
    expect(alternar).toHaveBeenCalledWith('2026-09-04');
    expect(iniciar).toHaveBeenCalledWith('2026-09-04');
    expect(screen.queryByText('Ciclo existente')).toBeNull();
    await fireEvent(dia, 'accessibilityAction', { nativeEvent: { actionName: 'iniciarFaixa' } });
    expect(iniciar).toHaveBeenCalledTimes(2);
});

test('dia livre é enviado por um toque, datas futuras são bloqueadas e salvar exige seleção', async () => {
    const alternar = jest.fn();
    await montar({ onAlternarData: alternar, onSalvar: jest.fn() });
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: '21 de setembro de 2026' }));
    expect(alternar).toHaveBeenCalledWith('2026-09-21');
    expect(screen.queryByText('Ciclo existente')).toBeNull();
    expect(
        screen.getByRole('button', { name: '26 de setembro de 2026, data futura' })
    ).toBeDisabled();
});

test('dia registrado abre orientação para editar sem alterar a seleção', async () => {
    const alternar = jest.fn();
    await montar({ onAlternarData: alternar });
    await fireEvent.press(
        screen.getByRole('button', { name: '7 de setembro de 2026, menstruação registrada' })
    );
    expect(screen.getByText('Ciclo existente')).toBeOnTheScreen();
    expect(alternar).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByText('Ciclo existente')).toBeNull();
});

test('seleção controlada de intervalo é conservada após falha e enviada sem confirmação', async () => {
    const datas = ['2026-09-21', '2026-09-22', '2026-09-23'];
    const salvar = jest.fn();
    const retry = jest.fn();
    const tela = await montar({ datasSelecionadas: datas, onSalvar: salvar });
    expect(screen.getByRole('button', { name: '22 de setembro de 2026, selecionado' })).toHaveProp(
        'accessibilityState',
        expect.objectContaining({ selected: true })
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(salvar).toHaveBeenCalledWith(datas);
    await tela.rerender(
        <MenstruationRegistrationScreen
            meses={meses}
            hoje="2026-09-25"
            datasSelecionadas={datas}
            erro={{ codigo: 'REDE' }}
            onTentarNovamente={retry}
        />
    );
    expect(
        screen.getByText('Não foi possível sincronizar alguns registros. Verifique sua conexão.')
    ).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledTimes(1);
    await tela.rerender(
        <MenstruationRegistrationScreen meses={meses} hoje="2026-09-25" datasSelecionadas={datas} />
    );
    expect(screen.getByTestId('selecao-2026-09-22')).toBeOnTheScreen();
});

test('primeiro dia mostra orientação, salvamento bloqueia ações e sucesso segue o protótipo', async () => {
    const fechar = jest.fn();
    const tela = await montar({
        datasSelecionadas: ['2026-09-21'],
        salvando: true,
        onSalvar: jest.fn()
    });
    expect(
        screen.getByText('Agora toque no último dia para completar o período menstrual.')
    ).toBeOnTheScreen();
    expect(
        screen.getByRole('button', { name: '21 de setembro de 2026, selecionado' })
    ).toBeDisabled();
    await tela.rerender(<MenstruationRegistrationScreen sucesso onFecharFeedback={fechar} />);
    expect(screen.getByText('Menstruação cadastrada')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    expect(fechar).toHaveBeenCalledTimes(1);
});

test('aplica o modo escuro ao fundo, orientação e dias selecionados', async () => {
    await montar(
        { datasSelecionadas: ['2026-09-21'] },
        { preferencia: 'escuro', esquemaDoSistema: 'dark' }
    );

    expect(screen.getByTestId('tela-cadastro-menstruacao')).toHaveStyle({
        backgroundColor: '#181C1A'
    });
    expect(screen.getByTestId('orientacao-cadastro-menstruacao')).toHaveStyle({
        backgroundColor: 'transparent',
        borderColor: '#9FD6B6'
    });
    expect(screen.getByTestId('selecao-2026-09-21')).toHaveStyle({
        backgroundColor: 'rgba(212, 119, 105, 0.28)'
    });
});
