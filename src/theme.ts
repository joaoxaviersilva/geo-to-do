// Tema do app: cores claras/escuras, espaçamentos, raios e tipografia.
// Todas as telas pegam as cores daqui (nada de cor solta no código).
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getTema, ouvirTema } from './lib/temaStore';

// Paleta clara
const claro = {
  fundo: '#F4F5F7',
  card: '#FFFFFF',
  texto: '#111827',
  textoSec: '#6B7280',
  destaque: '#4F46E5', // única cor de destaque do app
  sobreDestaque: '#FFFFFF', // texto/ícone sobre fundo de destaque
  perigo: '#DC2626',
  borda: '#E5E7EB',
  simulacao: '#F59E0B', // posição simulada (modo teste)
  sombra: '#000000',
};

// Paleta escura (mesmas chaves)
const escuro: typeof claro = {
  fundo: '#0B0D12',
  card: '#171A22',
  texto: '#F3F4F6',
  textoSec: '#9CA3AF',
  destaque: '#6366F1',
  sobreDestaque: '#FFFFFF',
  perigo: '#F87171',
  borda: '#2A2F3A',
  simulacao: '#FBBF24',
  sombra: '#000000',
};

export type Cores = typeof claro;

// Espaçamentos e cantos arredondados
export const espaco = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const raios = { sm: 10, md: 16, lg: 24, pill: 999 };

// Tamanho mínimo de toque recomendado no iPhone
export const ALVO_TOQUE = 44;

// Hierarquia de tipografia
export const fonte = {
  titulo: { fontSize: 20, fontWeight: '700' as const },
  subtitulo: { fontSize: 16, fontWeight: '600' as const },
  corpo: { fontSize: 16, fontWeight: '400' as const },
  legenda: { fontSize: 13, fontWeight: '500' as const },
};

// Sombra suave (iOS usa shadow*, Android usa elevation)
export function sombra(cores: Cores) {
  return {
    shadowColor: cores.sombra,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  };
}

// Cor com transparência: comAlpha('#4F46E5', 0.2). Usada no preenchimento do Circle.
export function comAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// Hook do tema. Combina o modo escolhido no app (temaStore) com o tema do sistema:
// Claro/Escuro = fixo; Automático = decisão da luz ambiente (ou sistema, se não houver leitura).
export function useTema() {
  const sistema = useColorScheme();
  const [estado, setEstado] = useState(getTema());
  useEffect(() => ouvirTema(setEstado), []);

  let escuroAtivo: boolean;
  if (estado.modo === 'escuro') escuroAtivo = true;
  else if (estado.modo === 'claro') escuroAtivo = false;
  else escuroAtivo = estado.escuroAuto ?? sistema === 'dark';

  // "fonte" mostra de onde vem o tema; sem leitura ainda, é o sistema
  const fonte = estado.modo === 'auto' && estado.escuroAuto === null ? 'Sistema' : estado.fonte;
  return {
    escuro: escuroAtivo,
    cores: escuroAtivo ? escuro : claro,
    modo: estado.modo,
    fonte,
    leitura: estado.leitura,
  };
}
