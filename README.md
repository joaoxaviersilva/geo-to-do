# Geo-To-Do

Lista de tarefas ligadas a locais no mapa: o app avisa com uma notificação quando você entra no raio de uma tarefa.

![Expo](https://img.shields.io/badge/Expo-58-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)

## Sobre o projeto

Listas de tarefas comuns não sabem *onde* você está. O Geo-To-Do resolve isso associando cada tarefa a um ponto do mapa e a um raio (geofence). Ao se aproximar do local, por exemplo a farmácia ou o mercado, o app dispara uma notificação lembrando do que você precisa fazer ali.

O projeto foi desenvolvido com Expo e React Native em TypeScript, pensado para rodar no **Expo Go**, sem necessidade de build nativo. Todos os dados ficam no próprio aparelho; não há servidor nem conta de usuário.

## Funcionalidades

- **Mapa e geofence:** toque no mapa para escolher o local da tarefa; um círculo (`Circle`) mostra o raio, ajustável de 50 a 500 m em passos de 50 m.
- **Notificações por proximidade:** notificação local ao entrar no raio de uma tarefa pendente, sem repetir enquanto você permanecer dentro dele.
- **Card das 3 tarefas mais próximas:** na tela inicial, com a distância até cada uma; tocar em um item centraliza o mapa na tarefa.
- **Lista de tarefas:** marcar como feita (ou desfazer) e apagar.
- **Tema automático por luz:** o tema claro/escuro acompanha a luz ambiente; também é possível fixar Claro ou Escuro manualmente.
- **Modo teste/simulação:** simula a posição do usuário com um toque longo no mapa, sem precisar sair andando.
- **Persistência local:** tarefas e modo de tema são salvos no aparelho com AsyncStorage.
- **Interface moderna:** efeito "Liquid Glass" em iOS 26 ou superior, com visual de cartão comum como alternativa nos demais aparelhos.

## Tecnologias

| Tecnologia | Versão | Uso no projeto |
| --- | --- | --- |
| [Expo](https://expo.dev) | ~58.0 | Plataforma e ferramentas de desenvolvimento (Expo Go) |
| [React Native](https://reactnative.dev) / React | 0.88 / 19.3 | Interface do aplicativo |
| TypeScript | ~6.0 | Tipagem estática |
| expo-router | ~58.0 | Navegação baseada em arquivos (telas em `app/`) |
| react-native-maps | 1.29.11 | Mapa, `Marker` e `Circle` (raio da geofence) |
| expo-location | ~58.0 | Permissão de localização, posição atual e `watchPositionAsync` |
| expo-notifications | ~58.1 | Notificações locais ao entrar no raio |
| expo-sensors | ~58.0 | `LightSensor` (luz ambiente no Android) |
| expo-brightness | ~58.0 | Brilho da tela como aproximação da luz ambiente no iOS |
| @react-native-async-storage/async-storage | 2.2.0 | Persistência local das tarefas e do modo de tema |
| expo-glass-effect | ~58.0 | Efeito "Liquid Glass" nos painéis (iOS 26+) |
| @expo/vector-icons | ^15.0 | Ícones (Ionicons) |
| react-native-safe-area-context | ~5.11 | Respeito às áreas seguras (notch, barra inferior) |

O `package.json` inclui outras dependências do template do Expo (por exemplo `react-native-reanimated` e `react-native-screens`) que dão suporte à navegação e ao ambiente, mas não são usadas diretamente pelo código do app.

## Pré-requisitos e instalação

**Pré-requisitos**

- [Node.js](https://nodejs.org) (versão LTS) e npm
- Aplicativo **Expo Go** instalado no celular (iOS ou Android)
- Celular e computador na mesma rede Wi-Fi

**Passo a passo**

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio>
cd pj_pam

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npx expo start
```

Escaneie o QR code exibido no terminal: no iPhone, com a câmera; no Android, pelo próprio app Expo Go. Ao abrir, aceite as permissões de localização e de notificações.

**Se a rede bloquear a conexão** (redes de faculdade ou públicas costumam isolar os dispositivos), use o modo túnel:

```bash
npx expo start --tunnel
```

O túnel usa o `@expo/ngrok`, já listado nas dependências de desenvolvimento do projeto.

## Como usar

1. **Criar uma tarefa:** toque no mapa para escolher o local. Aparece o painel "Nova tarefa" com um marcador e um círculo tracejado.
2. **Ajustar o raio:** use os botões **−** e **+** do painel (50 a 500 m) e veja o círculo mudar no mapa.
3. **Salvar:** digite o título e toque em "Salvar tarefa". O círculo passa a ser contínuo, indicando uma tarefa salva.
4. **Receber o alerta:** com o app aberto, ao entrar no raio de uma tarefa pendente o app mostra uma notificação com o título da tarefa.
5. **Ver as mais próximas:** o card "Mais próximas" mostra até 3 tarefas pendentes ordenadas por distância; toque em uma para ir até ela no mapa.
6. **Concluir a tarefa:** toque no botão de lista (canto superior direito), depois em "Feita". Tarefas concluídas deixam de aparecer no mapa e no card, e não geram notificação. Também é possível desfazer ou apagar.
7. **Trocar o tema:** toque no botão de tema (canto superior direito) e escolha Automático, Claro ou Escuro. O painel indica a fonte da decisão (Sensor de luz, Brilho da tela, Sistema ou Manual) e a leitura atual.
8. **Usar o modo teste:** toque no botão de frasco (canto superior esquerdo) para ligar o modo teste. Segure o dedo no mapa para "teletransportar" a posição para aquele ponto; ao cair dentro do raio de uma tarefa, a notificação é disparada. Para sair, desligue o modo teste e o app volta a usar o GPS real.

## Estrutura de pastas

```
app/                      Telas (expo-router)
├── _layout.tsx           Navegação; inicia o geofence e o tema automático
├── index.tsx             Mapa, nova tarefa, card das próximas, modo teste
└── tarefas.tsx           Lista de tarefas (concluir e apagar)
src/
├── components/
│   ├── BotaoRedondo.tsx  Botão circular reutilizável (com selo opcional)
│   ├── CardProximas.tsx  Card com as 3 tarefas pendentes mais próximas
│   ├── SeletorTema.tsx   Botão e painel Automático / Claro / Escuro
│   └── Vidro.tsx         Superfície "Liquid Glass" com alternativa para outros aparelhos
├── lib/
│   ├── distance.ts       Distância entre dois pontos (Haversine)
│   ├── storage.ts        Tipo Task e CRUD das tarefas no AsyncStorage
│   ├── notifications.ts  Permissão e disparo de notificações locais
│   ├── useGeofence.ts    Monitoramento de proximidade em primeiro plano
│   ├── posicao.ts        Última posição do GPS compartilhada entre telas
│   ├── simulacao.ts      Posição falsa do modo teste
│   ├── temaStore.ts      Estado e persistência do modo de tema
│   └── useTemaAutomatico.ts  Leitura de luz e decisão do tema automático
└── theme.ts              Paletas, espaçamentos, tipografia e hook useTema
```

## Como funciona

### Distância (Haversine)

`src/lib/distance.ts` calcula a distância em metros entre duas coordenadas (latitude/longitude) pela fórmula de Haversine, considerando a Terra como uma esfera de raio 6.371 km. Ela é usada tanto para decidir se o usuário está dentro do raio (`distância <= raio`) quanto para ordenar as tarefas no card das mais próximas.

### Verificação por polling em primeiro plano

O hook `useGeofence` (ativado em `_layout.tsx`) pede as permissões e usa `watchPositionAsync`, do `expo-location`, com precisão alta e novo ponto a cada ~10 m. A cada nova posição, e também a cada 5 segundos com a última posição conhecida, o app compara a posição com cada tarefa pendente. A reverificação periódica captura tarefas criadas com o usuário parado e mudanças da posição simulada. Não é usado geofencing nativo: a checagem só acontece com o app aberto. A posição do GPS é compartilhada via `posicao.ts`, de modo que o card da tela inicial não precisa abrir outro `watchPositionAsync`.

### Controle de notificação repetida (`notified`)

Cada tarefa tem o campo `notified` (começa em `false`). Ao entrar no raio com `notified = false`, o app grava `notified = true` e só então dispara a notificação, evitando duplicatas. Ao sair do raio, o campo volta a `false`, liberando um novo aviso na próxima entrada. Tarefas concluídas são ignoradas.

### Tema automático com histerese

No modo Automático, `useTemaAutomatico` escolhe a fonte de luz disponível, nesta ordem:

1. **LightSensor** (Android): leitura em lux, com média das últimas 3 amostras. Escurece abaixo de 50 lux e clareia acima de 150 lux.
2. **Brilho da tela** (iOS): com o "Brilho automático" ligado, o iOS ajusta o brilho conforme a luz do ambiente. O app lê o brilho a cada 2 s, com a mesma média de amostras. Escurece abaixo de 30% e clareia acima de 50%.
3. **Tema do sistema**, se nenhuma das anteriores estiver disponível.

Entre os dois limites, o tema atual é mantido (histerese), o que evita que a interface fique alternando entre claro e escuro. O modo escolhido (Automático, Claro ou Escuro) é salvo no AsyncStorage e restaurado ao abrir o app.

### Modo teste

Com o modo teste ligado, o toque longo no mapa grava uma posição falsa em `simulacao.ts`. O `useGeofence` dá prioridade a essa posição no lugar do GPS, e o card também a utiliza, o que permite testar entrada e saída do raio sem se deslocar. Ao desligar o modo, a simulação é limpa.

## Limitações conhecidas

- **Sem geofencing em segundo plano:** as notificações só funcionam com o app aberto em primeiro plano, pois a verificação é feita por polling. Essa escolha mantém o projeto compatível com o Expo Go.
- **LightSensor apenas no Android:** no iOS o sensor de luz não é acessível ao app (nem no Expo Go); o tema automático usa o brilho da tela como aproximação, que depende do "Brilho automático" estar ligado. Os limiares de brilho (30% e 50%) devem ser calibrados no aparelho.
- **Não é um widget nativo de tela inicial:** o "card" das tarefas mais próximas existe dentro do app, na tela do mapa.
- **Dados apenas locais:** não há sincronização nem backup das tarefas.

## Autores

- Andrei Carneiro
- João Victor Xavier
- Renan Rezaghi
- Rodrigo Rocha
