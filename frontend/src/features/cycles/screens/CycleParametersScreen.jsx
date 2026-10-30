import { useState } from 'react';
import { SettingsLayout } from '../../settings/layouts/SettingsLayout/SettingsLayout';
import { CycleParametersFeedback } from '../components/CycleParametersFeedback';
import { CycleParametersForm } from '../components/CycleParametersForm';
import { CycleParametersStateView } from '../components/CycleParametersStateView';
import { useCycleParameters } from '../hooks/useCycleParameters';

function CycleParametersScreen({ service, onVoltar, onSessaoExpirada, onParametrosAtualizados }) {
    const [saidaSemSalvar, setSaidaSemSalvar] = useState(false);
    const parametros = useCycleParameters({
        service,
        onSessaoExpirada,
        onAtualizados: onParametrosAtualizados
    });

    function tentarVoltar() {
        if (parametros.salvando) return;
        if (parametros.alterado) setSaidaSemSalvar(true);
        else onVoltar?.();
    }

    let conteudo;

    if (parametros.carregando || parametros.erroCarregamento || !parametros.valores) {
        conteudo = (
            <CycleParametersStateView
                carregando={parametros.carregando}
                onTentarNovamente={parametros.tentarNovamente}
            />
        );
    } else {
        conteudo = (
            <CycleParametersForm
                valores={parametros.valores}
                erros={parametros.erros}
                onAlterar={parametros.alterar}
                onSalvar={parametros.salvar}
                podeSalvar={parametros.podeSalvar}
                salvando={parametros.salvando}
            />
        );
    }

    return (
        <>
            <SettingsLayout titulo="Parâmetros do Ciclo" onVoltar={tentarVoltar}>
                {conteudo}
            </SettingsLayout>
            <CycleParametersFeedback
                sucesso={parametros.sucesso}
                erro={parametros.erroSalvar}
                saidaSemSalvar={saidaSemSalvar}
                salvando={parametros.salvando}
                onFecharSucesso={parametros.fecharSucesso}
                onFecharErro={parametros.fecharErro}
                onTentarNovamente={parametros.salvar}
                onContinuarEditando={() => setSaidaSemSalvar(false)}
                onSairSemSalvar={onVoltar}
            />
        </>
    );
}

export { CycleParametersScreen };
