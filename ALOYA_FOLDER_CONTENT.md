# Aloya — Base de conteúdo para o folder do evento

**27 de novembro de 2026 · Dossiê interno e textos candidatos para o material impresso**

**Síntese.** O Aloya é um aplicativo móvel de acompanhamento menstrual e autoconhecimento. O núcleo mais bem sustentado para o evento reúne registros de menstruação, calendário, histórico, Diário e organização do uso de anticoncepcionais. A proposta inclui a Rede de Apoio por convite e permissões. Convites e gestão de vínculos estão na base integrada. A experiência ampliada de consulta por contatos está em uma frente de desenvolvimento separada. A demonstração e qualquer chamada para instalar o aplicativo dependem da confirmação do pacote que será levado ao evento.

## 1. Investigação e critérios

A investigação cruzou a Visão, duas versões dos Requisitos, Casos de Uso, regras de negócio, análise do ciclo, identidade visual e protótipo com README, documentação técnica, fluxos reais de interface, serviços e regras de backend. Em funcionalidades sensíveis, a análise seguiu a ligação entre interface, serviço e regra de acesso. As evidências estão indexadas na seção 8.

| Referência | Revisão consultada | Papel no dossiê |
| --- | --- | --- |
| `origin/develop` | `a3671869e9801bff059e8a7f06f2725b728d0347`, 26/11/2026 | Referência de integração para descrever a oferta demonstrável em código. A ponta também foi consultada diretamente no remoto em 27/11. |
| `origin/main` | `36d5901e7a8f9cc5749b055a7d9edbca8830f9d3`, 30/10/2026 | Linha principal remota observada, anterior à develop. A existência dessa revisão não identifica o pacote instalado ou distribuído. |
| `feature/contatos` local | `7e8d46ed973bb70ea641657364da69646e9f9c98`, 27/11/2026 | Evidência de implementação em desenvolvimento. O commit contém trabalhos adicionais sobre consultas compartilhadas e artes das fases. Usei a revisão gravada para classificar os recursos. |
| `feature/sobre-aplicacao` local | `80b9a942586245f06e0cee1c4575ee79e7aea73b`, 25/11/2026 | Fonte complementar para identidade, textos de interface, autoria e arquivo do logo. A branch tem uma base diferente e não comprova a disponibilidade da própria tela na develop. |

**Como ler o status.** **Integrada** significa que a interface e seu caminho de uso foram encontrados na develop. **Parcial** indica que o código sustenta apenas parte da experiência ou que a disponibilidade depende de uma condição relevante. **Em branch** indica código existente em uma linha local de desenvolvimento cujo recurso ainda precisa ser confirmado no pacote. **Planejada ou sem entrega demonstrada** indica documentação, protótipo ou configuração insuficiente para anunciar a experiência como pronta. Em todos os casos, disponibilidade em lojas, maturidade em produção e resultados de uso exigem evidência própria.

A revisão foi documental e estática, com inspeção visual de páginas do guia e do protótipo. Não foram executados o app, o backend ou a suíte de testes para este dossiê. Capturas históricas são referências de composição. Para impressão, as telas devem vir do pacote escolhido, com dados fictícios.

## 2. O Aloya em 15 respostas

### 1. O que é

Um aplicativo móvel de acompanhamento menstrual e autoconhecimento. Reúne o que a pessoa registra sobre a menstruação e seu cotidiano, organiza os registros em calendário, histórico e Diário e pode mostrar estimativas de fase quando há dados e condições para calculá-las. A organização de anticoncepcionais e a Rede de Apoio atendem necessidades complementares. [P1, T1–T8]

### 2. Qual é o propósito

Dar contexto às experiências ao longo do ciclo. A proposta é permitir que a pessoa observe mudanças, volte às próprias anotações e tenha acesso a informações educativas em linguagem prática. O cuidado aparece na possibilidade de escolher o que registrar, a maneira de interpretar o histórico e se deseja convidar alguém para participar da Rede. [P1, P4, T2–T8, T11]

### 3. Qual problema busca resolver

As informações do ciclo podem ficar espalhadas entre calendário, memória, anotações e rotinas de uso. Quando a pessoa quer lembrar o que percebeu no mês anterior, encontra datas em um lugar e observações em outro. Também pode faltar espaço para acompanhar o ciclo por interesse no próprio cotidiano, independentemente de objetivos reprodutivos, e para permitir apoio de pessoas de confiança de forma voluntária. A Visão trata essas dificuldades como motivação de projeto. Suas generalizações sobre concorrentes, preços e efeitos na saúde precisam de pesquisa independente antes de virar afirmações públicas. [P1, P2]

### 4. Quem é o público

Pessoas que menstruam e desejam acompanhar o próprio ciclo, com diferentes identidades de gênero, objetivos e hábitos de registro. Pessoas convidadas compõem um público secundário e desempenham um papel diferente. O convite pode se dirigir a alguém de confiança, sem pressupor relação romântica. O código tem um fluxo de autorização por responsável para o acesso à Rede em determinadas contas. A idade nessa regra do recurso não define, por si só, a elegibilidade geral do produto. [P1, P2, T7, T8]

### 5. Quais necessidades atende

Lembrar quando ocorreu a menstruação, encontrar registros anteriores, anotar como se sentiu, consultar informações sobre fases, acompanhar a rotina de um anticoncepcional e decidir se deseja envolver alguém. O tema claro, escuro ou automático responde a preferências de apresentação. A consulta compartilhada depende da versão e das permissões disponíveis. [T2–T8, T10]

### 6. Como funciona da perspectiva de quem usa

A pessoa pode criar conta ou entrar. O cadastro orienta o preenchimento dos dados iniciais do ciclo e oferece alternativas para campos que podem ser pulados. Na develop, o cadastro comum encaminha ao Início, o cadastro de perfil de apoio segue a Membros, e o login convencional pode abrir em Configurações. A navegação leva ao Início, aos ciclos, ao Diário, à Rede e às configurações. Ao registrar dias de menstruação, a pessoa pode voltar ao calendário ou ao histórico. O Diário permite adicionar observações e recuperá-las depois. As estimativas aparecem quando há dados e condições de cálculo. Anticoncepcionais e convites são fluxos próprios. [T1–T8]

### 7. Quais são as principais funcionalidades

Acompanhamento menstrual com registro, calendário, histórico e estimativas. Diário com observações, categorias e filtros. Organização do uso informado de anticoncepcionais. Rede de Apoio com convites, vínculos e permissões. Complementam o núcleo os textos educativos das fases, o check-in conectado ao Diário, a pausa guiada, as preferências visuais e o suporte institucional. A seção 3 detalha a situação e os limites de cada recurso. [T2–T10]

### 8. Quais benefícios práticos oferece

Facilita achar as próprias anotações e consultar datas anteriores. Permite reunir observações e sintomas por data, confirmar manualmente o uso informado de um anticoncepcional e ajustar escolhas de participação na Rede. O benefício é de organização, consulta e autonomia prática. Aprendizado medido, adesão ao método, redução de ansiedade, resultados clínicos e impacto populacional seguem sem evidência própria neste recorte. [P1, T2–T8]

### 9. Quais são os diferenciais

A combinação de calendário, histórico e Diário dá contexto ao ciclo a partir de registros feitos pela própria pessoa. O produto apresenta quatro fases como referência educativa e distingue registros de estimativas. A linguagem se dirige a pessoas que menstruam, e a participação de contatos começa por convite. São escolhas observáveis de produto. A investigação não incluiu comparação de mercado que sustente exclusividade, superioridade ou liderança. [P1, P5, T2–T8, T11]

