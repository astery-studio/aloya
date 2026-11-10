import assert from 'node:assert/strict';
import test from 'node:test';

import {
    formatarContato,
    resolverVinculo
} from '../../../../src/features/support-network/presenters/supportContact.presenter.js';

const agora = new Date('2026-11-08T12:00:00.000Z');

test('apresenta categoria e suas permissões efetivas sem expor o objeto do banco', () => {
    const categoria = {
        id: 7,
        nome: 'Profissional',
        conjuntoDadosVisiveis: ['geral.fase_atual']
    };

    const resultado = resolverVinculo({ categoria, permissoesIndividuais: [] });

    assert.deepEqual(resultado, {
        tipo: 'categoria',
        rotulo: 'Categoria: Profissional',
        categoria: { id: 7, nome: 'Profissional' },
        permissoes: ['geral.fase_atual']
    });
    assert.notEqual(resultado.categoria, categoria);
});

test('apresenta permissões individuais quando não há categoria', () => {
    assert.deepEqual(
        resolverVinculo({
            categoria: null,
            permissoesIndividuais: ['saude.consultas', null]
        }),
        {
            tipo: 'individual',
            rotulo: 'Permissão individual',
            categoria: null,
            permissoes: ['saude.consultas']
        }
    );
});

test('formata contato ativo com nome, ativação e ações permitidas', () => {
    const dataResposta = new Date('2026-10-30T10:00:00.000Z');
    const contato = formatarContato(
        {
            id: 19,
            contato: { nome: '  Anna  ' },
            emailConvidado: 'anna@email.com',
            status: 'ativo',
            categoria: null,
            permissoesIndividuais: ['geral.fase_atual'],
            dataEnvio: new Date('2026-10-20T10:00:00.000Z'),
            dataResposta
        },
        agora
    );

    assert.equal(contato.identificacao, 'Anna');
    assert.equal(contato.statusRotulo, 'Ativo');
    assert.equal(contato.dataAtivacao, dataResposta);
    assert.equal(contato.aguardando, null);
    assert.deepEqual(contato.acoes, {
        podeAlterarVinculo: true,
        podeRemover: true,
        podeReenviarConvite: false
    });
});

test('usa e-mail quando ainda não existe nome e habilita somente o reenvio pendente', () => {
    const contato = formatarContato(
        {
            id: 20,
            contato: null,
            emailConvidado: 'rafael@email.com',
            status: 'pendente',
            categoria: null,
            permissoesIndividuais: [],
            dataEnvio: new Date('2026-11-05T10:00:00.000Z'),
            dataResposta: null
        },
        agora
    );

    assert.equal(contato.nome, null);
    assert.equal(contato.identificacao, 'rafael@email.com');
    assert.equal(contato.dataAtivacao, null);
    assert.equal(contato.aguardando.rotulo, 'Aguardando há 3 dias');
    assert.equal(contato.acoes.podeReenviarConvite, true);
});

test('apresenta vínculo revogado como contato inativo', () => {
    const dataResposta = new Date('2026-11-05T10:00:00.000Z');
    const contato = formatarContato(
        {
            id: 21,
            contato: { nome: 'Luan' },
            emailConvidado: 'luan@email.com',
            status: 'revogado',
            categoria: null,
            permissoesIndividuais: [],
            dataEnvio: new Date('2026-10-01T10:00:00.000Z'),
            dataResposta
        },
        agora
    );

    assert.equal(contato.status, 'inativo');
    assert.equal(contato.statusRotulo, 'Inativo');
    assert.equal(contato.dataDesativacao, dataResposta);
    assert.equal(contato.aguardando.rotulo, 'Desativado há 3 dias');
    assert.deepEqual(contato.acoes, {
        podeAlterarVinculo: false,
        podeRemover: true,
        podeReenviarConvite: true
    });
});

test('mantém convite recusado no histórico', () => {
    const dataResposta = new Date('2026-11-06T10:00:00.000Z');
    const contato = formatarContato(
        {
            id: 22,
            contato: { nome: 'Maria' },
            emailConvidado: 'maria@email.com',
            status: 'recusado',
            categoria: null,
            permissoesIndividuais: [],
            dataEnvio: new Date('2026-11-01T10:00:00.000Z'),
            dataResposta
        },
        agora
    );

    assert.equal(contato.status, 'recusado');
    assert.equal(contato.statusRotulo, 'Recusado');
    assert.equal(contato.dataRecusa, dataResposta);
    assert.equal(contato.aguardando.rotulo, 'Recusado há 2 dias');
    assert.equal(contato.acoes.podeReenviarConvite, true);
});
