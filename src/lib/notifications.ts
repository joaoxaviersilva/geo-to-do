// Notificações locais (disparadas pelo próprio app, sem servidor).
import * as Notifications from 'expo-notifications';

// No iOS, por padrão a notificação NÃO aparece com o app aberto.
// Este handler manda mostrar banner e tocar som mesmo em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pede permissão ao usuário. Retorna true se foi concedida.
export async function pedirPermissaoNotificacao(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const nova = await Notifications.requestPermissionsAsync();
  return nova.granted;
}

// Dispara uma notificação imediata (trigger: null = agora)
export async function notificarTarefa(titulo: string) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: 'Você chegou ao local desta tarefa!' },
    trigger: null,
  });
}