### 10. Qual é a proposta de valor

Reunir, em uma mesma experiência, as datas e observações que ajudam alguém a acompanhar o próprio ciclo e manter a rotina organizada, com espaço para diferentes identidades e com participação de outras pessoas por escolha. Para o folder, a proposta fica mais clara quando associada a uma ação concreta, como registrar um dia, revisitar o Diário ou consultar o calendário. [P1, T2–T8]

### 11. Qual impacto pretende gerar

A equipe pretende ampliar o espaço para autoconhecimento, reduzir a dispersão das informações e tornar a experiência de acompanhamento mais acolhedora. Também pretende dar à pessoa escolhas sobre o envolvimento de contatos próximos. São intenções de produto. O folder pode comunicá-las como propósito, com verbos como “busca”, “foi pensado para” e “permite”. [P1, P5, T11]

### 12. O que torna a experiência relevante

A pessoa consegue começar por uma ação simples e retornar ao dado sob outras perspectivas. O registro dá origem a uma marcação por data, o mês oferece contexto visual, o histórico reúne ciclos anteriores e o Diário acrescenta a experiência vivida. A página do ciclo combina educação e ações rápidas. Textos, ícones e temas ajudam a orientar a leitura. A relevância decorre da continuidade entre ações, mesmo que a pessoa use somente uma parte dos recursos. [T1–T5, V1–V3]

### 13. Qual é o estágio atual

Há um produto móvel com núcleo integrado e frentes ativas de desenvolvimento. A develop tem integração do calendário, Diário, histórico, organização de anticoncepcionais e gestão da Rede. A branch de contatos amplia o acesso compartilhado e a branch Sobre contém a apresentação institucional e o logo. Existe configuração Expo para Android e iOS e versão declarada `1.0.0`. A revisão não identificou um build oficial de evento, evidência de distribuição pública em loja, uma política comercial atual nem métricas de adoção. A versão declarada em arquivo não substitui a versão instalada. [T1, T8, T9, T11]

### 14. O que apresentar presencialmente

Em 60–90 segundos, começar com uma dor reconhecível e demonstrar uma tarefa completa. Mostrar um calendário com dados fictícios, abrir uma anotação do Diário e, se houver tempo, expor como se confirma um uso registrado ou como se configura um convite. A consulta compartilhada pode ser tratada como demonstração de desenvolvimento somente se a equipe liberar a branch e um roteiro específico. Para o impresso, uma captura nítida do calendário e uma do Diário mostram duas utilidades diferentes. [T2–T8]

### 15. Qual a história ou motivação

A documentação de Visão situa a concepção em uma trajetória acadêmica de Engenharia de Software e explica a preocupação com autoconhecimento, diversidade de identidade e escolhas de compartilhamento. A autoria institucional atual aparece como Astery, com a assinatura “Produtos de Software”. As duas informações podem coexistir em registros internos. Use a identificação institucional no folder após validação editorial. A menção acadêmica, eventuais marcas de terceiros, a grafia de um crédito e qualquer narrativa sobre a origem do nome exigem confirmação. [P1, P6, T11]

## 3. Funcionalidades, problemas e benefícios

