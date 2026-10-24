/**
 * Orquestra etapas, validações, cadastro e persistência da sessão inicial.
 */
import { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { CalendarBlankIcon as CalendarBlank,
    WarningCircleIcon as WarningCircle } from '../../../shared/components/icons/AppIcons';
import SimpleModal from '../../../shared/components/feedback/Modal/SimpleModal';
import AccountStep from '../components/AccountStep/AccountStep';
import BirthDateStep from '../components/BirthDateStep/BirthDateStep';
import CycleLengthStep from '../components/CycleLengthStep/CycleLengthStep';
import LastMenstruationStep from '../components/LastMenstruationStep/LastMenstruationStep';
import LutealPhaseLengthStep from '../components/LutealPhaseLengthStep/LutealPhaseLengthStep';
import MenstruationLengthStep from '../components/MenstruationLengthStep/MenstruationLengthStep';
import OnboardingComplete from '../components/OnboardingComplete/OnboardingComplete';
import { salvarToken } from '../../../shared/storage/tokenStorage';
import { isValidDate } from '../../../shared/utils/validation/isValidDate';
import { isValidEmail } from '../../../shared/utils/validation/isValidEmail';

const iniciais = {
    nome: '', email: '', senha: '', confirmacao: '', aceitouTermos: false,
    dataNascimento: '', emailResponsavelLegal: '', ultimaMenstruacao: null,
    duracaoCiclo: 28, duracaoMenstruacao: 5, duracaoLutea: 14
};

function possuiDadosPreenchidos(dados) {
    return Object.keys(iniciais).some((campo) => dados[campo] !== iniciais[campo]);
}

const etapaPorCampo = {
    nome: 0, email: 0, senha: 0,
    dataNascimento: 1, emailResponsavelLegal: 1,
    dataInicioUltimaMenstruacao: 2, dataFimUltimaMenstruacao: 2,
    duracaoCicloInformada: 3, duracaoMenstruacaoInformada: 4,
    duracaoLuteaInformada: 5
};

const campoNaTela = {
    dataInicioUltimaMenstruacao: 'ultimaMenstruacao',
    dataFimUltimaMenstruacao: 'ultimaMenstruacao',
    duracaoCicloInformada: 'duracaoCiclo',
    duracaoMenstruacaoInformada: 'duracaoMenstruacao',
    duracaoLuteaInformada: 'duracaoLutea'
};

function paraIso(data) {
    if (!data) return null;
    if (data instanceof Date) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data;
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
}

function ehMenorDe16(dataTexto, hoje = new Date()) {
    if (!isValidDate(dataTexto)) return false;
    const [dia, mes, ano] = dataTexto.split('/').map(Number);
    const nascimento = new Date(ano, mes - 1, dia);
    if (nascimento > hoje) return false;
    let idade = hoje.getFullYear() - ano;
    const aniversarioAindaNaoChegou =
        hoje.getMonth() + 1 < mes ||
        (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
    if (aniversarioAindaNaoChegou) idade -= 1;
    return idade < 16;
}

export default function OnboardingScreen({
    cadastrar, verificarEmailDisponivel, aoVoltar, aoEntrar, aoConcluir, logo
}) {
    const [etapa, setEtapa] = useState(0);
    const [dados, setDados] = useState(iniciais);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState(null);
    const [errosCampos, setErrosCampos] = useState({});
    const [destinoSaida, setDestinoSaida] = useState(null);
    const alterar = useCallback(
        (mudanca) => setDados((atuais) => ({ ...atuais, ...mudanca })), []
    );
    const alterarCampo = useCallback((campo, valor) => {
        setDados((atuais) => ({ ...atuais, [campo]: valor }));
        setErrosCampos((atuais) => {
            if (!atuais[campo]) return atuais;
            const proximos = { ...atuais };
            delete proximos[campo];
            return proximos;
        });
    }, []);
    const solicitarSaida = useCallback((destino = aoVoltar) => {
        if (carregando || etapa === 6) return;
        if (!possuiDadosPreenchidos(dados)) {
            destino?.();
            return;
        }
        setDestinoSaida(() => destino || (() => {}));
    }, [aoVoltar, carregando, dados, etapa]);
    const voltar = () => {
        if (carregando || etapa === 6) return;
        if (etapa === 0) solicitarSaida();
        else setEtapa(etapa - 1);
    };
    const avancar = () => setEtapa(etapa + 1);

    useEffect(() => {
        const inscricao = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (carregando || etapa === 6) return true;
                solicitarSaida();
                return true;
            }
        );
        return () => inscricao.remove();
    }, [carregando, etapa, solicitarSaida]);

    function confirmarSaida() {
        const destino = destinoSaida;
        setDados({ ...iniciais });
        setEtapa(0);
        setErro(null);
        setErrosCampos({});
        setDestinoSaida(null);
        destino?.();
    }

    function tratarFalhaCadastro(falha) {
        if (falha.codigo === 'EMAIL_JA_CADASTRADO') {
            const mensagem = 'Este e-mail já está em uso. Faça login ou use outro e-mail.';
            setEtapa(0);
            setErrosCampos({ email: mensagem });
            setErro({ titulo: 'Este e-mail já está em uso', mensagem, emailEmUso: true });
            return;
        }
        const detalhe = falha.codigo === 'ERRO_VALIDACAO'
            ? falha.detalhes?.find(({ campo }) => etapaPorCampo[campo] !== undefined)
            : null;
        if (detalhe) {
            const campo = campoNaTela[detalhe.campo] || detalhe.campo;
            setEtapa(etapaPorCampo[detalhe.campo]);
            setErrosCampos({ [campo]: detalhe.mensagem });
            setErro({ titulo: 'Revise este dado', mensagem: detalhe.mensagem });
            return;
        }
        setErro({ titulo: 'Algo deu errado', mensagem:
            'Não foi possível criar sua conta agora. Tente novamente em instantes.' });
    }

    async function finalizar(sobrescritas = {}) {
        if (carregando) return;
        const dadosCadastro = { ...dados, ...sobrescritas };
        const duracaoLutea = dadosCadastro.duracaoLutea;
        if (duracaoLutea !== null && duracaoLutea > (dadosCadastro.duracaoCiclo ?? 28)
            - (dadosCadastro.duracaoMenstruacao ?? 5) - 2) {
            setErro({ titulo: 'Duração inválida', mensagem:
                'A duração da fase lútea informada não é compatível com o ciclo. Ajuste os valores.' });
            return;
        }
        setCarregando(true);
        setErro(null);
        try {
            const resultado = await cadastrar({
                nome: dadosCadastro.nome, email: dadosCadastro.email, senha: dadosCadastro.senha,
                dataNascimento: paraIso(dadosCadastro.dataNascimento),
                dataInicioUltimaMenstruacao: paraIso(dadosCadastro.ultimaMenstruacao?.inicio),
                dataFimUltimaMenstruacao: paraIso(dadosCadastro.ultimaMenstruacao?.fim),
                duracaoCicloInformada: dadosCadastro.duracaoCiclo,
                duracaoMenstruacaoInformada: dadosCadastro.duracaoMenstruacao,
                duracaoLuteaInformada: duracaoLutea,
                ...(ehMenorDe16(dadosCadastro.dataNascimento)
                    && dadosCadastro.emailResponsavelLegal.trim()
                    ? { emailResponsavelLegal: dadosCadastro.emailResponsavelLegal.trim() }
                    : {})
            });
            await salvarToken(resultado.autenticacao);
            setDados(dadosCadastro);
            setDestinoSaida(null);
            setEtapa(6);
        } catch (falha) {
            tratarFalhaCadastro(falha);
        } finally {
            setCarregando(false);
        }
    }

    function avancarMenstruacao() {
        const inicio = paraIso(dados.ultimaMenstruacao?.inicio);
        const hoje = paraIso(new Date());
        if (!inicio || inicio > hoje) {
            setErro({ titulo: 'Data inválida', mensagem:
                'Informe a data de início da sua última menstruação. Ela não pode ser uma data no futuro.' });
            return;
        }
        avancar();
    }

    function avancarSemMenstruacao() {
        alterarCampo('ultimaMenstruacao', null);
        avancar();
    }

    async function avancarConta() {
        setErrosCampos({});
        if (dados.nome.trim().length < 3) {
            setErrosCampos({ nome: 'O nome deve ter pelo menos 3 caracteres.' });
            setErro({ titulo: 'Nome inválido', mensagem: 'O nome deve ter pelo menos 3 caracteres.' });
        } else if (!/^[\p{L}]+(?:[ -][\p{L}]+)*$/u.test(dados.nome.trim())) {
            setErrosCampos({ nome: 'Use apenas letras, espaços ou hífens.' });
            setErro({ titulo: 'Nome inválido', mensagem: 'Use apenas letras, espaços ou hífens.' });
        } else if (!isValidEmail(dados.email)) {
            setErrosCampos({ email: 'Informe um e-mail válido.' });
            setErro({ titulo: 'E-mail inválido', mensagem: 'Informe um e-mail válido.' });
        } else if (dados.senha.length < 8) {
            setErrosCampos({ senha: 'A senha deve possuir pelo menos 8 caracteres.' });
            setErro({ titulo: 'Senha inválida', mensagem:
                'A senha deve possuir pelo menos 8 caracteres.' });
        } else if (dados.senha !== dados.confirmacao) {
            setErrosCampos({ confirmacao: 'As senhas não coincidem.' });
            setErro({ titulo: 'Senhas diferentes', mensagem: 'As senhas não coincidem.' });
        } else {
            setCarregando(true);
            try {
                const resultado = await verificarEmailDisponivel?.(dados.email);
                if (resultado && !resultado.disponivel) {
                    const mensagem = 'Este e-mail já está em uso. Faça login ou use outro e-mail.';
                    setErrosCampos({ email: mensagem });
                    setErro({ titulo: 'Este e-mail já está em uso', mensagem, emailEmUso: true });
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
        if (ehMenorDe16(dados.dataNascimento)) {
            const mensagem = validarEmailResponsavel(dados.emailResponsavelLegal);
            if (mensagem) {
                setErro({ titulo: 'E-mail inválido', mensagem });
                return;
            }
        } else {
            alterar({ emailResponsavelLegal: '' });
        }
        setErrosCampos({});
        avancar();
    }

    function validarEmailResponsavel(valor) {
        const email = valor.trim();
        let mensagem = null;
        if (email && !isValidEmail(email)) mensagem = 'Informe um e-mail válido.';
        if (email && email.toLowerCase() === dados.email.trim().toLowerCase()) {
            mensagem = 'O e-mail do responsável deve ser diferente do seu e-mail de cadastro.';
        }
        setErrosCampos((atuais) => ({ ...atuais, emailResponsavelLegal: mensagem }));
        return mensagem;
    }

    function alterarEmailResponsavel(emailResponsavelLegal) {
        alterar({ emailResponsavelLegal });
        if (errosCampos.emailResponsavelLegal) validarEmailResponsavel(emailResponsavelLegal);
    }

    const comum = { aoVoltar: voltar, carregando };
    let conteudo;
    if (etapa === 0) conteudo = <AccountStep dados={dados} aoAlterar={alterar}
        aoAvancar={avancarConta} aoVoltar={voltar}
        aoEntrar={() => solicitarSaida(aoEntrar)}
        carregando={carregando} erros={errosCampos} />;
    if (etapa === 1) conteudo = <BirthDateStep {...comum} valor={dados.dataNascimento}
        aoAlterar={(dataNascimento) => alterarCampo('dataNascimento', dataNascimento)}
        menorDe16={ehMenorDe16(dados.dataNascimento)}
        emailResponsavelLegal={dados.emailResponsavelLegal}
        aoAlterarEmailResponsavel={alterarEmailResponsavel}
        aoValidarEmailResponsavel={() => validarEmailResponsavel(dados.emailResponsavelLegal)}
        erroEmailResponsavel={errosCampos.emailResponsavelLegal}
        aoAvancar={avancarNascimento} />;
    if (etapa === 2) conteudo = <LastMenstruationStep {...comum}
        valor={dados.ultimaMenstruacao}
        aoAlterar={(ultimaMenstruacao) => alterarCampo('ultimaMenstruacao', ultimaMenstruacao)}
        erro={errosCampos.ultimaMenstruacao} aoAvancar={avancarMenstruacao}
        aoNaoSei={avancarSemMenstruacao} />;
    if (etapa === 3) conteudo = <CycleLengthStep {...comum} valor={dados.duracaoCiclo}
        aoAlterar={(duracaoCiclo) => alterarCampo('duracaoCiclo', duracaoCiclo)}
        erro={errosCampos.duracaoCiclo} aoAvancar={avancar}
        aoPular={() => { alterarCampo('duracaoCiclo', null); avancar(); }} />;
    if (etapa === 4) conteudo = <MenstruationLengthStep {...comum} valor={dados.duracaoMenstruacao}
        aoAlterar={(duracaoMenstruacao) => alterarCampo('duracaoMenstruacao', duracaoMenstruacao)}
        erro={errosCampos.duracaoMenstruacao} aoAvancar={avancar}
        aoPular={() => { alterarCampo('duracaoMenstruacao', null); avancar(); }} />;
    if (etapa === 5) conteudo = <LutealPhaseLengthStep {...comum} valor={dados.duracaoLutea}
        aoAlterar={(duracaoLutea) => alterarCampo('duracaoLutea', duracaoLutea)}
        erro={errosCampos.duracaoLutea} aoAvancar={() => finalizar()}
        aoPular={() => {
            alterarCampo('duracaoLutea', null);
            finalizar({ duracaoLutea: null });
        }} />;
    if (etapa === 6) conteudo = <OnboardingComplete logo={logo} aoIniciar={() => aoConcluir?.(dados)} />;

    const irParaLogin = () => {
        setDados({ ...iniciais });
        setErro(null);
        aoEntrar?.();
    };

    return <>{conteudo}<SimpleModal visivel={Boolean(erro)}
        icone={erro?.titulo?.includes('Data') ? CalendarBlank : WarningCircle}
        titulo={erro?.titulo} mensagem={erro?.mensagem}
        acaoPrincipal={erro?.emailEmUso
            ? { texto: 'Fazer login', aoPressionar: irParaLogin }
            : { texto: 'Entendi', aoPressionar: () => setErro(null) }}
        acaoSecundaria={erro?.emailEmUso
            ? { texto: 'Voltar', aoPressionar: () => setErro(null) } : undefined} />
        <SimpleModal visivel={Boolean(destinoSaida)} aoFechar={() => setDestinoSaida(null)}
            icone={WarningCircle} titulo="Sair do cadastro?"
            mensagem="Se você sair agora, os dados preenchidos serão perdidos."
            acaoPrincipal={{ texto: 'Continuar cadastro',
                aoPressionar: () => setDestinoSaida(null) }}
            acaoSecundaria={{ texto: 'Sair e descartar', aoPressionar: confirmarSaida }} />
    </>;
}
