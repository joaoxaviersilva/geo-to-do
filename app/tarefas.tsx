// Tela de lista de tarefas: marcar como feita e apagar.
// Visual igual ao da tela do mapa: mesmos tokens (theme.ts) e mesmo BotaoRedondo.
import { useCallback, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BotaoRedondo from '../src/components/BotaoRedondo';
import { deleteTask, listTasks, updateTask, type Task } from '../src/lib/storage';
import { ALVO_TOQUE, espaco, fonte, raios, sombra, useTema, type Cores } from '../src/theme';

// "1 pendente" / "3 pendentes", "1 concluída" / "2 concluídas"
function plural(n: number, singular: string, pluralTxt: string) {
  return `${n} ${n === 1 ? singular : pluralTxt}`;
}

export default function Tarefas() {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = criarEstilos(cores);
  const [tarefas, setTarefas] = useState<Task[]>([]);

  // Carrega a lista toda vez que a tela abre
  const carregar = useCallback(() => {
    listTasks().then(setTarefas);
  }, []);
  useFocusEffect(carregar);

  // Volta para o mapa (se não houver tela anterior, abre o mapa direto)
  function irParaMapa() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  // Marca/desmarca como feita e recarrega a lista
  async function alternarFeita(t: Task) {
    await updateTask(t.id, { done: !t.done });
    carregar();
  }

  // Pede confirmação antes de apagar
  function confirmarApagar(t: Task) {
    Alert.alert('Apagar tarefa?', `"${t.title}" será removida e não poderá ser recuperada.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(t.id);
          carregar();
        },
      },
    ]);
  }

  // Separa em duas seções (só mostra a seção se tiver itens)
  const pendentes = tarefas.filter((t) => !t.done);
  const concluidas = tarefas.filter((t) => t.done);
  const secoes = [
    { titulo: 'Pendentes', data: pendentes },
    { titulo: 'Concluídas', data: concluidas },
  ].filter((s) => s.data.length > 0);

  return (
    <View style={styles.tela}>
      {/* Cabeçalho próprio, respeitando a safe area (igual aos botões flutuantes do mapa) */}
      <View style={[styles.cabecalho, { paddingTop: insets.top + espaco.sm }]}>
        <BotaoRedondo icone="chevron-back" rotulo="Voltar ao mapa" onPress={irParaMapa} flutuante />
        <Text style={styles.titulo}>Tarefas</Text>
        <Text style={styles.subtitulo}>
          {plural(pendentes.length, 'pendente', 'pendentes')} · {plural(concluidas.length, 'concluída', 'concluídas')}
        </Text>
      </View>

      <SectionList
        sections={secoes}
        keyExtractor={(t) => t.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={[styles.lista, { paddingBottom: insets.bottom + espaco.xl }]}
        // Cabeçalho de cada seção, no mesmo estilo do "MAIS PRÓXIMAS"
        renderSectionHeader={({ section }) => (
          <Text style={styles.secao}>{section.titulo.toUpperCase()}</Text>
        )}
        // Estado vazio amigável
        ListEmptyComponent={
          <View style={styles.vazio}>
            <View style={styles.vazioIcone}>
              <Ionicons name="location" size={36} color={cores.destaque} />
            </View>
            <Text style={styles.vazioTitulo}>Nenhuma tarefa por aqui</Text>
            <Text style={styles.vazioTexto}>Toque no mapa para escolher um local e criar sua primeira tarefa.</Text>
            <Pressable
              onPress={irParaMapa}
              accessibilityRole="button"
              style={({ pressed }) => [styles.vazioBotao, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="map" size={18} color={cores.sobreDestaque} />
              <Text style={styles.vazioBotaoTexto}>Criar tarefa no mapa</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          // Concluídas ficam mais discretas (opacidade menor + texto riscado)
          <View style={[styles.card, sombra(cores), item.done && styles.cardFeita]}>
            <View style={styles.cardTopo}>
              <Ionicons name="location" size={20} color={item.done ? cores.textoSec : cores.destaque} />
              <View style={styles.info}>
                <Text style={[styles.nome, item.done && styles.nomeFeita]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.detalhe}>Raio de {item.radius} m</Text>
              </View>
            </View>

            <View style={styles.acoes}>
              <Pressable
                style={({ pressed }) => [styles.btn, item.done ? styles.btnDesfazer : styles.btnOk, pressed && { opacity: 0.7 }]}
                onPress={() => alternarFeita(item)}
                accessibilityRole="button"
              >
                <Ionicons
                  name={item.done ? 'arrow-undo' : 'checkmark'}
                  size={18}
                  color={item.done ? cores.texto : cores.sobreDestaque}
                />
                <Text style={[styles.btnTexto, { color: item.done ? cores.texto : cores.sobreDestaque }]}>
                  {item.done ? 'Desfazer' : 'Feita'}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.btn, styles.btnApagar, pressed && { opacity: 0.7 }]}
                onPress={() => confirmarApagar(item)}
                accessibilityRole="button"
              >
                <Ionicons name="trash-outline" size={18} color={cores.perigo} />
                <Text style={[styles.btnTexto, { color: cores.perigo }]}>Apagar</Text>
              </Pressable>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: espaco.md }} />}
        SectionSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
      />
    </View>
  );
}

// Estilos dependem das cores do tema, por isso ficam numa função
function criarEstilos(c: Cores) {
  return StyleSheet.create({
    tela: { flex: 1, backgroundColor: c.fundo },

    // Cabeçalho: botão de voltar, título grande e contador
    cabecalho: { paddingHorizontal: espaco.lg, paddingBottom: espaco.md, gap: espaco.xs },
    titulo: { ...fonte.titulo, fontSize: 32, color: c.texto, marginTop: espaco.md },
    subtitulo: { ...fonte.corpo, color: c.textoSec },

    lista: { paddingHorizontal: espaco.lg, paddingTop: espaco.sm, flexGrow: 1 },
    secao: { ...fonte.legenda, letterSpacing: 0.8, color: c.textoSec, marginTop: espaco.lg },

    // Card de cada tarefa (mesmo visual do card "Mais próximas" sem vidro)
    card: {
      backgroundColor: c.card,
      borderColor: c.borda,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: raios.lg,
      padding: espaco.lg,
      gap: espaco.md,
    },
    cardFeita: { opacity: 0.6 },
    cardTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
    info: { flex: 1, gap: 2 },
    nome: { ...fonte.subtitulo, color: c.texto },
    nomeFeita: { textDecorationLine: 'line-through', color: c.textoSec },
    detalhe: { ...fonte.legenda, color: c.textoSec },

    // Botões Feita/Desfazer e Apagar (altura mínima de 44 para tocar fácil)
    acoes: { flexDirection: 'row', gap: espaco.sm },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: espaco.xs,
      minHeight: ALVO_TOQUE,
      borderRadius: raios.md,
    },
    btnOk: { backgroundColor: c.destaque },
    btnDesfazer: { borderWidth: 1, borderColor: c.borda },
    btnApagar: { borderWidth: 1, borderColor: c.perigo },
    btnTexto: { ...fonte.subtitulo },

    // Estado vazio
    vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.md, paddingVertical: 64, paddingHorizontal: espaco.xl },
    vazioIcone: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.card,
      borderColor: c.borda,
      borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    vazioTitulo: { ...fonte.titulo, color: c.texto },
    vazioTexto: { ...fonte.corpo, color: c.textoSec, textAlign: 'center' },
    vazioBotao: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaco.sm,
      minHeight: 48,
      paddingHorizontal: espaco.xl,
      borderRadius: raios.md,
      backgroundColor: c.destaque,
      marginTop: espaco.sm,
    },
    vazioBotaoTexto: { ...fonte.subtitulo, color: c.sobreDestaque },
  });
}