| Recurso e status | O que faz e como funciona | Problema atendido e benefício concreto | Limite para o folder |
| --- | --- | --- | --- |
| **Cadastro, login e recuperação · Integrada** | Boas-vindas leva a Entrar ou Criar conta. O cadastro orienta dados da conta para o fluxo e oferece passos iniciais do ciclo. Há recuperação e redefinição de senha. | Cria uma conta para retomar a experiência e acessar o histórico associado. | Mostrar o onboarding só se ele explicar a entrada. Evitar imprimir regras de elegibilidade ou detalhes de verificação. [T1] |
| **Registro menstrual · Integrada** | A pessoa marca o período menstrual no fluxo de registro. A edição e a exclusão de registros estão ligadas ao histórico. | Centraliza datas que, de outra forma, dependeriam de memória ou anotações dispersas. | Dizer “registre os dias de menstruação”. Evitar o verbo “detectar” e a ideia de registro automático. [T2] |
| **Calendário mensal · Integrada** | Exibe o mês com marcas e legenda de informações do ciclo. A experiência distingue o que foi registrado de informações estimadas. Permite navegar e seguir para ações relacionadas a datas. | Oferece uma visão rápida de datas e facilita voltar a um dia. | Em captura, mostrar legenda, estado fictício e a distinção entre registro e estimativa. [T2] |
| **Histórico menstrual · Integrada** | Reúne ciclos ou períodos anteriores e apresenta informações para revisitar e comparar registros. O fluxo encaminha à edição ou remoção quando aplicável. | Recupera registros com menos dependência de memória e ajuda a observar a variação das datas ao longo do tempo. | A comparação é descritiva. Não prometer identificar causas de sintomas ou detectar condições. [T2, T3] |
| **Estimativas das fases · Integrada, condicional** | O serviço usa dados informados e histórico disponível para fazer estimativas. Quando aplicável, a interface mostra próximas datas, fase, ovulação estimada e janela fértil estimada. | Oferece contexto para interpretar o calendário e consultar conteúdo sobre as fases. | A menção recomendada é “estimativas das fases quando há dados suficientes”. Evitar datas exatas, “dias seguros” ou comprovação de ovulação. [P4, T3] |
| **Indicador de confiabilidade · Integrada, condicional** | A classificação leva em conta a origem, quantidade e consistência dos registros e situações como ambiguidades ou variações. A tela explica o nível. | Ajuda a distinguir uma referência com pouco histórico de outra baseada em dados mais consistentes. | Usar “qualidade do histórico usado na estimativa”. O indicador não mede probabilidade de acerto nem precisão clínica. [T3] |
| **Diário e histórico de observações · Integrada** | A pessoa registra observações, sintomas e percepções por data, seleciona categorias aplicáveis, pode editar ou excluir entradas e consulta o histórico com filtros de data, categoria e fase. | Mantém experiências do dia a dia em um lugar e facilita encontrar uma anotação para reler. | Exemplos públicos adequados incluem humor, sono e sintomas. Não listar campos íntimos no folder ou em capturas. [T4] |
| **Check-in e reflexão · Integrada, com refinamentos em branch** | A tela inicial oferece escolhas rápidas que podem ser salvas no Diário e um espaço de reflexão associado à entrada. A branch de contatos acrescenta trabalho específico de persistência do check-in. | Reduz o esforço para começar a anotar e permite acrescentar detalhes quando fizer sentido. | Descrever como atalho para registrar observações. Validar na build a persistência e a leitura dos tipos de marcação mostrados em tela. [T5, T8] |
| **Conteúdo educativo e pausa guiada · Integrada** | A página do ciclo oferece explicações sobre fases e uma pausa com instrução de respiração. A interface prevê apresentação com movimento reduzido. | Permite consultar explicações no contexto da tela e oferece uma atividade breve e opcional. | A educação é geral. A pausa não é tratamento nem tem efeito terapêutico demonstrado neste dossiê. [T5] |
| **Organização de anticoncepcionais · Integrada** | Permite cadastrar e editar o método, escolher a programação suportada, marcar manualmente os usos e consultar registros. Há fluxo de remoção do acompanhamento ativo. | Reúne rotina e histórico de confirmações no mesmo lugar e facilita conferir o que foi anotado. | “Organize a programação e registre os usos” descreve a oferta. Não implica prescrição, comprovação de adesão ou proteção contraceptiva. [T6] |
| **Alertas de anticoncepcionais e notificações gerais · Parcial** | Há campos de horário e intensidade no formulário, textos de interface e eventos internos para algumas operações. A investigação não confirmou entrega geral de alertas no dispositivo ou destino funcional para todo o menu de notificações. | A configuração registra preferências. O benefício de receber lembretes depende da entrega efetiva no pacote. | Omitir “receba lembretes” até testar agendamento, permissões do SO, entrega e cancelamento. Não confundir aviso de interface, mensagem por e-mail e notificação push. [T1, T6, T7] |
| **Rede de Apoio e convites · Integrada** | A pessoa escolhe um contato, envia um convite e administra vínculos. Convites recebidos têm fluxos de aceite ou recusa. Configurações permitem escolher categorias e permissões individuais e gerenciar o vínculo. | Possibilita envolver alguém por escolha e vai além de um cadastro de contatos. | A apresentação deve separar convite de acesso efetivo. A pessoa convidada decide se aceita. Disponibilidade, mensagens e condições de autorização precisam ser validadas no ambiente do evento. [T7] |
| **Consulta de informações pela Rede · Em branch** | A branch de contatos acrescenta fluxo do contato convidado para consultar recortes autorizados, com estados de permissão ou revogação. O código contempla fase, dicas, calendário ou histórico, anticoncepcionais e categorias autorizadas do Diário, conforme regras de cada tela. Há uma prévia de desenvolvimento e ligação fora da prévia na própria branch. | Permite oferecer contexto a quem foi convidado, com um alcance vinculado às escolhas de permissão. | Não anunciar todas as categorias como integradas à develop. Separar existência em código de autorização e disponibilidade no pacote. Efeitos de revogação dizem respeito a acesso futuro pelo controle. Evitar promessas sobre informação já vista ou copiada. [T7, T8] |
| **Preferências, conta e perfil · Integrada** | A pessoa pode escolher a aparência, consultar e editar dados de perfil e usar ações de senha, encerramento da sessão ou exclusão de conta. | Ajusta a experiência visual e oferece formas de gerenciar a conta. | Para um folder curto, o tema pode aparecer como detalhe de interface. A ação de excluir conta não sustenta uma declaração sobre prazos, retenção ou cópias residuais. [T10] |
| **Envio posterior de registro menstrual · Parcial** | Existe fila local de alterações menstruais e tentativa posterior de sincronização em casos previstos. A interface distingue pendência e falha. | Evita perder imediatamente uma alteração menstrual em certas interrupções de conexão. | Não anunciar “funciona offline”. A fila é específica. Cadastro, consulta remota e Rede têm outras dependências. [T2, T9] |
| **Suporte institucional · Código disponível** | O endereço `aloya.support@gmail.com` aparece na configuração legal e no conteúdo da tela Sobre em branch. A interface de suporte da branch permite abrir e-mail e copiar o endereço. | Oferece um caminho para perguntas e relatos sobre o aplicativo. | Validar operação do endereço para o evento. A consulta a minutas legais na develop está condicionada a desenvolvimento. Não anunciar chat, atendimento clínico, resposta imediata ou canal jurídico oficial. [T9, T11] |
| **Motor térmico · Parcial e experimental** | O backend recebe dados de temperatura quando aplicável e executa uma análise em modo sombra. A documentação técnica descreve cálculo sem alterar as previsões mostradas. | Permite investigar hipóteses técnicas internamente. Para a pessoa, o benefício verificável se limita ao registro quando o campo estiver disponível. | Omitir do material promocional. A análise não valida ovulação, não altera a confiança pública e não autoriza alegação de desempenho. [P4, T9] |
| **Chat, exportação e central de notificações · Planejada ou sem entrega demonstrada** | Visão, requisitos e casos de uso descrevem essas capacidades. Componentes de menu, termos de protótipo ou configurações isoladas não demonstram uso de ponta a ponta. | A intenção é facilitar atendimento, acesso a dados e acompanhamento de eventos. | Não listar como recursos disponíveis. Se a equipe falar de futuro no evento, identificar como intenção, sem prazo ou promessa pública. [P1–P3, T1, T6, T9] |

**Formulação curta para um rodapé impresso.** As estimativas podem variar. Use-as apenas para acompanhar o ciclo. O Aloya não confirma a ovulação, não realiza diagnósticos e não é um método contraceptivo.

**Roteiro de demonstração.** Use uma conta de demonstração com datas e observações fictícias. Percurso sugerido: Início, calendário com legenda, registro, Diário e histórico. Mostre uma edição ou uma confirmação manual somente depois que o público compreender a utilidade principal. Encerre com uma pergunta que convide à conversa, como “O que você gostaria de conseguir revisitar sobre o seu ciclo?”. Para demonstrar a Rede com conteúdo compartilhado, separe titular e contato em contas fictícias e valide previamente convite, aceite e revogação na build escolhida.

## 4. Banco de conteúdo para o folder

Os textos a seguir são candidatos editoriais. No fechamento, retirar de cada peça qualquer referência a um recurso ausente na versão do evento. As notas sobre roteiro, evidências, limitações e pendências são de uso interno.

### Descrição em uma frase

> O Aloya é um aplicativo de acompanhamento menstrual que reúne calendário, histórico e Diário para você registrar e revisitar suas experiências ao longo do ciclo.

### Descrição curta · 31 palavras

> O Aloya reúne calendário menstrual, histórico e Diário para acompanhar o ciclo e revisitar observações. Também ajuda a organizar o uso de anticoncepcionais e oferece uma Rede de Apoio por convite.

### Descrição intermediária · 80 palavras

> O Aloya é um aplicativo de acompanhamento menstrual para pessoas que querem conhecer melhor o próprio ciclo. Você pode registrar os dias de menstruação, consultar o calendário e revisitar sintomas, emoções e outras observações no Diário. Quando há dados suficientes, o aplicativo apresenta estimativas das fases do ciclo. Também é possível organizar a programação de anticoncepcionais e marcar os usos informados. Se quiser envolver alguém de confiança, a Rede de Apoio oferece um fluxo de convite com escolhas de permissão.

### Apresentação institucional aprofundada

O Aloya é um aplicativo de acompanhamento menstrual feito para pessoas que querem observar o próprio ciclo e guardar, de forma organizada, o que percebem ao longo do tempo. Datas, sintomas e experiências do dia a dia podem ganhar contexto quando ficam disponíveis para consulta em conjunto. O produto considera diferentes identidades de gênero e formas de vivenciar a menstruação.

A pessoa pode registrar seus dias de menstruação, consultar o calendário e voltar ao histórico quando quiser lembrar o que anotou. Quando há informações suficientes, o aplicativo apresenta estimativas que ajudam a navegar pelas fases do ciclo. O Diário complementa as datas com espaço para registrar observações e reler experiências anteriores. Os conteúdos educativos explicam as fases em linguagem acessível, e as estimativas devem ser usadas como referência de acompanhamento.

Quem usa anticoncepcional pode organizar sua programação e marcar manualmente os usos informados. A Rede de Apoio parte de uma escolha pessoal. A pessoa pode convidar alguém de confiança e gerenciar permissões de participação. O convite e seu aceite têm papéis próprios. O que pode ser consultado pela pessoa convidada depende das permissões e da versão utilizada.

