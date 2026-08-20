# Aloya — Componentes

## 1. O que é um componente?

Um componente é uma parte reutilizável da interface.

Por exemplo, um botão aparece em várias telas.

Em vez de criar um botão completamente diferente em cada tela, criamos um componente:

```text
Button
```

E reutilizamos:

```jsx
<Button title="Entrar" />

<Button title="Continuar" />

<Button title="Salvar" />
```

---

# 2. Componentes x telas

É importante diferenciar os dois.

### Componente

Representa uma parte da interface.

Exemplo:

```text
Button
Card
Input
Header
```

### Tela

Representa uma página completa do aplicativo.

Exemplo:

```text
LoginScreen
HomeScreen
CycleScreen
ProfileScreen
```

Uma tela pode utilizar vários componentes.

---

# 3. Estrutura recomendada

Cada componente pode possuir sua própria pasta:

```text
components/
└── Button/
    ├── Button.jsx
    └── styles.js
```

Outro exemplo:

```text
components/
└── CyclePhaseCard/
    ├── CyclePhaseCard.jsx
    └── styles.js
```

---

# 4. Documentação dos componentes

Cada componente importante deve ser documentado com:

### Nome

Nome do componente.

### Objetivo

Para que ele existe?

### Localização

Onde está no projeto?

### Props

Quais informações recebe?

### Comportamento

O que acontece quando o usuário interage?

### Utilização

Exemplo de código.

---

# 5. Modelo

```text
## Nome do componente

### Objetivo

Descrição.

### Localização

components/Nome/

### Props

| Prop | Tipo | Obrigatória | Descrição |
|---|---|---|---|
| title | string | Sim | Texto |

### Exemplo

Código de utilização.

### Observações

Informações importantes.
```

---

# 6. Props

Props são informações passadas de um componente para outro.

Exemplo:

```jsx
<Button title="Salvar" />
```

Nesse caso:

```text
title
```

é uma prop.

Outro exemplo:

```jsx
<Button
  title="Salvar"
  disabled={false}
/>
```

O componente recebe duas informações:

```text
title
disabled
```

---

# 7. Componentes planejados

> **TODO:** Atualizar conforme os componentes forem criados.

```text
components/
├── Button
├── Input
├── Header
├── Card
├── CyclePhaseCard
├── SymptomCard
├── Calendar
└── BottomNavigation
```

---

# 8. Reutilização

Um componente deve ser reutilizado quando possuir uma função genérica.

Por exemplo:

```text
Button
```

pode ser usado em:

```text
Login
Cadastro
Perfil
Ciclo
Comunidade
```

Isso reduz duplicação de código e facilita alterações futuras.

---

# 9. Evitando componentes gigantes

Uma tela não deve conter toda a interface em um único arquivo.

Evitar:

```text
HomeScreen.jsx
└── 800 linhas
```

Preferir:

```text
HomeScreen
├── Header
├── CyclePhaseCard
├── CycleInfo
├── SymptomCard
└── BottomNavigation
```

Isso facilita leitura e manutenção.

---