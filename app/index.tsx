// Tela inicial - Etapa 2: mapa, escolha de local, salvar tarefas e mostrar as salvas.
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Circle, Marker, type LatLng, type MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ALVO_TOQUE, comAlpha, espaco, fonte, raios, sombra, useTema, type Cores } from '../src/theme';
import BotaoRedondo from '../src/components/BotaoRedondo';
import { listTasks, saveTask, type Task } from '../src/lib/storage';
import { setSimulacao } from '../src/lib/simulacao';
import { getUltimaPosicao, ouvirPosicao } from '../src/lib/posicao';
import SeletorTema from '../src/components/SeletorTema';
import CardProximas from '../src/components/CardProximas';
import Vidro, { temVidro } from '../src/components/Vidro';

const RAIO_MIN = 50;
const RAIO_MAX = 500;
const PASSO = 50;

export default function Home() {
  const { cores, escuro } = useTema();
  const insets = useSafeAreaInsets(); // áreas ocupadas por Dynamic Island/barra inferior
  const router = useRouter();
  const styles = criarEstilos(cores);
  const corSec = temVidro ? cores.texto : cores.textoSec; // cinza some no vidro; usa texto principal

  // Posição atual do usuário (null enquanto carrega)
  const [posicao, setPosicao] = useState<LatLng | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Local escolhido tocando no mapa
  const [alvo, setAlvo] = useState<LatLng | null>(null);
  // Raio da geofence em metros
  const [raio, setRaio] = useState(100);
  // Título digitado para a nova tarefa
  const [titulo, setTitulo] = useState('');
  // Tarefas salvas (só as pendentes aparecem no mapa)
  const [tarefas, setTarefas] = useState<Task[]>([]);
  // Modo teste: posição falsa definida com toque longo no mapa
  const [modoTeste, setModoTeste] = useState(false);
  const [posFalsa, setPosFalsa] = useState<LatLng | null>(null);

  // Última posição do GPS (compartilhada pelo useGeofence, sem novo watch)
  const [gps, setGps] = useState<LatLng | null>(getUltimaPosicao());
  const mapaRef = useRef<MapView>(null);

  // Atualiza o estado sempre que o useGeofence recebe um ponto novo do GPS
  useEffect(() => ouvirPosicao(setGps), []);

  // Posição usada no card: simulada (modo teste) > GPS > posição inicial
  const posAtual = posFalsa ?? gps ?? posicao;

  // Toque num item do card: centraliza o mapa na tarefa
  function irParaTarefa(t: Task) {
    mapaRef.current?.animateToRegion(
      { latitude: t.latitude, longitude: t.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 },
      500
    );
  }

  // Liga/desliga o modo teste (ao desligar, volta a usar o GPS)
  function alternarModoTeste() {
    if (modoTeste) {
      setSimulacao(null);
      setPosFalsa(null);
    }
    setModoTeste(!modoTeste);
  }

  // Toque longo (só no modo teste): "teletransporta" o usuário para o ponto
  function aoSegurarNoMapa(e: { nativeEvent: { coordinate: LatLng } }) {
    if (!modoTeste) return;
    setPosFalsa(e.nativeEvent.coordinate);
    setSimulacao(e.nativeEvent.coordinate);
  }

  // Recarrega as tarefas sempre que a tela do mapa ganha foco
  // (assim, ao voltar da lista, o mapa já mostra as mudanças)
  useFocusEffect(
    useCallback(() => {
      listTasks().then(setTarefas);
    }, [])
  );

  // Ao abrir: pede permissão e pega a localização atual
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErro('Permissão de localização negada. Ative nas configurações do iPhone.');
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        setPosicao({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch {
        // GPS desligado ou sem sinal: mostra aviso em vez de ficar carregando para sempre
        setErro('Não foi possível obter a localização. Verifique se o GPS está ligado.');
      }
    })();
  }, []);

  // Toque no mapa: define o local da tarefa
  function aoTocarNoMapa(e: MapPressEvent) {
    setAlvo(e.nativeEvent.coordinate);
  }

  // Salva a tarefa com o local tocado e o raio atual
  async function salvar() {
    if (!alvo || !titulo.trim()) return;
    await saveTask({
      title: titulo.trim(),
      latitude: alvo.latitude,
      longitude: alvo.longitude,
      radius: raio,
    });
    setTarefas(await listTasks()); // atualiza o mapa
    setAlvo(null); // limpa o marcador temporário
    setTitulo('');
    Keyboard.dismiss();
  }

  // Ajusta o raio respeitando os limites (50 a 500 m)
  function mudarRaio(delta: number) {
    setRaio((r) => Math.min(RAIO_MAX, Math.max(RAIO_MIN, r + delta)));
  }

  if (erro) {
    return (
      <View style={styles.centro}>
        <Ionicons name="location-outline" size={40} color={cores.textoSec} />
        <Text style={styles.textoCentro}>{erro}</Text>
      </View>
    );
  }

  if (!posicao) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.destaque} />
        <Text style={styles.textoCentro}>Obtendo localização...</Text>
      </View>
    );
  }

  const pendentes = tarefas.filter((t) => !t.done);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapaRef}
        style={StyleSheet.absoluteFill}
        userInterfaceStyle={escuro ? 'dark' : 'light'}
        initialRegion={{
          ...posicao,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        onPress={aoTocarNoMapa}
        onLongPress={aoSegurarNoMapa}
      >
        {/* Tarefas pendentes já salvas: Marker com título + Circle do raio (cor de destaque) */}
        {pendentes.map((t) => (
          <Fragment key={t.id}>
            <Marker
              coordinate={{ latitude: t.latitude, longitude: t.longitude }}
              title={t.title}
              pinColor={cores.destaque}
            />
            <Circle
              center={{ latitude: t.latitude, longitude: t.longitude }}
              radius={t.radius}
              strokeWidth={2}
              strokeColor={comAlpha(cores.destaque, 0.9)}
              fillColor={comAlpha(cores.destaque, 0.2)}
            />
          </Fragment>
        ))}

        {/* Posição simulada (modo teste): outra cor */}
        {posFalsa && <Marker coordinate={posFalsa} title="Posição simulada" pinColor={cores.simulacao} />}

        {/* Marcador temporário do ponto que o usuário acabou de tocar */}
        {alvo && (
          <>
            <Marker coordinate={alvo} pinColor={cores.destaque} />
            {/* Circle mostra o raio da geofence em metros (tracejado = ainda não salvo) */}
            <Circle
              center={alvo}
              radius={raio}
              strokeWidth={2}
              lineDashPattern={[8, 6]}
              strokeColor={cores.destaque}
              fillColor={comAlpha(cores.destaque, 0.12)}
            />
          </>
        )}
      </MapView>

      {/* Botões flutuantes do topo: respeitam a área segura (Dynamic Island/barra de status) */}
      <View style={[styles.topo, { top: insets.top + espaco.sm }]} pointerEvents="box-none">
        <BotaoRedondo
          flutuante
          icone={modoTeste ? 'flask' : 'flask-outline'}
          rotulo={modoTeste ? 'Desligar modo teste' : 'Ligar modo teste'}
          ativo={modoTeste}
          corAtiva={cores.simulacao}
          onPress={alternarModoTeste}
        />

        {/* Aviso do modo teste, no meio entre os dois botões */}
        <View style={styles.topoMeio} pointerEvents="none">
          {modoTeste && (
            <View style={[styles.aviso, sombra(cores)]}>
              <Text style={styles.avisoTexto} numberOfLines={2}>
                Modo teste: segure no mapa para simular a posição
              </Text>
            </View>
          )}
        </View>

        {/* Coluna da direita: lista de tarefas e seletor de tema (Automático/Claro/Escuro) */}
        <View style={styles.direita} pointerEvents="box-none">
          <BotaoRedondo
            flutuante
            icone="list"
            rotulo={`Lista de tarefas, ${pendentes.length} pendentes`}
            selo={pendentes.length}
            onPress={() => router.push('/tarefas')}
          />
          <SeletorTema />
        </View>
      </View>

      {/* Parte de baixo: bottom sheet de nova tarefa OU card das mais próximas (nunca sobrepostos) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // Flutua acima da borda: 16 de respiro + área segura (barra home do iPhone).
        // Usa "bottom" e não paddingBottom, porque o KeyboardAvoidingView sobrescreve o paddingBottom
        style={[styles.baixo, { bottom: insets.bottom + espaco.lg }]}
        pointerEvents="box-none"
      >
        {alvo ? (
          <Vidro style={styles.sheet}>
            <View style={styles.sheetCabecalho}>
              <Text style={styles.sheetTitulo}>Nova tarefa</Text>
              <Pressable
                onPress={() => {
                  setAlvo(null);
                  setTitulo('');
                  Keyboard.dismiss();
                }}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Cancelar nova tarefa"
                style={styles.fechar}
              >
                <Ionicons name="close" size={22} color={corSec} />
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="O que você precisa fazer aqui?"
              placeholderTextColor={cores.textoSec}
              value={titulo}
              onChangeText={setTitulo}
              returnKeyType="done"
            />

            {/* Controle do raio: − / valor / + */}
            <View style={styles.raioLinha}>
              <Text style={styles.raioRotulo}>Raio</Text>
              <View style={styles.raioControle}>
                <BotaoRedondo icone="remove" rotulo="Diminuir raio" onPress={() => mudarRaio(-PASSO)} />
                <Text style={styles.raioValor}>{raio} m</Text>
                <BotaoRedondo icone="add" rotulo="Aumentar raio" onPress={() => mudarRaio(PASSO)} />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.salvar,
                !titulo.trim() && styles.salvarOff,
                pressed && { opacity: 0.8 },
              ]}
              onPress={salvar}
              disabled={!titulo.trim()}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark" size={20} color={cores.sobreDestaque} />
              <Text style={styles.salvarTexto}>Salvar tarefa</Text>
            </Pressable>
          </Vidro>
        ) : (
          <>
            {/* Dica de uso, só quando não há local escolhido */}
            <Vidro style={styles.dica}>
              <Ionicons name="hand-left-outline" size={16} color={corSec} />
              <Text style={styles.dicaTexto}>Toque no mapa para escolher o local</Text>
            </Vidro>
            {posAtual && <CardProximas tarefas={tarefas} posicao={posAtual} aoEscolher={irParaTarefa} />}
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

// Estilos dependem das cores do tema, por isso ficam numa função
function criarEstilos(c: Cores) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.fundo },
    centro: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espaco.xl,
      gap: espaco.md,
      backgroundColor: c.fundo,
    },
    textoCentro: { ...fonte.corpo, color: c.texto, textAlign: 'center' },

    // Linha do topo: botão | aviso | botão
    topo: {
      position: 'absolute',
      left: espaco.lg,
      right: espaco.lg,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: espaco.md,
    },
    topoMeio: { flex: 1, alignItems: 'center' },
    direita: { gap: espaco.md, alignItems: 'flex-end' },
    aviso: {
      backgroundColor: c.simulacao,
      borderRadius: raios.md,
      paddingVertical: espaco.sm,
      paddingHorizontal: espaco.md,
    },
    avisoTexto: { ...fonte.legenda, color: '#111827', textAlign: 'center' },

    // Área de baixo: empilha dica + card (ou o sheet), sempre sem sobrepor
    baixo: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: espaco.lg,
      gap: espaco.md,
    },
    dica: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.sm,
      borderRadius: raios.pill,
      paddingVertical: espaco.sm,
      paddingHorizontal: espaco.lg,
    },
    // Sobre o vidro usa a cor principal do texto, para ler bem em cima do mapa
    dicaTexto: { ...fonte.legenda, color: temVidro ? c.texto : c.textoSec },

    // Bottom sheet de nova tarefa (fundo vem do componente Vidro)
    sheet: {
      borderRadius: raios.lg,
      padding: espaco.lg,
      gap: espaco.md,
    },
    sheetCabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sheetTitulo: { ...fonte.titulo, color: c.texto },
    fechar: {
      width: ALVO_TOQUE,
      height: ALVO_TOQUE,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -espaco.sm,
    },
    input: {
      ...fonte.corpo,
      color: c.texto,
      backgroundColor: c.fundo,
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: raios.md,
      paddingHorizontal: espaco.lg,
      minHeight: 52,
    },
    raioLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    raioRotulo: { ...fonte.subtitulo, color: c.texto },
    raioControle: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
    raioValor: { ...fonte.titulo, color: c.texto, minWidth: 72, textAlign: 'center' },
    salvar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: espaco.sm,
      backgroundColor: c.destaque,
      borderRadius: raios.md,
      minHeight: 52,
    },
    salvarOff: { opacity: 0.4 },
    salvarTexto: { ...fonte.subtitulo, color: c.sobreDestaque },
  });
}