A proposta do Aloya é abrir espaço para o autoconhecimento, sem presumir a identidade, a regularidade do ciclo ou os planos de quem usa o aplicativo. Sua função é organizar informações e apoiar o acompanhamento. O aplicativo não realiza diagnósticos, não confirma a ovulação e não deve ser usado como método contraceptivo.

**Crédito institucional opcional.** “Idealizado e desenvolvido pela Astery. Produtos de Software.” Usar somente com a assinatura autorizada para o evento. Reservar créditos individuais para material com espaço e grafia confirmada.

### Explicação acessível do problema

> Lembrar quando foi a última menstruação pode ser mais fácil do que lembrar como você se sentiu naquela semana. Quando datas, sintomas e outras observações ficam guardados em lugares diferentes, é difícil voltar a eles e entender o contexto. Também vale poder acompanhar o ciclo do seu jeito, sem presumir o que você quer saber ou com quem deseja compartilhar.

### Apresentação da solução

> O Aloya reúne registros em calendário, histórico e Diário. O calendário mostra as datas no mês. O histórico ajuda a retomar registros anteriores. No Diário, você pode anotar o que percebe e encontrar essas observações depois. As estimativas aparecem quando há dados suficientes para calculá-las e podem mudar. Se você usa anticoncepcional, pode organizar a programação e registrar o uso. Se quiser envolver alguém de confiança, a Rede de Apoio começa por um convite, com escolhas de permissão.

### Funcionalidades em títulos e descrições para a peça

| Título sugerido | Texto candidato |
| --- | --- |
| **Calendário menstrual** | Marque os dias de menstruação e veja suas anotações de data no calendário. |
| **Histórico do ciclo** | Consulte registros anteriores e observe como as datas variam ao longo do tempo. |
| **Entenda as fases** | Explore conteúdos sobre as fases do ciclo e consulte estimativas quando houver dados suficientes. |
| **Diário de observações** | Registre sintomas, emoções ou impressões do dia a dia e volte às anotações quando quiser. |
| **Check-in no Diário** | Comece com algumas escolhas sobre como está se sentindo e acrescente detalhes no Diário. |
| **Rotina de anticoncepcionais** | Organize a programação do seu método e marque os usos que você registrou. |
| **Rede de Apoio** | Convide alguém de confiança, se quiser, e gerencie o vínculo e as permissões. |
| **Tema claro ou escuro** | Escolha a aparência do app ou acompanhe a configuração do seu aparelho. |
| **Converse com a equipe** | Envie dúvidas ou sugestões sobre o aplicativo pelo canal de suporte confirmado para o evento. |

Para uma lista de quatro itens, selecionar **Calendário e histórico**, **Diário**, **Rotina de anticoncepcionais** e **Rede de Apoio**. Explicar as fases junto ao acompanhamento. Mencionar check-in, tema ou pausa guiada na demonstração se houver tempo.

### Benefícios para quem usa

- Reunir datas e observações em um lugar.
- Encontrar uma anotação anterior sem depender apenas da memória.
- Comparar o que registrou em momentos diferentes, com contexto.
- Entender quando o app está mostrando uma informação registrada e quando está mostrando uma estimativa.
- Organizar horários ou rotina do método que já utiliza e conferir confirmações registradas.
- Escolher se deseja convidar alguém e administrar as permissões da Rede.
- Consultar explicações sobre as fases em uma experiência que considera diferentes identidades de gênero.

### Diferenciais como escolhas de produto

1. **O ciclo aparece com contexto.** O calendário e o histórico organizam datas. O Diário é o lugar das observações que dão sentido a essas datas.
2. **A educação aparece perto do registro.** As quatro fases têm espaço na experiência e as estimativas são tratadas como referências.
3. **O apoio começa por escolha.** Convite, resposta e permissões são etapas distintas. O recorte concreto de conteúdo consultável depende do pacote.
4. **A linguagem acolhe diferentes pessoas que menstruam.** O produto evita que uma única identidade de gênero ou objetivo reprodutivo defina toda a experiência.
5. **O app reúne uso cotidiano e reflexão.** Uma data, um check-in ou uma anotação longa são formas diferentes de começar, de acordo com o que a pessoa quer registrar.

### Dez sugestões de slogan

São propostas para o evento. A frase atual da interface da branch Sobre e a frase usada na redação anterior aparecem no registro de divergências. A equipe pode escolher uma versão para o impresso.

1. Seu ciclo, pelas suas próprias anotações.
2. Observe seu ciclo, no seu ritmo.
3. Espaço para o que você percebe.
4. Seu ciclo, suas experiências.
5. Observe, anote e volte quando quiser.
6. Datas que ajudam a contar seu ciclo.
7. Entenda seu ciclo a partir do que você registra.
8. Acompanhe o que muda, dia a dia.
9. Um lugar para as suas observações.
10. Acompanhe seu ciclo do seu jeito.

### Dez títulos para a capa

1. **Aloya. Seu ciclo, suas experiências.**
2. **Conheça o Aloya**
3. **Seu ciclo, em um só lugar**
4. **Um calendário para o seu ciclo**
5. **O que você percebe ao longo do ciclo?**
6. **Do calendário às suas anotações**
7. **Acompanhe seu ciclo no seu ritmo**
8. **Um espaço para registrar o que você sente**
9. **Calendário e Diário para o seu ciclo**
10. **Mais contexto para as suas anotações**

Se a capa usar um título conceitual, incluir a categoria em linha separada, como “Aplicativo de acompanhamento menstrual”. Se a capa usar um título funcional, reservar a frase de posicionamento para a primeira face interna.

### Chamadas para ação

| Situação | CTA |
| --- | --- |
| Há apresentação no local | **Veja o Aloya em ação.** |
| A equipe fará demonstrações curtas | **Experimente acompanhar um ciclo de demonstração.** |
| A equipe quer iniciar conversa | **Conte à equipe o que você gostaria de acompanhar.** |
| Existe página oficial validada | **Escaneie o QR code para conhecer o Aloya.** |
| Existe formulário aprovado e com propósito definido | **Receba novidades do Aloya.** |
| O canal foi confirmado para o evento | **Fale com a equipe do Aloya.** |
| As lojas e o pacote já foram verificados | **Baixe o Aloya.** |

**CTA recomendado sem depender de loja.** “Veja o Aloya em ação.” É verificável na presença da equipe e combina com uma demonstração de 60–90 segundos. Se o folder também for levado para fora do evento, incluir uma forma de contato válida e uma alternativa textual ao QR code. Testar o destino e o tamanho impresso antes de fechar a peça.

### Palavras-chave

Acompanhamento menstrual · autoconhecimento · calendário menstrual · histórico · Diário · observações do dia a dia · fases do ciclo · estimativas · rotina de anticoncepcionais · Rede de Apoio · participação voluntária · autonomia · inclusão · acolhimento.

### Mensagens centrais para a conversa do evento

| Mensagem | Como sustentar em uma fala curta |
| --- | --- |
| **Acompanhar o ciclo vai além de lembrar datas.** | Mostrar uma data no calendário e uma observação fictícia no Diário. |
| **Você pode voltar ao que registrou.** | Abrir uma entrada anterior e mostrar a diferença entre data e anotação. |
| **Estimativas são referências.** | Apontar a legenda ou a explicação da interface sem prometer que uma data ocorrerá. |
| **Apoio é uma escolha.** | Explicar convite, aceite e gestão de permissão. Adaptar a demonstração à build. |
| **O Aloya é para pessoas que menstruam.** | Usar a própria linguagem do folder e da demonstração. Evitar pressupor gênero ou intenção de engravidar. |

