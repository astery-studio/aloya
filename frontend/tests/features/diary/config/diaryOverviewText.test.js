import {
    criarDescricaoResumo,
    formatarDestaque,
    listarDestaques,
    rotuloCategoriaResumo
} from '../../../../src/features/diary/config/diaryOverviewText';

test('combina destaques em uma frase natural', () => {
    expect(listarDestaques()).toBe('');
    expect(listarDestaques([{ valor: 'Fadiga' }])).toBe('fadiga');
    expect(listarDestaques([{ valor: 'Fadiga' }, { valor: 'Espinhas' }])).toBe('fadiga e espinhas');
});

test('usa o histórico pessoal apenas quando há informações suficientes', () => {
    expect(
        criarDescricaoResumo({
            fase: 'folicular',
            resumo: {
                informacoesSuficientes: true,
                destaques: [{ categoriaId: 'fluxo_menstrual', grupo: 'coagulos', valor: 'Grandes' }]
            }
        })
    ).toBe('Nos seus registros, você costuma relatar coágulos grandes no fluxo menstrual.');
    expect(
        criarDescricaoResumo({ fase: 'folicular', resumo: { informacoesSuficientes: false } })
    ).toBe('Nesta fase, é comum perceber mais energia, disposição e motivação.');
});

test.each([
    ['fluxo_menstrual', 'intensidade', 'Intenso', 'fluxo menstrual intenso'],
    ['fluxo_menstrual', 'coagulos', 'Grandes', 'coágulos grandes no fluxo menstrual'],
    ['fluxo_menstrual', 'aspecto', 'Marrom', 'fluxo menstrual de cor marrom'],
    ['sangramento_escape', 'cor', 'Rosado', 'sangramento de escape de cor rosado'],
    ['sangramento_escape', 'intensidade', 'Leve', 'sangramento de escape leve'],
    ['secrecao_corrimento', 'presenca', 'Pouca', 'pouca secreção/corrimento'],
    [
        'secrecao_corrimento',
        'consistencia',
        'Cremosa',
        'secreção/corrimento com consistência cremosa'
    ],
    ['secrecao_corrimento', 'cor', 'Branca', 'secreção/corrimento de cor branca'],
    ['secrecao_corrimento', 'caracteristicas', 'Sem odor', 'secreção/corrimento sem odor'],
    ['sintomas_fisicos', 'sintomas', 'Fadiga', 'fadiga como sintoma físico'],
    ['pele', 'caracteristicas', 'Espinhas', 'pele com espinhas'],
    ['cabelo', 'caracteristicas', 'Queda', 'cabelo com queda'],
    ['digestao', 'sintomas', 'Azia', 'azia entre os sinais digestivos'],
    ['banheiro', 'intestino', 'Normal', 'funcionamento intestinal normal'],
    ['banheiro', 'urina', 'Dor', 'dor ao urinar'],
    ['regiao_genital', 'sintomas', 'Coceira', 'coceira na região genital'],
    ['torax_peito', 'sintomas', 'Sensibilidade', 'sensibilidade no tórax/peito'],
    ['sintomas_emocionais', 'agradaveis', 'Feliz', 'humor descrito como feliz'],
    ['sintomas_pre_menstruais', 'sintomas', 'Ansiedade', 'ansiedade no período pré-menstrual'],
    ['energia', 'estado', 'Com energia', 'boa disposição e energia'],
    ['qualidade_sono', 'tipo', 'Bom', 'sono bom'],
    ['qualidade_sono', 'alteracoes', 'Insônia', 'insônia'],
    ['vida_social', 'interacao', 'Sociável', 'interação social descrita como sociável'],
    ['vida_social', 'relacionamentos', 'Aproximação', 'aproximação nos relacionamentos'],
    ['vida_social', 'experiencia', 'Saudade', 'experiência social descrita como saudade'],
    ['testes', 'teste', 'Gravidez', 'teste de gravidez'],
    ['testes', 'resultado', 'Negativo', 'resultado negativo em testes'],
    ['consultas', 'consulta', 'Ginecologista', 'consulta com ginecologista'],
    ['consultas', 'exame', 'Papanicolau', 'exame de papanicolau'],
    ['consultas', 'acompanhamento', 'Rotina', 'acompanhamento de rotina'],
    ['temperatura_basal', null, '36,5 °C', 'registros de temperatura basal'],
    ['peso', null, '62 kg', 'registros de peso'],
    ['tempo_sono', null, '480', 'registros do tempo de sono']
])('contextualiza %s/%s sem deixar o valor %s solto', (categoriaId, grupo, valor, esperado) => {
    expect(formatarDestaque({ categoriaId, grupo, valor })).toBe(esperado);
});

