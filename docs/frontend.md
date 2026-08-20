# Aloya — Frontend

## 1. O que é o frontend?

Frontend é a parte do sistema com a qual o usuário interage diretamente.

No Aloya, o frontend é um aplicativo mobile desenvolvido com **React Native** e **Expo**.

---

# 2. React Native

React Native é uma tecnologia que permite desenvolver aplicativos para dispositivos móveis utilizando React.

Em vez de desenvolver separadamente:

```text
Android → Kotlin/Java
iOS     → Swift
```

é possível utilizar React Native para compartilhar grande parte do código.

---

# 3. Expo

Expo é um conjunto de ferramentas que facilita o desenvolvimento com React Native.

Ele fornece ferramentas para:

* iniciar projetos;
* executar o aplicativo;
* testar no celular;
* utilizar recursos nativos;
* gerar builds;
* configurar o projeto.

---

# 4. Criação do projeto

O frontend foi criado utilizando:

```bash
npx create-expo-app@latest frontend --template blank
```

Esse comando cria um projeto Expo utilizando um template básico.

Depois da criação:

```bash
cd frontend
```

Para iniciar:

```bash
npx expo start
```

---

# 5. Estrutura

A estrutura planejada para o frontend é:

```text
frontend/
│
├── assets/
│
├── components/
│
├── screens/
│
├── navigation/
│
├── services/
│
├── hooks/
│
├── contexts/
│
├── constants/
│
├── utils/
│
├── App.js
│
└── package.json
```

---

# 6. `assets/`

Contém arquivos utilizados visualmente pelo aplicativo.

Exemplo:

```text
assets/
├── images/
├── icons/
└── fonts/
```

Pode conter:

* imagens;
* ícones;
* fontes;
* logos;
* ilustrações.

---

# 7. `components/`

Contém componentes reutilizáveis.

Exemplo:

```text
components/
├── Button/
├── Input/
├── Header/
├── Card/
└── CyclePhaseCard/
```

Um componente deve ser criado aqui quando puder ser utilizado em diferentes partes do aplicativo.

---

# 8. `screens/`

Contém as telas completas do aplicativo.

Exemplo:

```text
screens/
├── Login/
├── Register/
├── Home/
├── Cycle/
└── Profile/
```

Uma tela normalmente combina vários componentes.

Exemplo:

```text
HomeScreen
│
├── Header
├── CyclePhaseCard
├── CycleInfo
└── SymptomCard
```

---

# 9. `navigation/`

Responsável pela navegação entre telas.

Exemplo:

```text
Login
 ↓
Home
 ↓
Cycle
 ↓
Profile
```

A navegação também poderá separar áreas autenticadas e não autenticadas.

```text
             App
              │
       ┌──────┴──────┐
       │             │
    Auth           App
  Navigator      Navigator
       │             │
   Login          Home
   Register       Cycle
                  Profile
```

---

# 10. `services/`

Responsável pela comunicação com o backend.

Exemplo:

```text
services/
├── api.js
├── authService.js
├── cycleService.js
└── communityService.js
```

Por exemplo:

```javascript
await cycleService.getCurrentCycle();
```

O componente não precisa saber como a requisição HTTP funciona internamente.

---

# 11. `hooks/`

Contém hooks personalizados.

Hooks podem ser utilizados para reutilizar lógica entre componentes.

Exemplo:

```text
hooks/
├── useAuth.js
└── useCycle.js
```

---

# 12. `contexts/`

Pode ser utilizado para informações que precisam ser compartilhadas por várias partes do aplicativo.

Exemplo:

```text
contexts/
└── AuthContext.js
```

O contexto de autenticação pode armazenar informações como:

* usuário atual;
* estado de login;
* token;
* funções de login/logout.

---

# 13. `utils/`

Contém funções auxiliares.

Exemplo:

```text
utils/
├── formatDate.js
├── validation.js
└── calculations.js
```

---

# 14. `constants/`

Contém valores utilizados em várias partes do aplicativo.

Exemplo:

```text
constants/
├── colors.js
├── routes.js
└── cycle.js
```

---

# 15. Regra de organização

Antes de criar uma nova função ou componente, deve-se verificar se ele:

* já existe;
* pode ser reutilizado;
* pertence a uma tela específica;
* deve ser uma função auxiliar;
* precisa ser compartilhado globalmente.

O objetivo é evitar código duplicado.

---

# 16. Fluxo do frontend

```text
Usuário
   ↓
Screen
   ↓
Component
   ↓
Service
   ↓
API
```

Quando recebe uma resposta:

```text
API
 ↓
Service
 ↓
Screen / State
 ↓
Component
 ↓
Usuário
```

---