// Guarda a última posição do GPS (preenchida pelo useGeofence) para que
// outras telas/componentes a reutilizem sem criar outro watchPositionAsync.
type Posicao = { latitude: number; longitude: number };
type Ouvinte = (p: Posicao) => void;

let ultima: Posicao | null = null;
const ouvintes = new Set<Ouvinte>();

export function getUltimaPosicao() {
  return ultima;
}

// Salva a posição e avisa quem estiver ouvindo
export function setUltimaPosicao(p: Posicao) {
  ultima = p;
  ouvintes.forEach((fn) => fn(p));
}

// Retorna uma função para cancelar a inscrição
export function ouvirPosicao(fn: Ouvinte) {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}
