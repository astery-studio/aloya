import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import {
    CycleEditFlow,
    converterCampoParaIso,
    formatarDataParaCampo,
    validarEdicao
} from '../../../src/features/cycles/CycleEditFlow';

jest.mock('../../../src/features/cycles/components/CycleEditSheet/CycleEditSheet', () => {
    const React = require('react');
    const { Pressable, TextInput, View } = require('react-native');
    return {
        CycleEditSheet: (props) =>
            props.visivel
                ? React.createElement(
                      View,
                      null,
                      React.createElement(TextInput, {
                          accessibilityLabel: 'Início',
                          value: props.dataInicio,
                          onChangeText: props.onAlterarInicio
                      }),
                      React.createElement(TextInput, {
                          accessibilityLabel: 'Fim',
                          value: props.dataFim,
                          onChangeText: props.onAlterarFim
                      }),
                      React.createElement(Pressable, {
                          accessibilityRole: 'button',
                          accessibilityLabel: 'Salvar alterações',
                          accessibilityState: { disabled: !props.alterado },
                          disabled: !props.alterado,
                          onPress: props.onSalvar
                      }),
                      React.createElement(Pressable, {
                          accessibilityRole: 'button',
                          accessibilityLabel: 'Fechar edição',
                          onPress: props.onFechar
                      })
                  )
                : null
    };
});

jest.mock('../../../src/shared/components/feedback/Modal/SimpleModal', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return function Modal(props) {
        if (!props.visivel) return null;
        return React.createElement(
            View,
            null,
            React.createElement(Text, null, props.titulo),
            props.acaoPrincipal
                ? React.createElement(Pressable, {
                      accessibilityRole: 'button',
                      accessibilityLabel: props.acaoPrincipal.texto,
                      onPress: props.acaoPrincipal.aoPressionar
                  })
                : null,
            props.acaoSecundaria
                ? React.createElement(Pressable, {
                      accessibilityRole: 'button',
                      accessibilityLabel: props.acaoSecundaria.texto,
                      onPress: props.acaoSecundaria.aoPressionar
                  })
                : null,
            React.createElement(Pressable, {
                accessibilityRole: 'button',
                accessibilityLabel: `Fechar ${props.titulo}`,
                onPress: props.aoFechar
            })
        );
    };
});

test('converte e valida datas sem alterar o fuso', () => {
    expect(formatarDataParaCampo(null)).toBe('');
    expect(formatarDataParaCampo('2026-09-04')).toBe('04/09/2026');
    expect(converterCampoParaIso('04/09/2026')).toBe('2026-09-04');
    expect(converterCampoParaIso('', true)).toBeNull();
    expect(converterCampoParaIso('2026-09-04')).toBeUndefined();
    expect(converterCampoParaIso('31/02/2026')).toBeUndefined();
    expect(validarEdicao('31/02/2026', '')).toMatchObject({ titulo: 'Data incorreta' });
    expect(validarEdicao('01/01/2999', '')).toMatchObject({ titulo: 'Data no futuro' });
    expect(validarEdicao('10/09/2026', '09/09/2026')).toMatchObject({
        titulo: 'Data incorreta'
    });
});

test('abre preenchido, confirma e salva pelo serviço real do fluxo', async () => {
    const service = { editar: jest.fn().mockResolvedValue({}) };
    const onAtualizado = jest.fn().mockResolvedValue(true);
    const onFechar = jest.fn();

    await render(
        <CycleEditFlow
            ciclo={{ id: '3', dataInicio: '2026-09-04', dataFim: '2026-09-08' }}
            service={service}
            onFechar={onFechar}
            onAtualizado={onAtualizado}
        />
    );

    expect(screen.getByLabelText('Início')).toHaveProp('value', '04/09/2026');
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Início'), '03/09/2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Confirmar' }));

    await waitFor(() =>
        expect(service.editar).toHaveBeenCalledWith('3', {
            dataInicio: '2026-09-03',
            dataFim: '2026-09-08'
        })
    );
    expect(onAtualizado).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Ciclo atualizado com sucesso')).toBeOnTheScreen();

