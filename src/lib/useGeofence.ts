// Hook de proximidade: enquanto o app está aberto, confere a distância até
// cada tarefa pendente e notifica ao entrar no raio (uma vez só).
import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { distanciaMetros } from './distance';
import { notificarTarefa, pedirPermissaoNotificacao } from './notifications';
import { setUltimaPosicao } from './posicao';
import { getSimulacao, ouvirSimulacao } from './simulacao';
import { listTasks, updateTask } from './storage';

type Posicao = { latitude: number; longitude: number };

export function useGeofence() {
  useEffect(() => {
    let ativo = true;
    let assinatura: Location.LocationSubscription | null = null;
    let ultima: Posicao | null = null; // última posição conhecida (GPS ou simulada)
    let verificando = false; // evita duas verificações ao mesmo tempo

    // Compara a posição com cada tarefa pendente
    async function verificar() {
      const pos = getSimulacao() ?? ultima; // posição falsa tem prioridade
      if (!pos || verificando) return;
      verificando = true;
      try {
        const tarefas = await listTasks();
        for (const t of tarefas) {
          if (t.done) continue;
          const dist = distanciaMetros(pos.latitude, pos.longitude, t.latitude, t.longitude);
          const dentro = dist <= t.radius;

          if (dentro && !t.notified) {
            // Entrou no raio: marca antes de notificar para não repetir
            await updateTask(t.id, { notified: true });
            await notificarTarefa(t.title);
            console.log(`[geofence] entrou: ${t.title} (${Math.round(dist)} m)`);
          } else if (!dentro && t.notified) {
            // Saiu do raio: libera para notificar de novo na próxima entrada
            await updateTask(t.id, { notified: false });
            console.log(`[geofence] saiu: ${t.title}`);
          }
        }
      } finally {
        verificando = false;
      }
    }

    (async () => {
      const loc = await Location.requestForegroundPermissionsAsync();
      const notif = await pedirPermissaoNotificacao();
      if (!notif) {
        // Sem permissão o aviso de chegada não aparece: avisa o usuário uma vez
        Alert.alert('Notificações desativadas', 'Ative as notificações do app nas configurações para ser avisado ao chegar nos locais.');
      }
      if (loc.status !== 'granted' || !ativo) return;

      // GPS contínuo: precisão alta, novo ponto a cada ~10 m
      assinatura = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10 },
        (l) => {
          ultima = { latitude: l.coords.latitude, longitude: l.coords.longitude };
          setUltimaPosicao(ultima); // compartilha com o card da tela inicial
          verificar();
        }
      );
      if (!ativo) assinatura.remove();
    })();

    // Reverifica a cada 5 s com a última posição: pega tarefas criadas
    // com o usuário parado e mudanças da posição simulada.
    const timer = setInterval(verificar, 5000);
    const parar = ouvirSimulacao(() => verificar());

    // Limpeza ao desmontar
    return () => {
      ativo = false;
      assinatura?.remove();
      clearInterval(timer);
      parar();
    };
  }, []);
}
