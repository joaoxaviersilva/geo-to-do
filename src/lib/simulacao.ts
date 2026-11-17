// SÓ PARA TESTE: posição falsa para testar sem andar.
// Quando ativa, o useGeofence usa esta posição no lugar do GPS.
type Posicao = { latitude: number; longitude: number };
type Ouvinte = (p: Posicao | null) => void;

let posicaoFalsa: Posicao | null = null;
const ouvintes = new Set<Ouvinte>();

export function getSimulacao() {
  return posicaoFalsa;
}

// Define (ou limpa, com null) a posição falsa e avisa quem estiver ouvindo
export function setSimulacao(p: Posicao | null) {
  posicaoFalsa = p;
  ouvintes.forEach((fn) => fn(p));
}

// Retorna uma função para cancelar a inscrição
export function ouvirSimulacao(fn: Ouvinte) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}
