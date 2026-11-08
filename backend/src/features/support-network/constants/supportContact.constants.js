const STATUS_CONTATO_PENDENTE = 'pendente';
const STATUS_CONTATO_ATIVO = 'ativo';

const STATUS_CONTATOS_VISIVEIS = Object.freeze([
    STATUS_CONTATO_PENDENTE,
    STATUS_CONTATO_ATIVO
]);

const DIAS_PARA_CONVITE_ATRASADO = 7;

const MENSAGEM_ERRO_LISTAGEM_CONTATOS =
    'Não foi possível carregar sua Rede de Apoio no momento. Tente novamente.';

const MENSAGEM_ERRO_REENVIO_CONVITE =
    'Não foi possível reenviar o convite no momento. Tente novamente.';

export {
    DIAS_PARA_CONVITE_ATRASADO,
    MENSAGEM_ERRO_LISTAGEM_CONTATOS,
    MENSAGEM_ERRO_REENVIO_CONVITE,
    STATUS_CONTATO_ATIVO,
    STATUS_CONTATO_PENDENTE,
    STATUS_CONTATOS_VISIVEIS
};
