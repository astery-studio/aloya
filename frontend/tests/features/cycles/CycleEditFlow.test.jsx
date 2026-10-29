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

