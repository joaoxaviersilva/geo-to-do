// Armazenamento local das tarefas usando AsyncStorage.
// Todas as tarefas ficam salvas como um array JSON numa única chave.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Task = {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  radius: number; // raio da geofence em metros
  done: boolean; // tarefa concluída?
  notified: boolean; // já avisamos o usuário? (começa false)
};

const CHAVE = 'tasks';

// Lista todas as tarefas salvas
export async function listTasks(): Promise<Task[]> {
  const texto = await AsyncStorage.getItem(CHAVE);
  return texto ? (JSON.parse(texto) as Task[]) : [];
}

// Grava a lista inteira (função interna)
async function gravar(tasks: Task[]) {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(tasks));
}

// Cria e salva uma nova tarefa
export async function saveTask(
  dados: Pick<Task, 'title' | 'latitude' | 'longitude' | 'radius'>
): Promise<Task> {
  const nova: Task = {
    ...dados,
    id: Date.now().toString(), // id simples baseado no horário
    done: false,
    notified: false,
  };
  const tasks = await listTasks();
  await gravar([...tasks, nova]);
  return nova;
}

// Atualiza campos de uma tarefa existente (ex.: { done: true })
export async function updateTask(id: string, mudancas: Partial<Omit<Task, 'id'>>) {
  const tasks = await listTasks();
  await gravar(tasks.map((t) => (t.id === id ? { ...t, ...mudancas } : t)));
}

// Apaga uma tarefa
export async function deleteTask(id: string) {
  const tasks = await listTasks();
  await gravar(tasks.filter((t) => t.id !== id));
}