## 5. Identidade visual e verbal para o folder

### 5.1 O que está documentado e o que é interpretação

| Camada | Registro |
| --- | --- |
| **Guia de identidade** | Conceito **Terra e Raiz**. O guia associa terracota, verde e areia a acolhimento, maturidade e conexão com o corpo. Recomenda superfícies com pouca elevação, uso contextual de cores, iconografia Phosphor, DM Sans e formas de fases com silhuetas distintas. [P5] |
| **Produto integrado** | Tokens de tema claro e escuro, paleta semântica, superfícies, textos e estilos de componentes estão no código. Telas usam hierarquia de títulos, cards, ícones, controles de seleção e elementos como legenda e estados de carregamento ou resultado. [V1–V3] |
| **Trabalhos em branch** | A branch Sobre traz o logo e uma abertura cromática. A branch de contatos contém quatro PNGs de fases conectados ao componente de arte da Home. A existência desses arquivos não confirma que façam parte da build de evento. [V4, V5] |
| **Leitura editorial para impressão** | A marca pode ser apresentada de forma humana, serena e concreta. Como aplicação no folder, fundo areia, títulos em verde e terracota como acento dão continuidade aos materiais. Azul e âmbar podem organizar chamadas secundárias. Essa distribuição é uma proposta de conteúdo visual, ainda sujeita ao design final. |

### 5.2 Paleta HEX

| Papel | HEX | Uso verificado ou orientação para a peça |
| --- | --- | --- |
| Terracota de marca | **#C85A44** | Primária no código e no guia. Usar em destaques gráficos; conferir legibilidade antes de usar em texto pequeno. |
| Verde-floresta | **#2C4C3B** | Secundária de marca e destaque no tema claro. Pode sustentar título, chamada institucional e elementos gráficos. |
| Areia | **#F7F5F0** | Fundo claro padrão. |
| Branco | **#FFFFFF** | Superfícies claras. |
| Carvão | **#222222** | Texto principal do tema claro. |
| Cinza quente | **#5C5C59** | Texto secundário do tema claro. |
| Borda e divisor no claro | **#E6E2D8** / **#EDEAE4** | Bordas e linhas do tema claro. |
| Verde de sucesso | **#3B8255** | Feedback de sucesso. O guia recomenda manter significado contextual. |
| Âmbar | **#D68C3A** | Aviso. Pode compor acentos gráficos sem carregar informação sozinho. |
| Vermelho de atenção | **#B43D3D** | Erro. Dispensável como protagonista do folder. |
| Azul acinzentado | **#4A758E** | Informação. Pode diferenciar conteúdo educativo. |
| Fundo e superfície escura | **#181C1A** / **#232926** | Tema escuro em execução. |
| Texto e destaque escuros em execução | **#F4F1EA** / **#C4C8C5** / **#9FD6B6** | Texto principal, secundário e destaque. O guia também traz **#EAE8E3** como texto claro em sua proposta escura. Para reprodução de telas, usar a revisão capturada. |

Os valores acima são referências em HEX/RGB. A gráfica precisa aplicar o perfil de impressão e verificar a prova física com o papel escolhido. Evitar deduzir um CMYK universal. Manter texto e legenda legíveis mesmo quando as cores impressas se aproximarem. [P5, V1]

### 5.3 Tipografia, logo, formas e iconografia

- **DM Sans.** Família documentada e configurada no produto. O código integra pesos 300, 400, 500, 600 e 700. Exemplos da escala móvel são H1 28, H2 22, corpo 16 e legenda 14. Para o impresso, o designer deve definir a escala em pontos a partir da prova de leitura. [P5, V2]
- **Logo Aloya.** O arquivo `frontend/assets/aloya-logo.png` existe na branch Sobre e é usado na abertura. A marca examinada inclui símbolo orgânico e a palavra Aloya. Preservar proporção e cores. Procurar arquivo mestre vetorial e variante autorizada para fundo escuro ou impressão monocromática. Até lá, o PNG em fundo claro é a referência disponível. [V4]
- **Ícones de instalação.** `frontend/assets/icon.png`, `frontend/assets/splash-icon.png`, `frontend/assets/favicon.png` e os arquivos adaptativos Android existem na base integrada. Seus usos são técnicos. A revisão não confirmou esses arquivos como variações oficiais do logo para impressão. [V4]
- **Astery.** A branch Sobre usa assinatura tipográfica com “Produtos de Software”. Não identifiquei logotipo vetorial ou manual de marca da Astery no material consultado. Solicitar o arquivo oficial se a assinatura visual for necessária. [P6, T11]
- **Formas e ilustrações.** O guia descreve quatro formas abstratas das fases: uma forma contida na menstrual, uma expansão ascendente na folicular, um volume orgânico pleno na ovulatória e uma dobra suave na lútea. Essas são diretrizes de representação. Na branch de contatos existem PNGs próprios com transparência. Inspecionei visualmente as artes menstrual e folicular. Para o folder, usar cada arte com o nome da fase e respeitar a função visual. As formas são metáforas da interface. Evitar sugerir que cada fase produz uma emoção, sintoma ou experiência universal. A proposta documental de morphing vetorial não deve ser usada como prova de que o mesmo efeito está em produção. [P5, V5]
- **Iconografia.** A biblioteca é Phosphor. O guia recomenda traços leves e variantes de peso para estados. Para arte impressa, confirmar a licença da biblioteca e dos arquivos usados, manter tamanho e traço consistentes e colocar um rótulo visível quando o ícone comunicar informação. [P5, V3]

### 5.4 Tom de voz

**Documentado.** Inclusão, acolhimento e neutralidade de gênero aparecem na Visão e no guia. A tela Sobre em branch articula autoconhecimento, inclusão, privacidade e acolhimento. [P1, P5, T11]

**Aplicação editorial sugerida.** Escrever como quem orienta uma tarefa. Preferir “registre”, “consulte” e “reveja”, mencionar “pessoas que menstruam” e usar “pessoa de confiança” no exemplo de convite. Explicar estimativas em termos de dados disponíveis e evitar a ideia de “ciclo ideal”. Em material voltado a quem encontra o produto pela primeira vez, dizer o que é o Aloya antes de citar a Astery.

| Preferir | Evitar |
| --- | --- |
| “Consulte as datas que você registrou.” | “Tenha controle total do seu ciclo.” |
| “Veja estimativas das fases.” | “Descubra exatamente quando você ovula.” |
| “Convide alguém de confiança, se quiser.” | “Monitore o ciclo de alguém.” |
| “Organize a programação do anticoncepcional.” | “Garanta sua proteção com nossos lembretes.” |
| “Pessoas que menstruam.” | Linguagem que presume gênero, relação ou intenção reprodutiva. |

### 5.5 Arquivos e telas a considerar na produção

