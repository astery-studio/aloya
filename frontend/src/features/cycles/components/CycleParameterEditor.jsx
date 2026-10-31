import { useMemo } from 'react';
import { useTheme } from '../../../shared/hooks/useTheme';
import { criarEstilos } from './CycleParameterEditor.styles';
import ButtonScreen from '../../../shared/components/common/Button/ButtonScreen';
import { EditFieldSheet } from '../../../shared/components/feedback/EditFieldSheet/EditFieldSheet';

function CycleParameterEditor({
    visivel,
    label,
    valor,
    valorOriginal,
    erro,
    desabilitado,
    onAlterar,
    onCancelar,
    onSalvar
}) {
    const tema = useTheme();
    const estilos = useMemo(() => criarEstilos(tema), [tema]);
    const valorValido = Number.isSafeInteger(valor) && valor > 0;

    return (
        <EditFieldSheet
            corFundo={tema.escuro ? '#242424' : undefined}
            estiloPainel={estilos.painel}
            estiloCaixaCampo={estilos.caixaCampo}
            estiloCampo={estilos.textoCampo}
            visivel={visivel}
            titulo={`Editar ${label}`}
            tipo="numero"
            valor={valor}
            sufixo="dias"
            onAlterar={onAlterar}
            onFechar={onCancelar}
            erro={erro}
            salvando={desabilitado}
            rotuloAcessibilidade={label}
            botaoSalvar={
                <ButtonScreen
                    texto="Salvar"
                    variante="verde"
                    aoPressionar={onSalvar}
                    desativado={!valorValido || Boolean(erro) || valor === valorOriginal}
                    estilo={
                        (!valorValido ||
                            Boolean(erro) ||
                            valor === valorOriginal ||
                            typeof onSalvar !== 'function') &&
                        estilos.botaoSalvarDesativado
                    }
                    estiloTexto={
                        (!valorValido ||
                            Boolean(erro) ||
                            valor === valorOriginal ||
                            typeof onSalvar !== 'function') &&
                        estilos.textoSalvarDesativado
                    }
                />
            }
        />
    );
}

export { CycleParameterEditor };
