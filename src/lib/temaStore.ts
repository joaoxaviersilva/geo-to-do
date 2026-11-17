// Estado do tema compartilhado pelo app (mesmo padrão de posicao.ts: variável + ouvintes).
// O modo escolhido fica salvo no AsyncStorage; o resto vive só em memória.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Modo = 'auto' | 'claro' | 'escuro';
export type Fonte = 'Sensor de luz' | 'Brilho da tela' | 'Sistema' | 'Manual';

export type EstadoTema = {
  modo: Modo;
  escuroAuto: boolean | null; // decisão do automático (null = ainda sem leitura)
  fonte: Fonte; // de onde vem o tema agora
  leitura: string; // texto da leitura atual, ex.: "42 lux"
};

const CHAVE = 'tema_modo';
type Ouvinte = (e: EstadoTema) => void;

let estado: EstadoTema = { modo: 'auto', escuroAuto: null, fonte: 'Sistema', leitura: '' };
const ouvintes = new Set<Ouvinte>();

export function getTema() {
  return estado;
}

// Atualiza parte do estado e avisa quem estiver ouvindo
export function atualizarTema(parte: Partial<EstadoTema>) {
  estado = { ...estado, ...parte };
  ouvintes.forEach((fn) => fn(estado));
}

// Retorna uma função para cancelar a inscrição
export function ouvirTema(fn: Ouvinte) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}

// Troca o modo e salva no AsyncStorage
export async function setModo(modo: Modo) {
  atualizarTema({
    modo,
    // fora do automático a fonte é "Manual"; no automático o hook define a fonte
    ...(modo === 'auto' ? {} : { fonte: 'Manual' as Fonte, leitura: '' }),
  });
  await AsyncStorage.setItem(CHAVE, modo);
}

// Lê o modo salvo (chamado uma vez ao abrir o app)
export async function carregarModo() {
  const salvo = await AsyncStorage.getItem(CHAVE);
  if (salvo === 'auto' || salvo === 'claro' || salvo === 'escuro') {
    atualizarTema({
      modo: salvo,
      ...(salvo === 'auto' ? {} : { fonte: 'Manual' as Fonte }),
    });
  }
}