| Material | Caminho e revisão | Uso editorial |
| --- | --- | --- |
| Logo do Aloya | `feature/sobre-aplicacao:frontend/assets/aloya-logo.png` | Capa, se aprovado para impressão. Usar a proporção original e conferir a resolução no tamanho final. |
| Arte das fases | `7e8d46ed:frontend/src/features/cycles/assets/phase-artwork/menstrual.png`, `follicular.png`, `ovulatory.png` e `luteal.png` na mesma pasta | Alternativa a uma terceira captura. Validar cada arquivo e origem antes de reproduzir. |
| Ilustração de estado vazio | `7e8d46ed:frontend/src/features/support-network/assets/cycle-without-data.png` | Referência interna. Reservar estados vazios para demonstração quando explicarem o fluxo. |
| Home / Início | `origin/develop:frontend/src/features/cycles/screens/CycleTodayScreen.jsx` e `components/home/CycleHomeContent.jsx` na mesma feature | Boa opção de primeira tela no estande. Use uma conta com cenário fictício e estado estável. |
| Calendário | `origin/develop:frontend/src/features/calendar/screens/CalendarScreen.jsx` e `frontend/src/features/calendar/components/CycleLegendSheet/CycleLegendSheet.jsx` | Primeira captura recomendada. Dá leitura imediata da finalidade. Mostrar registro e estimativa sem divulgar dado real. |
| Diário | `origin/develop:frontend/src/features/diary/screens/DiaryScreen.jsx` e `frontend/src/features/diary/DiaryFlow.jsx` | Segunda captura recomendada. Mostrar observação fictícia, simples e que não seja sobre dados íntimos. |
| Histórico | `origin/develop:frontend/src/features/cycles/screens/CycleHistoryScreen.jsx` | Alternativa quando o ponto principal for consulta ao longo do tempo. |
| Programação e confirmação | `origin/develop:frontend/src/features/contraceptives/screens/ContraceptiveTrackingScreen.jsx` | Boa tela para apresentação oral. Evitar identificar um medicamento real ou sugerir prescrição. |
| Rede de Apoio | `origin/develop:frontend/src/features/support-network/screens/MembersScreen.jsx` e `frontend/src/features/support-network/screens/ReceivedContactsScreen/ReceivedContactsScreen.jsx` | Mostrar convite ou vínculo só com contas fictícias. A visão de conteúdo compartilhado tem código na branch de contatos e exige aprovação específica. |
| Tela Sobre | `feature/sobre-aplicacao:frontend/src/features/about/screens/AboutScreen.jsx` | Referência para a abertura e a assinatura. Confirmar integração ao pacote antes de representar a tela como disponível. |
| Protótipo PDF | `Prototipação/Documento da Prototipação em PDF.pdf`, páginas 26–29 consultadas visualmente | Referência de composição. A antiga Home do PDF ajuda a comparar evolução. Preferir captura real para impressão. |

## 6. Proposta editorial de seis faces

A ordem abaixo é a ordem de leitura. A gráfica deve confirmar a imposição e a posição da aba no gabarito da dobra. Os limites de palavras são metas de edição. As descrições longas da seção 4 podem abastecer a conversa da equipe ou uma página posterior.

| Face | Posição e papel | Conteúdo recomendado | Extensão de partida | O que merece destaque |
| --- | --- | --- | --- | --- |
| **1** | Capa externa | Nome Aloya, título “Seu ciclo, em um só lugar” e a categoria “Aplicativo de acompanhamento menstrual”. Uma imagem ou o logo oficial autorizado. | 8–18 palavras | Identidade do produto e finalidade compreensível em poucos segundos. |
| **2** | Aba externa ou primeira descoberta | Problema humano em duas frases. Começar com a dificuldade de reunir datas e o que a pessoa percebe. Introduzir “registros, calendário e Diário”. | 35–55 palavras | Uma situação reconhecível. Evitar diagnóstico de mercado ou comparações. |
| **3** | Interior inicial | Acompanhamento menstrual. Mostrar calendário e histórico com um exemplo fictício. Se houver estimativa na captura, incluir a distinção visual e verbal. | 40–65 palavras mais legenda | A principal tarefa e um resultado fácil de ver. |
| **4** | Interior central | Diário como segundo pilar. Mostrar como anotar algo e encontrar a observação depois. Acrescentar um bloco curto sobre programação de anticoncepcionais se houver espaço. | 45–70 palavras | Experiência cotidiana, com linguagem concreta e sem mensagens íntimas em imagens. |
| **5** | Interior final | Rede de Apoio como opção. Descrever convite e permissões. Inserir um aviso curto de estimativas e finalidade informativa em área legível, especialmente se a peça mostrar fases ou janela. | 35–65 palavras | A palavra “opcional” e o controle de participação. Se a Rede não estiver demonstrável no pacote, dar o espaço a conteúdo educativo e ao aviso de saúde. |
| **6** | Contracapa | CTA “Veja o Aloya em ação”, contato validado, QR code com destino oficial se disponível e assinatura da Astery autorizada. | 15–40 palavras | Uma ação. Incluir ideia clara de onde falar com a equipe e alternativa legível ao QR code. |

### Prioridade do conteúdo

- **Principal.** O que é, para quem serve, calendário, histórico, Diário, limites das estimativas quando citadas e caminho para ver a demonstração.
- **Secundário.** Organização de anticoncepcionais, convite opcional, um exemplo de conteúdo educativo e identificação institucional. Escolher pela versão confirmada e pelo tempo de leitura.
- **Reservar à conversa.** Filtros do Diário, preferência de tema, funcionamento da fila, check-in e pausa guiada. São bons exemplos quando alguém pedir detalhes.
- **Omitir do impresso.** Parâmetros de algoritmo, detalhes de acesso técnico, dados ou campos íntimos, nomes individuais divergentes, preço permanente, cronograma não aprovado, detalhes jurídicos, métricas sem fonte, funcionalidades planejadas e capturas de conta real.

### Três leituras no estande

- **Até 10 segundos.** Capa, categoria e CTA.
- **Até 30 segundos.** Abertura, calendário ou Diário e uma frase sobre quem pode usar.
- **Até 90 segundos.** Conteúdo interno, breve demonstração, explicação de estimativas e escolha de convite quando a build permitir.

Escolher uma imagem principal por área de leitura. Em uma peça pequena, dois recortes legíveis podem comunicar mais que várias telas completas. Validar os recortes em tamanho real, com margens de segurança da dobra e contraste no papel. Esta distribuição é editorial. O design final fica para a produção gráfica.

## 7. Divergências, validações pendentes e acesso

### 7.1 Divergências e dados desatualizados

