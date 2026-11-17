// Card com as 3 tarefas pendentes mais próximas da posição atual.
// O posicionamento fica por conta da tela (aqui só o visual do card).
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { distanciaMetros } from '../lib/distance';
import type { Task } from '../lib/storage';
import { ALVO_TOQUE, espaco, fonte, raios, useTema } from '../theme';
import Vidro, { temVidro } from './Vidro';

type Props = {
  tarefas: Task[];
  posicao: { latitude: number; longitude: number };
  aoEscolher: (t: Task) => void; // chamado ao tocar num item
};

// "120 m" abaixo de 1 km; "1,4 km" a partir daí
function formatarDistancia(metros: number) {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toFixed(1).replace('.', ',')} km`;
}

export default function CardProximas({ tarefas, posicao, aoEscolher }: Props) {
  const { cores } = useTema();
  // Sobre o vidro, o cinza fica fraco contra o mapa: usa a cor principal do texto
  const corSec = temVidro ? cores.texto : cores.textoSec;

  // Recalcula quando as tarefas ou a posição mudam
  const proximas = useMemo(
    () =>
      tarefas
        .filter((t) => !t.done)
        .map((t) => ({
          tarefa: t,
          dist: distanciaMetros(posicao.latitude, posicao.longitude, t.latitude, t.longitude),
        }))
        .sort((a, b) => a.dist - b.dist) // do mais perto ao mais longe
        .slice(0, 3),
    [tarefas, posicao]
  );

  return (
    <Vidro style={styles.card}>
      <Text style={[fonte.legenda, styles.cabecalho, { color: corSec }]}>MAIS PRÓXIMAS</Text>

      {proximas.length === 0 ? (
        <Text style={[fonte.corpo, styles.vazio, { color: corSec }]}>Nenhuma tarefa pendente</Text>
      ) : (
        proximas.map(({ tarefa, dist }, i) => (
          <Pressable
            key={tarefa.id}
            onPress={() => aoEscolher(tarefa)}
            style={({ pressed }) => [
              styles.item,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: cores.borda },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="location" size={20} color={cores.destaque} />
            <Text style={[fonte.subtitulo, styles.nome, { color: cores.texto }]} numberOfLines={1}>
              {tarefa.title}
            </Text>
            <Text style={[fonte.legenda, { color: cores.destaque, fontSize: 14 }]}>{formatarDistancia(dist)}</Text>
          </Pressable>
        ))
      )}
    </Vidro>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: raios.lg, paddingHorizontal: espaco.lg, paddingVertical: espaco.md },
  cabecalho: { letterSpacing: 0.8, marginBottom: espaco.xs },
  vazio: { paddingVertical: espaco.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: ALVO_TOQUE, // alvo de toque confortável
  },
  nome: { flex: 1 },
});
