// Superfície "Liquid Glass" (iOS 26) com visual antigo como reserva.
// Quando o vidro não existe (iPhone com iOS < 26, Android), vira um card comum.
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { sombra, useTema } from '../theme';

// Consultado uma vez só: o resultado não muda enquanto o app está aberto
export const temVidro = isLiquidGlassAvailable();

type Props = {
  style?: StyleProp<ViewStyle>; // layout, padding e borderRadius ficam com quem usa
  children?: ReactNode;
  interativo?: boolean; // brilho ao tocar (só no vidro)
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
};

export default function Vidro({ style, children, interativo = false, pointerEvents }: Props) {
  const { cores, escuro } = useTema();

  if (temVidro) {
    return (
      <GlassView
        glassEffectStyle="regular"
        // Força o vidro a seguir o tema do app (e não só o do sistema),
        // assim o texto continua legível sobre o mapa claro ou escuro
        colorScheme={escuro ? 'dark' : 'light'}
        isInteractive={interativo}
        pointerEvents={pointerEvents}
        style={style}
      >
        {children}
      </GlassView>
    );
  }

  // Reserva: o visual de antes (fundo sólido + sombra + borda fina)
  return (
    <View
      pointerEvents={pointerEvents}
      style={[
        { backgroundColor: cores.card, borderColor: cores.borda, borderWidth: StyleSheet.hairlineWidth },
        sombra(cores),
        style,
      ]}
    >
      {children}
    </View>
  );
}