| Ponto | O que as fontes mostram | Decisão para este folder |
| --- | --- | --- |
| **Documentação de jornadas** | `docs/telas-endpoints.md` descreve Home, Calendário, Diário e Histórico ainda fora do roteamento. A develop atual conecta essas áreas no `App.js`. | Usar o código da develop para transições e situação dos fluxos. A matriz técnica antiga serve ao histórico. [T1] |
| **Requisitos em duas edições** | O arquivo do workspace tem 62 páginas. A cópia em Downloads tem 69. Ambas incluem intenções que precisam de confirmação na interface. | Consultar as duas como fontes de requisitos. Para estado implementado, prevalecem o código integrado e a confirmação do pacote. [P2] |
| **Rede compartilhada** | A Visão prevê consulta granular ampla. A develop confirma convites, respostas, vínculos e configuração. As telas e rotas de consulta ampliada foram encontradas na branch local de contatos. | Anunciar apenas a parte confirmada para o evento. Caso haja demo de branch, identificar a fase de desenvolvimento em fala ou legenda. [P1, T7, T8] |
| **Notificações e lembretes** | Há campos de intensidade e horário, um menu e visualizações relacionadas a eventos. Visão e Requisitos projetam experiência mais ampla. | Validar entrega com dispositivo e pacote antes de mencionar. Sem essa confirmação, usar “organize a sua programação”. [P1–P3, T6, T7] |
| **Modo offline e exportação** | A Visão descreve oferta mais ampla. O código comprova uma fila para registro menstrual, sem evidência de operação integral offline ou exportador pronto. | Omitir ambos como promessa de produto. [P1, P3, T2, T9] |
| **Dados de temperatura** | A análise de domínio propõe refinamento. A nota técnica da implementação descreve modo sombra sem efeito nas estimativas públicas. | Omitir a funcionalidade experimental do folder e manter as limitações de saúde. [P4, T9] |
| **Versão e distribuição** | Expo declara `1.0.0`, mas os estados Git observados e a configuração não comprovam o número da build ou a existência de lojas públicas. | Só imprimir versão, lojas ou selo de download depois de confirmar pacote e links. [T9] |
| **Gratuidade, chat e exportação** | São intenções ou requisitos documentados. As fontes de código não demonstram política permanente para os preços ou fluxos públicos operacionais de chat e exportação. | Omitir promessas e tratar planos como intenção se perguntarem. [P1–P3, T1, T9] |
| **Posicionamento e crédito individual** | A redação anterior traz “Seu ciclo, pelas suas próprias anotações.”. A branch Sobre traz “Conheça seu corpo. Respeite seu ritmo.” e uma grafia diferente para um dos créditos. | Aprovar um slogan para o evento. A assinatura da empresa pode ser usada após confirmação. Manter nomes individuais fora da peça até fechar grafia e autorização. [P6, T11] |
| **Guia de marca e assets** | Há diferenças entre os valores do guia e os tokens efetivos no escuro. As ilustrações PNG existem em branch, e a logo consultada está em raster. | Usar o guia para intenção, o código para reproduzir a tela e a arte mestre autorizada para impressão. [P5, V1, V4, V5] |
| **Privacidade e Termos** | A tela legal foi integrada à develop em regime de desenvolvimento. Os dados jurídicos das minutas seguem pendentes e autoria de software não determina papel jurídico. | Omitir alegações de conformidade, política vigente ou garantias absolutas. Só indicar destino jurídico público validado pela equipe. [T9, T11] |

### 7.2 Dúvidas prioritárias para a equipe

1. **Qual pacote será usado no evento?** Confirmar revisão, plataforma, número da build instalada, disponibilidade de conexão e responsável pela demonstração.
2. **A Rede será apresentada em qual nível?** Convites e permissões da develop, ou consultas compartilhadas da branch? Se consultas estiverem incluídas, confirmar telas liberadas, categorias, revogação e dois perfis de demonstração.
3. **Qual será o CTA único e seu destino?** Confirmar local do estande, endereço institucional, site oficial, cadastro de interesse ou links de loja. Validar QR code em papel e alternativa textual.
4. **Qual slogan e qual crédito ficam autorizados?** Confirmar a frase, assinatura “Astery · Produtos de Software”, grafia profissional dos créditos e eventual menção acadêmica.
5. **Quais imagens podem ser impressas?** Confirmar arquivo mestre do logo, variantes, direitos de uso das artes das fases e capturas da versão demonstrada. Usar contas e informações fictícias.
6. **Qual texto de saúde vai para a prova final?** Validar o aviso com os responsáveis por produto e conteúdo de saúde, especialmente se aparecerem datas, janela fértil ou termos sobre anticoncepção.
7. **Há confirmação de lembretes e suporte na build?** Testar entrega no aparelho, permissões e cancelamento se a equipe quiser comunicar alertas. Conferir se o canal vai receber mensagens durante e depois do evento.
8. **Quais informações comerciais ou de elegibilidade podem ser publicadas?** Confirmar política atual, canais de distribuição e regras gerais antes de citar gratuidade, disponibilidade pública ou idade.
9. **O folder vai circular após o evento?** Se sim, substituir referências exclusivamente presenciais por contato ou página cuja manutenção esteja definida.

### 7.3 Documentos ou recursos fora do acesso verificado

- **Arquivo editável do protótipo e biblioteca de componentes do Figma.** A consulta usou o PDF exportado. Sem um arquivo editável ou link autorizado verificável nesta investigação, não pude confirmar a versão de design em edição.
- **Materiais de release e prova da build do evento.** Não foram fornecidos pacote oficial, versão instalada, roteiro final, comprovantes de aprovação de lojas ou links oficiais de instalação.
- **Arquivos mestres de marca.** Não localizei versão vetorial aprovada do Aloya, manual de aplicações impressas, variantes oficiais de logo ou arquivo mestre da Astery. O PNG do Aloya e o guia PDF estavam acessíveis.
- **Pesquisa de mercado e resultados de produto.** Não foram localizados benchmark comparativo validado, métricas de adoção, estudos de uso final ou avaliação clínica própria da versão demonstrada.
- **Decisões operacionais e regulatórias vigentes.** Sem acesso ao plano comercial vigente, aprovação final de alegações de saúde, autorização de créditos divergentes e aprovação dos documentos legais. Minutas e investigações anteriores estavam acessíveis.

## 8. Índice de evidências

Os caminhos com revisão Git podem ser consultados usando `git show revisão:caminho` no repositório. Links Markdown apontam para documentos locais verificados. As linhas abaixo identificam os principais caminhos examinados, com prioridade a interfaces de entrada, pontos de ligação e regras de negócio.

