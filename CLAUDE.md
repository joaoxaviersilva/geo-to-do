# Geo-To-Do
App Expo + React Native + TypeScript. Tarefas atreladas a locais no mapa; notifica ao entrar no raio.

## Stack
expo-router, react-native-maps (Marker, Circle), expo-location, expo-notifications, expo-sensors (LightSensor), @react-native-async-storage/async-storage. Instalar com `npx expo install`.

## Requisitos do professor
1. Mapa: escolher o local tocando no mapa; Circle mostra o raio (geofence).
2. Notificação local ao entrar no perímetro. Usar polling em primeiro plano (watchPositionAsync), sem geofencing nativo em segundo plano.
3. Card na tela inicial com as 3 tarefas pendentes mais próximas da posição atual.
4. Tema: teste em iPhone (Expo Go), onde o LightSensor não funciona. Por enquanto, seguir o tema do sistema + botão manual claro/escuro. Alternativa automática (LightSensor só no Android ou outra) fica para decidir depois.

## Regras
- Testar com Expo Go; evitar libs que exijam build nativo.
- Código simples e comentado em português, fácil de explicar numa apresentação.
- Uma etapa por vez: ao terminar, dizer como testar e PARAR.
- Não instalar dependências fora da lista sem perguntar.
- Respostas curtas; não reimprimir arquivos inteiros.
- Estrutura: app/ (telas), src/components/, src/lib/ (distância Haversine, storage, notificações).
- Interface em português. Rodar com: npx expo start
