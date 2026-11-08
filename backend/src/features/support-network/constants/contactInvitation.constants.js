import {
    ordenarPermissoesCategoria,
    permissaoCategoriaEhValida,
    permissoesDaCategoria
} from './permissionCategory.constants.js';

const PAPEIS_TITULAR = Object.freeze(['principal', 'principal_e_contato_apoio']);
const PAPEIS_CONTATO = Object.freeze(['contato_apoio', 'principal_e_contato_apoio']);
const STATUS_CONTA_ATIVA = 'ativa';
const STATUS_CONVITE_PENDENTE = 'pendente';
const STATUS_VINCULO_ATIVO = 'ativo';
const DURACAO_CONVITE_MS = 7 * 24 * 60 * 60 * 1000;

function papelEhTitular(papel) {
    return PAPEIS_TITULAR.includes(papel);
}

function usuarioEhContatoCadastrado(usuario) {
    return (
        usuario?.statusConta === STATUS_CONTA_ATIVA &&
        PAPEIS_CONTATO.includes(usuario?.papel)
    );
}

export {
    DURACAO_CONVITE_MS,
    PAPEIS_CONTATO,
    PAPEIS_TITULAR,
    STATUS_CONTA_ATIVA,
    STATUS_CONVITE_PENDENTE,
    STATUS_VINCULO_ATIVO,
    ordenarPermissoesCategoria,
    papelEhTitular,
    permissaoCategoriaEhValida,
    permissoesDaCategoria,
    usuarioEhContatoCadastrado
};
