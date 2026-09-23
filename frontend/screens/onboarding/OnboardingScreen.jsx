/**
 * Orquestra etapas, validações, cadastro e persistência da sessão inicial.
 */
import { useCallback, useState } from 'react';
import { CalendarBlankIcon as CalendarBlank } from 'phosphor-react-native/src/icons/CalendarBlank';
import { WarningCircleIcon as WarningCircle } from 'phosphor-react-native/src/icons/WarningCircle';
import SimpleModal from '../../components/feedback/Modal/SimpleModal';
import AccountStep from '../../features/onboarding/components/AccountStep';
import BirthDateStep from '../../features/onboarding/components/BirthDateStep';
import CycleLengthStep from '../../features/onboarding/components/CycleLengthStep';
import LastMenstruationStep from '../../features/onboarding/components/LastMenstruationStep';
import LutealPhaseLengthStep from '../../features/onboarding/components/LutealPhaseLengthStep';
import MenstruationLengthStep from '../../features/onboarding/components/MenstruationLengthStep';
import OnboardingComplete from '../../features/onboarding/components/OnboardingComplete';
import { salvarToken } from '../../services/auth/tokenStorage';
import { isValidDate } from '../../utils/validation/isValidDate';
import { isValidEmail } from '../../utils/validation/isValidEmail';

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
    cadastrar, verificarEmailDisponivel, aoVoltar, aoEntrar, aoConcluir, logo,
    renderizarSeletorCiclo,
    renderizarSeletorMenstruacao, renderizarSeletorLutea
}) {
    const [etapa, setEtapa] = useState(0);
    const [dados, setDados] = useState(iniciais);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const alterar = useCallback(
        (mudanca) => setDados((atuais) => ({ ...atuais, ...mudanca })), []
    );
    const voltar = () => etapa === 0 ? aoVoltar?.() : setEtapa(etapa - 1);
    const avancar = () => setEtapa(etapa + 1);

    async function finalizar(duracaoLutea = dados.duracaoLutea) {
        if (duracaoLutea > (dados.duracaoCiclo || 28)
            - (dados.duracaoMenstruacao || 5) - 2) {
            setErro({ titulo: 'Duração inválida', mensagem:
                'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.' });
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
            setErro({ titulo: 'Algo deu errado', mensagem:
                falha.mensagemUsuario || falha.message || 'Ocorreu um erro ao criar sua conta.' });
        } finally {
            setCarregando(false);
        }
    }

    function avancarMenstruacao() {
        const inicio = paraIso(dados.ultimaMenstruacao?.inicio);
        const hoje = new Date().toISOString().slice(0, 10);
        if (!inicio || inicio > hoje) {
            setErro({ titulo: 'Data inválida', mensagem:
                'Informe a data de início da sua última menstruação. Ela não pode ser uma data no futuro.' });
            return;
        }
        avancar();
    }

    async function avancarConta() {
        if (dados.nome.trim().length < 3) {
            setErro({ titulo: 'Nome inválido', mensagem: 'O nome deve ter pelo menos 3 caracteres.' });
        } else if (!/^[\p{L}]+(?:[ -][\p{L}]+)*$/u.test(dados.nome.trim())) {
            setErro({ titulo: 'Nome inválido', mensagem: 'Use apenas letras, espaços ou hífens.' });
        } else if (!isValidEmail(dados.email)) {
            setErro({ titulo: 'E-mail inválido', mensagem: 'Informe um e-mail válido.' });
        } else if (dados.senha !== dados.confirmacao) {
            setErro({ titulo: 'Senhas diferentes', mensagem: 'A confirmação deve ser igual à senha.' });
        } else {
            setCarregando(true);
            try {
                const resultado = await verificarEmailDisponivel?.(dados.email);
                if (resultado && !resultado.disponivel) {
                    setErro({ titulo: 'E-mail já cadastrado', mensagem:
                        'Este e-mail já possui uma conta. Tente fazer login.' });
                    return;
                }
                avancar();
            } catch (falha) {
                setErro({ titulo: 'Algo deu errado', mensagem:
                    falha.mensagemUsuario || 'Não foi possível verificar o e-mail.' });
            } finally {
                setCarregando(false);
            }
        }
    }

    function avancarNascimento() {
        const [dia, mes, ano] = dados.dataNascimento.split('/').map(Number);
        const data = new Date(ano, mes - 1, dia);
        if (!isValidDate(dados.dataNascimento) || data > new Date()) {
            setErro({ titulo: 'Data inválida', mensagem: 'Informe uma data de nascimento válida.' });
            return;
        }
        avancar();
    }

    const comum = { aoVoltar: voltar, carregando };
    let conteudo;
    if (etapa === 0) conteudo = <AccountStep dados={dados} aoAlterar={alterar}
        aoAvancar={avancarConta} aoVoltar={voltar} aoEntrar={aoEntrar}
        carregando={carregando} />;
    if (etapa === 1) conteudo = <BirthDateStep {...comum} valor={dados.dataNascimento}
        aoAlterar={(dataNascimento) => alterar({ dataNascimento })} aoAvancar={avancarNascimento} />;
    if (etapa === 2) conteudo = <LastMenstruationStep {...comum}
        valor={dados.ultimaMenstruacao} aoAlterar={(ultimaMenstruacao) => alterar({ ultimaMenstruacao })}
        aoAvancar={avancarMenstruacao} />;
    if (etapa === 3) conteudo = <CycleLengthStep {...comum} valor={dados.duracaoCiclo}
        aoAlterar={(duracaoCiclo) => alterar({ duracaoCiclo })} aoAvancar={avancar}
        aoPular={() => { alterar({ duracaoCiclo: null }); avancar(); }} renderizarSeletor={renderizarSeletorCiclo} />;
    if (etapa === 4) conteudo = <MenstruationLengthStep {...comum} valor={dados.duracaoMenstruacao}
        aoAlterar={(duracaoMenstruacao) => alterar({ duracaoMenstruacao })} aoAvancar={avancar}
        aoPular={() => { alterar({ duracaoMenstruacao: null }); avancar(); }} renderizarSeletor={renderizarSeletorMenstruacao} />;
    if (etapa === 5) conteudo = <LutealPhaseLengthStep {...comum} valor={dados.duracaoLutea}
        aoAlterar={(duracaoLutea) => alterar({ duracaoLutea })} aoAvancar={() => finalizar()}
        aoPular={() => { alterar({ duracaoLutea: null }); finalizar(null); }} renderizarSeletor={renderizarSeletorLutea} />;
    if (etapa === 6) conteudo = <OnboardingComplete logo={logo} aoIniciar={() => aoConcluir?.(dados)} />;

    return <>{conteudo}<SimpleModal visivel={Boolean(erro)}
        icone={erro?.titulo?.includes('Data') ? CalendarBlank : WarningCircle}
        titulo={erro?.titulo} mensagem={erro?.mensagem}
        acaoPrincipal={{ texto: 'Entendi', aoPressionar: () => setErro(null) }} /></>;
}
