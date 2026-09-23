import { useState } from 'react';
import { CalendarBlank, WarningCircle } from 'phosphor-react-native';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import AccountStep from '../../features/onboarding/components/AccountStep';
import BirthDateStep from '../../features/onboarding/components/BirthDateStep';
import CycleLengthStep from '../../features/onboarding/components/CycleLengthStep';
import LastMenstruationStep from '../../features/onboarding/components/LastMenstruationStep';
import LutealPhaseLengthStep from '../../features/onboarding/components/LutealPhaseLengthStep';
import MenstruationLengthStep from '../../features/onboarding/components/MenstruationLengthStep';
import OnboardingComplete from '../../features/onboarding/components/OnboardingComplete';
import { salvarToken } from '../../services/auth/tokenStorage';

const iniciais = {
    nome: '', email: '', senha: '', confirmacao: '', aceitouTermos: false,
    dataNascimento: '', ultimaMenstruacao: null,
    duracaoCiclo: 28, duracaoMenstruacao: 5, duracaoLutea: 14
};

function paraIso(data) {
    if (!data) return null;
    if (data instanceof Date) return data.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
}

export default function OnboardingScreen({
    cadastrar, aoVoltar, aoEntrar, aoConcluir, logo,
    renderizarCalendario, renderizarSeletorCiclo,
    renderizarSeletorMenstruacao, renderizarSeletorLutea
}) {
    const [etapa, setEtapa] = useState(0);
    const [dados, setDados] = useState(iniciais);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const alterar = (mudanca) => setDados((atuais) => ({ ...atuais, ...mudanca }));
    const voltar = () => etapa === 0 ? aoVoltar?.() : setEtapa(etapa - 1);
    const avancar = () => setEtapa(etapa + 1);

    async function finalizar(duracaoLutea = dados.duracaoLutea) {
        if (duracaoLutea > (dados.duracaoCiclo || 28)
            - (dados.duracaoMenstruacao || 5) - 2) {
            setErro('A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.');
            return;
        }
        setCarregando(true);
        setErro(null);
        try {
            const resultado = await cadastrar({
                nome: dados.nome, email: dados.email, senha: dados.senha,
                dataNascimento: paraIso(dados.dataNascimento),
                dataInicioUltimaMenstruacao: paraIso(dados.ultimaMenstruacao.inicio),
                dataFimUltimaMenstruacao: paraIso(dados.ultimaMenstruacao.fim),
                duracaoCicloInformada: dados.duracaoCiclo,
                duracaoMenstruacaoInformada: dados.duracaoMenstruacao,
                duracaoLuteaInformada: duracaoLutea
            });
            await salvarToken(resultado.autenticacao);
            setEtapa(6);
        } catch (falha) {
            setErro(falha.mensagemUsuario || falha.message || 'Ocorreu um erro ao criar sua conta.');
        } finally {
            setCarregando(false);
        }
    }

    function avancarMenstruacao() {
        const inicio = paraIso(dados.ultimaMenstruacao?.inicio);
        const hoje = new Date().toISOString().slice(0, 10);
        if (!inicio || inicio > hoje) {
            setErro('Informe a data de início da sua última menstruação. Ela não pode ser uma data no futuro.');
            return;
        }
        avancar();
    }

    const comum = { aoVoltar: voltar, carregando };
    let conteudo;
    if (etapa === 0) conteudo = <AccountStep dados={dados} aoAlterar={alterar}
        aoAvancar={avancar} aoVoltar={voltar} aoEntrar={aoEntrar} />;
    if (etapa === 1) conteudo = <BirthDateStep {...comum} valor={dados.dataNascimento}
        aoAlterar={(dataNascimento) => alterar({ dataNascimento })} aoAvancar={avancar} />;
    if (etapa === 2) conteudo = <LastMenstruationStep {...comum}
        valor={dados.ultimaMenstruacao} aoAlterar={(ultimaMenstruacao) => alterar({ ultimaMenstruacao })}
        aoAvancar={avancarMenstruacao} renderizarCalendario={renderizarCalendario} />;
    if (etapa === 3) conteudo = <CycleLengthStep {...comum} valor={dados.duracaoCiclo}
        aoAlterar={(duracaoCiclo) => alterar({ duracaoCiclo })} aoAvancar={avancar}
        aoPular={() => { alterar({ duracaoCiclo: null }); avancar(); }} renderizarSeletor={renderizarSeletorCiclo} />;
    if (etapa === 4) conteudo = <MenstruationLengthStep {...comum} valor={dados.duracaoMenstruacao}
        aoAlterar={(duracaoMenstruacao) => alterar({ duracaoMenstruacao })} aoAvancar={avancar}
        aoPular={() => { alterar({ duracaoMenstruacao: null }); avancar(); }} renderizarSeletor={renderizarSeletorMenstruacao} />;
    if (etapa === 5) conteudo = <LutealPhaseLengthStep {...comum} valor={dados.duracaoLutea}
        aoAlterar={(duracaoLutea) => alterar({ duracaoLutea })} aoAvancar={finalizar}
        aoPular={() => { alterar({ duracaoLutea: null }); finalizar(null); }} renderizarSeletor={renderizarSeletorLutea} />;
    if (etapa === 6) conteudo = <OnboardingComplete logo={logo} aoIniciar={() => aoConcluir?.(dados)} />;

    return <>{conteudo}<SimpleModal visivel={Boolean(erro)} icone={erro?.includes('data') ? CalendarBlank : WarningCircle}
        titulo={erro?.includes('data') ? 'Data inválida' : 'Algo deu errado'} mensagem={erro}
        acaoPrincipal={{ texto: 'Entendi', aoPressionar: () => setErro(null) }} /></>;
}
