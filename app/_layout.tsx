// Layout raiz: define a navegação (Stack) do app.
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useGeofence } from '../src/lib/useGeofence';
import { useTema } from '../src/theme';
import { useTemaAutomatico } from '../src/lib/useTemaAutomatico';

export default function RootLayout() {
  // Monitora a proximidade das tarefas em todas as telas
  useGeofence();
  // Carrega o modo de tema salvo e liga o automático (sensor de luz / brilho)
  useTemaAutomatico();
  const { cores, escuro } = useTema();

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: cores.card },
          headerTintColor: cores.destaque, // botão de voltar
          headerTitleStyle: { color: cores.texto },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: cores.fundo },
        }}
      >
        {/* Mapa em tela cheia: sem cabeçalho, os botões flutuantes ficam no topo */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Tarefas: cabeçalho próprio na tela (botão de voltar igual ao do mapa) */}
        <Stack.Screen name="tarefas" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