test('mantém fallback legível para futuras categorias do catálogo', () => {
    expect(rotuloCategoriaResumo('nova_categoria')).toBe('Nova categoria');
    expect(
        formatarDestaque({ categoriaId: 'nova_categoria', grupo: 'grupo', valor: 'Opção X' })
    ).toBe('opção x na categoria nova categoria');
});

test.each([
    [undefined, '', '', ''],
    ['fluxo_menstrual', 'coagulos', 'Nenhum', 'ausência de coágulos no fluxo menstrual'],
    ['fluxo_menstrual', 'coagulos', 'Muitos', 'muitos coágulos no fluxo menstrual'],
    ['secrecao_corrimento', 'presenca', 'Nenhuma', 'ausência de secreção/corrimento'],
    ['secrecao_corrimento', 'presenca', 'Moderada', 'quantidade moderada de secreção/corrimento'],
    ['secrecao_corrimento', 'presenca', 'Abundante', 'secreção/corrimento abundante'],
    ['pele', null, 'Oleosa', 'pele oleosa'],
    ['cabelo', null, 'Oleoso', 'cabelo oleoso'],
    ['digestao', null, 'Sem alterações', 'digestão sem alterações'],
    ['banheiro', 'intestino', 'Dor', 'dor intestinal'],
    ['banheiro', 'intestino', 'Frequente', 'frequente no funcionamento intestinal'],
    ['banheiro', 'urina', 'Normal', 'micção sem alterações'],
    ['banheiro', 'urina', 'Alteração na cor', 'alteração na cor da urina'],
    ['banheiro', 'urina', 'Frequente', 'frequente ao urinar'],
    ['regiao_genital', null, 'Sem alterações', 'região genital sem alterações'],
    ['torax_peito', null, 'Sem alterações', 'tórax/peito sem alterações'],
    ['energia', null, 'Inquieta', 'energia descrita como inquieta'],
    ['futuro', null, 'Futuro', 'futuro']
])('cobre a linguagem alternativa de %s/%s', (categoriaId, grupo, valor, esperado) => {
    expect(formatarDestaque({ categoriaId, grupo, valor })).toBe(esperado);
});

test('cobre rótulos inválidos, listas longas e resumo sem destaques', () => {
    expect(rotuloCategoriaResumo()).toBe('');
    expect(rotuloCategoriaResumo('   ')).toBe('');
    expect(rotuloCategoriaResumo('fluxo_menstrual')).toBe('Fluxo menstrual');
    expect(formatarDestaque()).toBe('');
    expect(formatarDestaque({ categoriaId: 'pele', valor: 2 })).toBe('');
    expect(formatarDestaque({ categoriaId: 'banheiro', grupo: 'outro', valor: 'Urgência' })).toBe(
        'urgência na categoria banheiro'
    );
    expect(listarDestaques([{ valor: 'A' }, { valor: 'B' }, { valor: 'C' }])).toBe(
        'a, b e c'
    );
    expect(criarDescricaoResumo({ fase: 'lutea', resumo: { informacoesSuficientes: true } })).toBe(
        'Nesta fase, são comuns mudanças de energia, sensibilidade e alterações de humor.'
    );
});