| ID | Fonte e caminhos | Sustenta |
| --- | --- | --- |
| **P1** | [V1 Documento de Visão, pp. 4–11](<C:/Users/kayla/Documentos/Aloya Project/Requisitos/V1_ Documento de Visão.pdf>) | Problema, posicionamento, públicos, quatro pilares, escolhas de privacidade, proposta relativa à concorrência e intenções de oferta. |
| **P2** | [V1 Documento de Requisitos, 62 páginas](<C:/Users/kayla/Documentos/Aloya Project/Requisitos/V1_ Documento de Requisitos.pdf>) · [Requisitos, 69 páginas](<C:/Users/kayla/Downloads/Requisitos.pdf>) | Jornada pretendida, épicos e divergência entre edições. |
| **P3** | [V1 Especificação de Casos de Uso](<C:/Users/kayla/Documentos/Aloya Project/Requisitos/V1_ Especificação de Casos de Uso.pdf>) · [Documentos Base](<C:/Users/kayla/Downloads/Documentos Base.pdf>) | Intenção de fluxo, regras de negócio, escopo clínico e capacidades planejadas. |
| **P4** | [Análise do Ciclo Menstrual, pp. 4 e 8–12](<C:/Users/kayla/Documentos/Aloya Project/Análise de Domínio/Análise do Ciclo Menstrual.pdf>) · [Revisão científica anterior](<C:/Users/kayla/Documentos/Aloya Project/ALOYA_VALIDACAO_CIENTIFICA_SAUDE_MENSTRUAL.md>) | Base da proposta de estimativas, diferenciação entre regra de produto e evidência clínica, limites da temperatura. |
| **P5** | [Documento de Identidade Visual, pp. 4–11](<C:/Users/kayla/Documentos/Aloya Project/Prototipação/Documento de Identidade Visual.pdf>) · [Protótipo em PDF, pp. 26–29](<C:/Users/kayla/Documentos/Aloya Project/Prototipação/Documento da Prototipação em PDF.pdf>) | Conceito visual, tokens documentais, Phosphor, DM Sans, formas e composições de referência. |
| **P6** | [Identidade consolidada](<C:/Users/kayla/Documentos/Aloya Project/ALOYA_SOBRE_APLICACAO_IDENTIDADE_CONSOLIDADA.md>) · [Conteúdo final anterior](<C:/Users/kayla/Documentos/Aloya Project/ALOYA_SOBRE_APLICACAO_CONTEUDO_FINAL.md>) · [Revisão editorial](<C:/Users/kayla/Documentos/Aloya Project/ALOYA_SOBRE_APLICACAO_REVISAO_EDITORIAL.md>) · [Revisão jurídica anterior](<C:/Users/kayla/Documentos/Aloya Project/ALOYA_REVISAO_DOCUMENTOS_LEGAIS.md>) | Histórico de autoria, critérios de redação e limites institucionais. |
| **T1** | `origin/develop:README.md`, `docs/telas-endpoints.md`, `frontend/App.js`, `frontend/src/App.js`, `frontend/src/features/auth/screens/WelcomeScreen.jsx`, `frontend/src/features/onboarding/screens/OnboardingScreen.jsx` | Descrição pública registrada, entrada e jornada, diferenças entre documentação e navegação. |
| **T2** | `origin/develop:frontend/src/features/calendar/screens/CalendarScreen.jsx`, `frontend/src/features/calendar/components/CycleLegendSheet/CycleLegendSheet.jsx`, `frontend/src/features/cycles/screens/MenstruationRegistrationScreen.jsx`, `frontend/src/features/cycles/CycleHistoryFlow.jsx`, `frontend/src/features/cycles/screens/CycleHistoryScreen.jsx`, `backend/src/features/cycles/routes/cycleHistory.routes.js` | Calendário, legenda, registro menstrual e histórico. |
| **T3** | `origin/develop:frontend/src/features/cycles/components/home/CyclePredictionSummary.jsx`, `frontend/src/features/cycles/components/sheets/CycleConfidenceSheet.jsx`, `backend/src/features/cycles/services/prediction.service.js`, `backend/src/features/cycles/utils/prediction.confidence.js` | Estimativas, condições e significado do grau de confiabilidade. |
| **T4** | `origin/develop:frontend/src/features/diary/DiaryFlow.jsx`, `frontend/src/features/diary/screens/DiaryScreen.jsx`, `frontend/src/features/diary/utils/diaryFilters.js`, `frontend/src/features/diary/services/diaryService.js`, `backend/src/features/diary/routes/diary.routes.js` | Criação, consulta, edição e remoção de registros e filtros do Diário. |
| **T5** | `origin/develop:frontend/src/features/cycles/components/home/CycleHomeContent.jsx`, `frontend/src/features/cycles/components/CycleDiaryCheckIn.jsx`, `frontend/src/features/cycles/components/CycleEducationSection.jsx`, `frontend/src/features/cycles/components/sheets/CycleHomeSheets.jsx`, `frontend/src/features/cycles/components/sheets/GuidedBreathingSheet.jsx`, `frontend/src/features/cycles/constants/phaseContent.js` | Integração da Home com educação, check-in, reflexão e pausa. |
| **T6** | `origin/develop:frontend/src/features/contraceptives/ContraceptiveFlow.jsx`, `frontend/src/features/contraceptives/screens/ContraceptiveTrackingScreen.jsx`, `frontend/src/features/contraceptives/forms/ContraceptiveForm.jsx`, `frontend/src/features/contraceptives/forms/AlertIntensitySelector.jsx`, `backend/src/features/contraceptives/routes/contraceptiveUsage.routes.js` | Cadastro, edição, programação, registro de uso manual e limites dos alertas. |
| **T7** | `origin/develop:frontend/src/features/support-network/screens/MembersScreen.jsx`, `frontend/src/features/support-network/screens/ReceivedContactsScreen/ReceivedContactsScreen.jsx`, `frontend/src/features/support-network/utils/age.js`, `backend/src/features/support-network/services/contactInvitation.service.js`, `backend/src/features/support-network/services/contactLink.service.js`, `backend/src/features/support-network/services/permissionCategory.service.js`, `backend/src/features/support-network/services/supportContactRemoval.service.js` | Convites, vínculos, autorizações, permissões e papéis do fluxo integrado. |
| **T8** | `7e8d46ed:frontend/src/App.js`, `frontend/src/features/support-network/screens/SharedSupportFlow/SharedSupportFlow.jsx`, `frontend/src/features/support-network/testing/SharedSupportPreview.jsx`, `backend/src/features/support-network/routes/sharedSupport.routes.js`, `backend/src/features/support-network/services/sharedSupportAccess.service.js`, `backend/src/features/support-network/services/sharedSupportDiary.service.js`, `backend/prisma/migrations/20261126220000_persistir_check_in_diario/migration.sql` | Consulta compartilhada e persistência complementar do check-in na branch. |
| **T9** | `origin/develop:frontend/app.json`, `frontend/eas.json`, `frontend/src/features/legal/data/legalConfig.js`, `frontend/src/features/cycles/hooks/useMenstruationSync.js`, `frontend/src/features/cycles/services/menstruationSyncQueue.js`, `docs/motor-termico-modo-sombra.md`, `docs/motor-termico-validacao.md` | Alvos do Expo, suporte, minutas restritas, fila menstrual e modo sombra. |
| **T10** | `origin/develop:frontend/src/features/settings/screens/SettingsScreen.jsx`, `frontend/src/features/settings/screens/ProfileSettingsScreen.jsx`, `frontend/src/features/settings/providers/ThemePreferenceProvider.jsx` | Preferências, aparência e gerenciamento da conta. |
| **T11** | `feature/sobre-aplicacao:frontend/src/features/about/data/aboutContent.js`, `frontend/src/features/about/screens/AboutScreen.jsx`, `frontend/src/features/about/components/AboutVersion/AboutVersion.jsx` | Posição editorial mais recente da branch, crédito Astery, textos de saúde e leitura da versão instalada. |
| **V1** | `origin/develop:frontend/src/shared/theme/colors.js`, `frontend/src/shared/theme/themePalettes.js` | Identidade cromática utilizada. |
| **V2** | `origin/develop:frontend/src/shared/theme/typography.js`, `frontend/src/shared/theme/spacing.js`, `frontend/src/shared/theme/radius.js`, `frontend/src/App.js` | Tipografia, pesos, espaçamento e raios. |
| **V3** | `origin/develop:frontend/src/shared/components/icons/AppIcons.js`, `frontend/package.json` e as telas de T2, T4, T5 e T7 | Iconografia e componentes observáveis. |
| **V4** | `feature/sobre-aplicacao:frontend/assets/aloya-logo.png`, `frontend/src/features/about/components/AboutEditorial/AboutEditorial.jsx` e `origin/develop:frontend/assets/` | Logo empregado na apresentação e distinção dos ícones de instalação. |
| **V5** | `7e8d46ed:frontend/src/features/cycles/assets/phase-artwork/`, `frontend/src/features/cycles/components/home/CyclePhaseArtwork.jsx`, `frontend/src/features/cycles/components/home/CyclePhaseFrame.jsx` | Quatro artes e associação implementada a fases na branch de contatos. |

**Fechamento.** Para a primeira prova, usar categoria, calendário, Diário, uma explicação curta das estimativas e um convite para ver a demonstração. Com pacote e destino confirmados, decidir quanto espaço dar à Rede e à organização de anticoncepcionais. Separar a validação gráfica da validação de oferta e saúde. Assim, a peça pode ser curta sem perder fidelidade ao produto.
